import { useEffect, useState } from "react";
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

export default function Relatorios() {
  const [dadosParticipacoes, setDadosParticipacoes] = useState([]);
  const [dadosAreas, setDadosAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/relatorios")
      .then((response) => {
        const { participacoes, areas } = response.data;
        if (participacoes) setDadosParticipacoes(participacoes);
        if (areas) setDadosAreas(areas);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao obter dados de relatórios:", error);
        setLoading(false);
      });
  }, []);

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
          <button className="flex items-center justify-center gap-2 bg-white text-[var(--surte-azul-primario)] px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto">
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
          <button className="flex items-center justify-center gap-2 bg-white text-[var(--surte-laranja-principal)] px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto">
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
          <button className="flex items-center justify-center gap-2 bg-white text-[var(--surte-marrom)] px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto">
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
          <button className="flex items-center justify-center gap-2 bg-white text-[var(--surte-marrom)] px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto">
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

        {/* Gráfico Evolução por Área */}
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
          ) : dadosAreas.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <span className="text-sm text-gray-500">Nenhum dado disponível</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dadosAreas}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="area" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="mai"
                  fill="var(--surte-azul-primario)"
                  name="Maio"
                />
                <Bar
                  dataKey="abr"
                  fill="var(--surte-laranja-principal)"
                  name="Abril"
                />
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
            <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]">
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
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Final
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formato
            </label>
            <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]">
              <option>PDF</option>
              <option>Excel</option>
              <option>CSV</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex items-center justify-center gap-2 bg-[var(--surte-azul-primario)] text-white px-4 sm:px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium">
            <Download size={20} />
            Gerar e Baixar
          </button>
          <button className="px-4 sm:px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            Visualizar Preview
          </button>
        </div>
      </div>
    </div>
  );
}

