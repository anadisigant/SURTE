import { useEffect, useState, useMemo } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, FileText, TrendingUp, Users } from "lucide-react";
import api from "../services/api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Paleta cíclica para as barras de área (número de meses é dinâmico agora)
const PALETA_MESES = [
  "var(--surte-azul-primario)",
  "var(--surte-laranja-principal)",
  "var(--surte-amarelo-destaque)",
  "var(--surte-marrom)",
];

// Converte o formato "longo" que a API retorna (uma linha por área+mês)
// para o formato "largo" que o Recharts precisa (uma linha por área,
// com uma coluna por mês). Também devolve a lista de meses encontrados,
// na ordem em que apareceram, para montar as <Bar> e colunas dinamicamente.
function pivotAreasPorMes(areasLongFormato) {
  const mapaAreas = new Map();
  const meses = [];

  areasLongFormato.forEach(({ area, mes, total }) => {
    if (!meses.includes(mes)) meses.push(mes);
    if (!mapaAreas.has(area)) mapaAreas.set(area, { area });
    mapaAreas.get(area)[mes] = total;
  });

  return { linhas: Array.from(mapaAreas.values()), meses };
}

// Função pura, fora do componente: não depende de closures do useEffect.
// Recebe os dados atuais como parâmetro sempre que é chamada.
function exportPdf(participacoes, areasLongFormato) {
  const doc = new jsPDF();

  // Cabeçalho
  doc.setFontSize(16);
  doc.text("Relatório Geral", 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 14, 24);

  let cursorY = 32;

  // Tabela: Participações por mês
  if (participacoes.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Participações por Mês", 14, cursorY);

    autoTable(doc, {
      startY: cursorY + 4,
      head: [["Mês", "Total"]],
      body: participacoes.map((p) => [p.mes, p.total]),
      theme: "striped",
      headStyles: { fillColor: [30, 64, 175] }, // azul
      margin: { left: 14, right: 14 },
    });

    cursorY = doc.lastAutoTable.finalY + 12;
  } else {
    doc.setFontSize(10);
    doc.text("Nenhum dado de participações disponível.", 14, cursorY);
    cursorY += 10;
  }

  // Tabela: Evolução por área (colunas de mês dinâmicas, não mais fixas em Abril/Maio)
  if (areasLongFormato.length > 0) {
    const { linhas, meses } = pivotAreasPorMes(areasLongFormato);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Evolução por Área", 14, cursorY);

    autoTable(doc, {
      startY: cursorY + 4,
      head: [["Área", ...meses]],
      body: linhas.map((r) => [r.area, ...meses.map((m) => r[m] ?? 0)]),
      theme: "striped",
      headStyles: { fillColor: [234, 88, 12] }, // laranja
      margin: { left: 14, right: 14 },
    });
  } else {
    doc.setFontSize(10);
    doc.text("Nenhum dado de áreas disponível.", 14, cursorY);
  }

  doc.save("relatorio_geral.pdf");
}

// Rótulos de coluna amigáveis por chave de dado.
const COLUNAS_LABEL = {
  mes: "Mês",
  total: "Total de Participações",
  area: "Área",
};

// Colunas que existem no dado bruto mas não fazem sentido no CSV
// (são só metadado interno usado para filtrar/ordenar).
const COLUNAS_OCULTAS = ["data_referencia"];

function rotuloColuna(chave) {
  if (COLUNAS_LABEL[chave]) return COLUNAS_LABEL[chave];
  return chave.charAt(0).toUpperCase() + chave.slice(1);
}

