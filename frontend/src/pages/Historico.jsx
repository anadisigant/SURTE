import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, FileText, History, Search, Tv, User } from "lucide-react";
import api from "../services/api";

const statusConfig = {
  realizada: { label: "Realizada", color: "bg-gray-100 text-gray-700" },
  cancelada: { label: "Cancelada", color: "bg-red-100 text-red-700" },
};

function getErrorMessage(error, fallback) {
  const detail = error?.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(" ");
  }
  return detail || fallback;
}

function normalizeHistorico(item) {
  const dataHora = item.data_hora ? new Date(item.data_hora) : null;

  return {
    id: item.id,
    nome_entrevistado: item.nome_entrevistado || "Entrevistado não informado",
    nome_programa: item.nome_programa || "Programa não informado",
    data_hora: item.data_hora,
    status: item.status,
    notas: item.notas || "",
    data: dataHora
      ? dataHora.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
      : "",
    hora: dataHora
      ? dataHora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      : "",
    timestamp: dataHora ? dataHora.getTime() : 0,
  };
}

function isInPeriod(timestamp, filtroPeriodo) {
  if (filtroPeriodo === "todos") return true;
  if (!timestamp) return false;

  const itemDate = new Date(timestamp);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(today);
  if (filtroPeriodo === "semana") start.setDate(today.getDate() - 7);
  if (filtroPeriodo === "mês") start.setMonth(today.getMonth() - 1);
  if (filtroPeriodo === "trimestre") start.setMonth(today.getMonth() - 3);
  if (filtroPeriodo === "ano") start.setFullYear(today.getFullYear() - 1);

  return itemDate >= start;
}

export default function Historico() {
  const [historico, setHistorico] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroPeriodo, setFiltroPeriodo] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const carregarHistorico = async () => {
    setLoading(true);
    setError("");

    try {
      const [realizadasResponse, canceladasResponse] = await Promise.all([
        api.get("/entrevistas/", { params: { status: "realizada" } }),
        api.get("/entrevistas/", { params: { status: "cancelada" } }),
      ]);

      const realizadas = Array.isArray(realizadasResponse.data?.data) ? realizadasResponse.data.data : [];
      const canceladas = Array.isArray(canceladasResponse.data?.data) ? canceladasResponse.data.data : [];

      setHistorico([...realizadas, ...canceladas].map(normalizeHistorico));
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possivel carregar o histórico."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarHistorico();
  }, []);

  const historicoFiltrado = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return historico
      .filter((item) => filtroStatus === "todos" || item.status === filtroStatus)
      .filter((item) => isInPeriod(item.timestamp, filtroPeriodo))
      .filter((item) => {
        if (!term) return true;
        return [
          item.nome_entrevistado,
          item.nome_programa,
          item.notas,
          item.status,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term));
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [historico, filtroStatus, filtroPeriodo, searchTerm]);

  const totalEntrevistas = historicoFiltrado.length;
  const realizadasCount = historicoFiltrado.filter((item) => item.status === "realizada").length;
  const canceladasCount = historicoFiltrado.filter((item) => item.status === "cancelada").length;

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--surte-azul-escuro)]">
          Histórico de Entrevistas
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Acompanhe entrevistas realizadas e canceladas
        </p>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
              value={filtroStatus}
              onChange={(event) => setFiltroStatus(event.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="realizada">Realizadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
              value={filtroPeriodo}
              onChange={(event) => setFiltroPeriodo(event.target.value)}
            >
              <option value="todos">Todos os períodos</option>
              <option value="semana">Última semana</option>
              <option value="mes">Último mês</option>
              <option value="trimestre">Último trimestre</option>
              <option value="ano">Último ano</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Nome, programa, status ou notas..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          <p className="font-medium">Erro ao carregar histórico</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            type="button"
            onClick={carregarHistorico}
            className="mt-3 cursor-pointer px-4 py-2 bg-red-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 animate-pulse">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">
              Total no Histórico
            </p>
            <p className="text-xl sm:text-2xl font-bold text-[var(--surte-azul-primario)]">
              {totalEntrevistas}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">
              Realizadas
            </p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {realizadasCount}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">
              Canceladas
            </p>
            <p className="text-xl sm:text-2xl font-bold text-red-600">
              {canceladasCount}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((item) => (
            <div key={item} className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100 animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : historicoFiltrado.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
          <History className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-[var(--surte-azul-escuro)] mb-1">
            Nenhuma entrevista no histórico
          </h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Entrevistas realizadas ou canceladas aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {historicoFiltrado.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_140px] sm:items-center gap-2 mb-3">
                    <h3 className="text-base sm:text-lg font-bold text-[var(--surte-azul-escuro)] min-w-0">
                      {item.nome_entrevistado}
                    </h3>
                    <span
                      className={`inline-flex w-fit sm:w-[120px] justify-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig[item.status]?.color || "bg-gray-100 text-gray-700"}`}
                    >
                      {statusConfig[item.status]?.label || item.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mt-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Tv size={16} className="text-[var(--surte-laranja-principal)] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Programa</p>
                        <p className="text-sm font-medium truncate">{item.nome_programa}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} className="text-[var(--surte-amarelo-destaque)] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Data</p>
                        <p className="text-sm font-medium">{item.data}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={16} className="text-[var(--surte-bege-claro)] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Hora</p>
                        <p className="text-sm font-medium">{item.hora}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 sm:col-span-2">
                      <FileText size={16} className="text-[var(--surte-laranja-secundario)] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Notas</p>
                        <p className="text-sm font-medium truncate">{item.notas || "Sem notas"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