// Escapa um valor para CSV: coloca entre aspas se contiver separador,
// aspas ou quebra de linha, e duplica aspas internas.
function escaparCampoCsv(valor) {
  const texto = valor === null || valor === undefined ? "" : String(valor);
  if (/[;"\n\r]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

function exportExcel(data, name) {
  if (!data || data.length === 0) {
    alert("Não há dados para exportar.");
    return;
  }

  const colunas = Object.keys(data[0]).filter((c) => !COLUNAS_OCULTAS.includes(c));
  const cabecalho = colunas.map((c) => rotuloColuna(c)).join(";");
  const linhas = data.map((row) =>
    colunas.map((c) => escaparCampoCsv(row[c])).join(";")
  );

  // Adiciona uma linha de totais quando existe uma coluna numérica "total"
  let linhaTotais = "";
  if (colunas.includes("total")) {
    const soma = data.reduce((acc, row) => acc + (row.total || 0), 0);
    const totais = colunas.map((c) => {
      if (c === colunas[0]) return "Total";
      if (c === "total") return soma;
      return "";
    });
    linhaTotais = "\n" + totais.map(escaparCampoCsv).join(";");
  }

  // BOM (\ufeff) garante que o Excel reconheça UTF-8 e exiba acentos corretamente.
  const csv = "\ufeff" + [cabecalho, ...linhas].join("\n") + linhaTotais;

  const timestamp = new Date().toISOString().slice(0, 10); // AAAA-MM-DD
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${name}_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Mapeia cada opção do seletor "Tipo de Relatório" para os datasets
// disponíveis hoje via /relatorios. "Programas" ainda não tem endpoint
// próprio (existe o modelo no backend, mas /relatorios não o expõe).
const TIPO_DATASETS = {
  Entrevistados: { participacoes: true, areas: false },
  Participações: { participacoes: true, areas: false },
  Programas: { participacoes: false, areas: false },
  Completo: { participacoes: true, areas: true },
};

// Busca os relatórios na API, opcionalmente filtrados por período.
// O filtro agora acontece no servidor -- o frontend só repassa as datas.
async function buscarRelatorios(dataInicio, dataFim) {
  const params = {};
  if (dataInicio) params.data_inicio = dataInicio;
  if (dataFim) params.data_fim = dataFim;

  const response = await api.get("/relatorios", { params });
  return {
    participacoes: response.data.participacoes || [],
    areas: response.data.areas || [],
  };
}

export default function Relatorios() {
  const [dadosParticipacoes, setDadosParticipacoes] = useState([]);
  const [dadosAreas, setDadosAreas] = useState([]); // formato longo, como vem da API
  const [loading, setLoading] = useState(true);

  // Estado do formulário de relatório personalizado
  const [filtroTipo, setFiltroTipo] = useState("Completo");
  const [filtroDataInicial, setFiltroDataInicial] = useState("");
  const [filtroDataFinal, setFiltroDataFinal] = useState("");
  const [filtroFormato, setFiltroFormato] = useState("PDF");
  const [erroFiltro, setErroFiltro] = useState("");
  const [gerando, setGerando] = useState(false);

  // Estado do preview (guarda os dados já buscados/filtrados no servidor)
  const [previewAberto, setPreviewAberto] = useState(false);
  const [previewCarregando, setPreviewCarregando] = useState(false);
  const [previewDados, setPreviewDados] = useState({ participacoes: [], areas: [] });

  // Carrega os dados sem filtro para os gráficos e cards do topo
  useEffect(() => {
    buscarRelatorios()
      .then(({ participacoes, areas }) => {
        setDadosParticipacoes(participacoes);
        setDadosAreas(areas);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao obter dados de relatórios:", error);
        setLoading(false);
      });
  }, []);

  // Pivota o formato longo de áreas para o gráfico de barras (memoizado)
  const { linhas: linhasAreas, meses: mesesAreas } = useMemo(
    () => pivotAreasPorMes(dadosAreas),
    [dadosAreas]
  );

  function validarPeriodo() {
    if (
      filtroDataInicial &&
      filtroDataFinal &&
      filtroDataInicial > filtroDataFinal
    ) {
      setErroFiltro("A Data Inicial não pode ser depois da Data Final.");
      return false;
    }
    setErroFiltro("");
    return true;
  }

  // Busca no servidor já filtrado, e aplica o recorte por Tipo de Relatório
  async function buscarDadosPersonalizados() {
    const { participacoes, areas } = await buscarRelatorios(
      filtroDataInicial,
      filtroDataFinal
    );
    const datasets = TIPO_DATASETS[filtroTipo] || TIPO_DATASETS.Completo;
    return {
      participacoes: datasets.participacoes ? participacoes : [],
      areas: datasets.areas ? areas : [],
    };
  }

  async function handleGerarRelatorio() {
    if (!validarPeriodo()) return;
    setGerando(true);
    try {
      const { participacoes, areas } = await buscarDadosPersonalizados();

      if (participacoes.length === 0 && areas.length === 0) {
        setErroFiltro("Nenhum dado encontrado para os filtros selecionados.");
        return;
      }
      setErroFiltro("");

      if (filtroFormato === "PDF") {
        exportPdf(participacoes, areas);
      } else {
        // Excel e CSV usam o mesmo gerador (CSV com separador ";", que o Excel abre nativamente)
        if (participacoes.length > 0) {
          exportExcel(participacoes, "participacoes_personalizado");
        }
        if (areas.length > 0) {
          exportExcel(areas, "areas_personalizado");
        }
      }
    } catch (error) {
      console.error("Erro ao gerar relatório personalizado:", error);
      setErroFiltro("Erro ao buscar dados do servidor. Tente novamente.");
    } finally {
      setGerando(false);
    }
  }

  async function handleAbrirPreview() {
    if (!validarPeriodo()) return;
    setPreviewCarregando(true);
    setPreviewAberto(true);
    try {
      const dados = await buscarDadosPersonalizados();
      setPreviewDados(dados);
      setErroFiltro("");
    } catch (error) {
      console.error("Erro ao buscar preview:", error);
      setErroFiltro("Erro ao buscar dados do servidor. Tente novamente.");
      setPreviewAberto(false);
    } finally {
      setPreviewCarregando(false);
    }
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--surte-azul-escuro)]">
          Relatórios
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Análise e exportação de dados
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-gradient-to-br from-[var(--surte-azul-primario)] to-[var(--surte-azul-escuro)] rounded-lg p-4 sm:p-6 text-white">
          <FileText size={28} className="sm:w-8 sm:h-8 mb-3 opacity-80" />
          <h3 className="text-base sm:text-lg font-semibold mb-1">
            Relatório Geral
          </h3>
          <p className="text-xs sm:text-sm opacity-80 mb-3 sm:mb-4">
            Todos os entrevistados e participações
          </p>
          <button
            onClick={() => exportPdf(dadosParticipacoes, dadosAreas)}
            className="flex items-center justify-center gap-2 bg-white text-[var(--surte-azul-primario)] px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto"
          >
            <Download size={14} className="sm:w-4 sm:h-4" />
            Exportar PDF
          </button>
        </div>

        <div className="bg-gradient-to-br from-[var(--surte-laranja-principal)] to-[var(--surte-laranja-secundario)] rounded-lg p-4 sm:p-6 text-white">
          <Users size={28} className="sm:w-8 sm:h-8 mb-3 opacity-80" />
          <h3 className="text-base sm:text-lg font-semibold mb-1">
            Por Entrevistado
          </h3>
          <p className="text-xs sm:text-sm opacity-80 mb-3 sm:mb-4">
            Histórico individual detalhado
          </p>
          <button
            onClick={() => exportExcel(dadosAreas, "areas_report")}
            className="flex items-center justify-center gap-2 bg-white text-[var(--surte-laranja-principal)] px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto"
          >
            <Download size={14} className="sm:w-4 sm:h-4" />
            Exportar Excel
          </button>
        </div>

        <div className="bg-gradient-to-br from-[var(--surte-amarelo-destaque)] to-[var(--surte-bege-claro)] rounded-lg p-4 sm:p-6 text-white">
          <TrendingUp size={28} className="sm:w-8 sm:h-8 mb-3 opacity-80" />
          <h3 className="text-base sm:text-lg font-semibold mb-1">
            Por Período
          </h3>
          <p className="text-xs sm:text-sm opacity-80 mb-3 sm:mb-4">
            Análise temporal de entrevistas
          </p>
          <button
            onClick={() => exportPdf(dadosParticipacoes, dadosAreas)}
            className="flex items-center justify-center gap-2 bg-white text-[var(--surte-marrom)] px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto"
          >
            <Download size={14} className="sm:w-4 sm:h-4" />
            Exportar PDF
          </button>
        </div>

        <div className="bg-gradient-to-br from-[var(--surte-marrom)] to-[var(--surte-bege-claro)] rounded-lg p-4 sm:p-6 text-white">
          <FileText size={28} className="sm:w-8 sm:h-8 mb-3 opacity-80" />
          <h3 className="text-base sm:text-lg font-semibold mb-1">Por Área</h3>
          <p className="text-xs sm:text-sm opacity-80 mb-3 sm:mb-4">
            Distribuição por área de atuação
          </p>
          <button
            onClick={() => exportExcel(dadosParticipacoes, "participacoes_report")}
            className="flex items-center justify-center gap-2 bg-white text-[var(--surte-marrom)] px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto"
          >
            <Download size={14} className="sm:w-4 sm:h-4" />
            Exportar Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {/* Gráfico Participações por Mês */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--surte-azul-escuro)]">
              Participações por Mês
            </h2>
            <button className="text-xs sm:text-sm text-[var(--surte-azul-primario)] hover:underline font-medium">
              Exportar
            </button>
          </div>
          {loading ? (
            <div className="h-[250px] flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">
              <span className="text-sm text-gray-400">Carregando dados...</span>
            </div>
          ) : dadosParticipacoes.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <span className="text-sm text-gray-500">Nenhum dado disponível</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dadosParticipacoes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="var(--surte-azul-primario)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Gráfico Evolução por Área (meses dinâmicos, vindos do pivot) */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--surte-azul-escuro)]">
              Evolução por Área
            </h2>
            <button className="text-xs sm:text-sm text-[var(--surte-azul-primario)] hover:underline font-medium">
              Exportar
            </button>
          </div>
          {loading ? (
            <div className="h-[250px] flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">
              <span className="text-sm text-gray-400">Carregando dados...</span>
            </div>
          ) : linhasAreas.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <span className="text-sm text-gray-500">Nenhum dado disponível</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={linhasAreas}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="area" />
                <YAxis />
                <Tooltip />
                <Legend />
                {mesesAreas.map((mes, i) => (
                  <Bar
                    key={mes}
                    dataKey={mes}
                    name={mes}
                    fill={PALETA_MESES[i % PALETA_MESES.length]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--surte-azul-escuro)] mb-4">
          Gerar Relatório Personalizado
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Relatório
            </label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
            >
              <option>Entrevistados</option>
              <option>Participações</option>
              <option>Programas</option>
              <option>Completo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Inicial
            </label>
            <input
              type="date"
              value={filtroDataInicial}
              onChange={(e) => setFiltroDataInicial(e.target.value)}
              max={filtroDataFinal || undefined}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Final
            </label>
            <input
              type="date"
              value={filtroDataFinal}
              onChange={(e) => setFiltroDataFinal(e.target.value)}
              min={filtroDataInicial || undefined}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formato
            </label>
            <select
              value={filtroFormato}
              onChange={(e) => setFiltroFormato(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
            >
              <option>PDF</option>
              <option>Excel</option>
              <option>CSV</option>
            </select>
          </div>
        </div>

        {erroFiltro && <p className="text-sm text-red-600 mb-4">{erroFiltro}</p>}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleGerarRelatorio}
            disabled={gerando}
            className="flex items-center justify-center gap-2 bg-[var(--surte-azul-primario)] text-white px-4 sm:px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Download size={20} />
            {gerando ? "Gerando..." : `Gerar e Baixar ${filtroFormato}`}
          </button>
          <button
            onClick={handleAbrirPreview}
            className="px-4 sm:px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Visualizar Preview
          </button>
        </div>
      </div>

      {previewAberto && (
        <PreviewModal
          carregando={previewCarregando}
          dados={previewDados}
          filtroTipo={filtroTipo}
          filtroDataInicial={filtroDataInicial}
          filtroDataFinal={filtroDataFinal}
          onFechar={() => setPreviewAberto(false)}
          onBaixar={() => {
            setPreviewAberto(false);
            handleGerarRelatorio();
          }}
        />
      )}
    </div>
  );
}

// Modal simples de preview, mostrando exatamente os dados que sairiam no export.
function PreviewModal({
  carregando,
  dados,
  filtroTipo,
  filtroDataInicial,
  filtroDataFinal,
  onFechar,
  onBaixar,
}) {
  const { participacoes, areas } = dados;
  const { linhas: linhasAreas, meses: mesesAreas } = pivotAreasPorMes(areas);
  const semDados = participacoes.length === 0 && areas.length === 0;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      onClick={onFechar}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[var(--surte-azul-escuro)]">
              Preview do Relatório
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Tipo: {filtroTipo}
              {(filtroDataInicial || filtroDataFinal) && (
                <>
                  {" "}
                  · Período: {filtroDataInicial || "início"} a{" "}
                  {filtroDataFinal || "hoje"}
                </>
              )}
            </p>
          </div>
          <button
            onClick={onFechar}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none px-2"
            aria-label="Fechar preview"
          >
            ×
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {carregando ? (
            <p className="text-sm text-gray-500">Buscando dados...</p>
          ) : (
            <>
              {semDados && (
                <p className="text-sm text-gray-500">
                  Nenhum dado encontrado para os filtros selecionados.
                </p>
              )}

              {participacoes.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-[var(--surte-azul-escuro)] mb-2">
                    Participações por Mês ({participacoes.length} registro
                    {participacoes.length !== 1 ? "s" : ""})
                  </h4>
                  <table className="w-full text-sm border border-gray-100 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium text-gray-600">
                          Mês
                        </th>
                        <th className="text-left px-3 py-2 font-medium text-gray-600">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {participacoes.map((p, i) => (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="px-3 py-2">{p.mes}</td>
                          <td className="px-3 py-2">{p.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {linhasAreas.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-[var(--surte-azul-escuro)] mb-2">
                    Evolução por Área ({linhasAreas.length} registro
                    {linhasAreas.length !== 1 ? "s" : ""})
                  </h4>
                  <table className="w-full text-sm border border-gray-100 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium text-gray-600">
                          Área
                        </th>
                        {mesesAreas.map((mes) => (
                          <th
                            key={mes}
                            className="text-left px-3 py-2 font-medium text-gray-600"
                          >
                            {mes}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {linhasAreas.map((row, i) => (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="px-3 py-2">{row.area}</td>
                          {mesesAreas.map((mes) => (
                            <td key={mes} className="px-3 py-2">
                              {row[mes] ?? 0}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onFechar}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Fechar
          </button>
          {!carregando && !semDados && (
            <button
              onClick={onBaixar}
              className="flex items-center justify-center gap-2 bg-[var(--surte-azul-primario)] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              <Download size={16} />
              Baixar Agora
            </button>
          )}
        </div>
      </div>
    </div>
  );
}