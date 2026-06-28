import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  ListChecks,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import StatCard from "../components/StatCard";
import api from "../services/api";

const COLORS = ["#393285", "#fabb07", "#ef7f1a", "#cfb683", "#e74923"];

const statusConfig = {
  agendada: { label: "Agendada", color: "bg-blue-100 text-blue-700" },
  confirmada: { label: "Confirmada", color: "bg-green-100 text-green-700" },
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

function parseApiList(response) {
  if (Array.isArray(response.data?.data)) return response.data.data;
  if (Array.isArray(response.data)) return response.data;
  return [];
}

function formatDateTime(dataHora) {
  if (!dataHora) {
    return { data: "", hora: "", timestamp: 0 };
  }

  const date = new Date(dataHora);
  if (Number.isNaN(date.getTime())) {
    return { data: "", hora: "", timestamp: 0 };
  }

  return {
    data: date.toLocaleDateString("pt-BR"),
    hora: date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    timestamp: date.getTime(),
  };
}

function normalizeEntrevista(item, programasPorId) {
  const formatted = formatDateTime(item.data_hora);

  return {
    id: item.id,
    nome_entrevistado: item.nome_entrevistado || "Entrevistado não informado",
    nome_programa:
      item.nome_programa ||
      programasPorId.get(item.programa_id)?.nome ||
      "Programa não informado",
    data_hora: item.data_hora,
    status: item.status,
    notas: item.notas || "",
    data: formatted.data,
    hora: formatted.hora,
    timestamp: formatted.timestamp,
  };
}

function buildMonthlyData(entrevistas) {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "2-digit",
  });

  const grouped = entrevistas.reduce((acc, entrevista) => {
    if (!entrevista.timestamp) return acc;
    const date = new Date(entrevista.timestamp);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const current = acc.get(key) || {
      mes: formatter.format(date).replace(".", ""),
      entrevistas: 0,
      timestamp: entrevista.timestamp,
    };
    current.entrevistas += 1;
    acc.set(key, current);
    return acc;
  }, new Map());

  return Array.from(grouped.values())
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-6);
}

function buildAreaData(entrevistados) {
  const grouped = entrevistados.reduce((acc, entrevistado) => {
    const area = entrevistado.area_atuacao || "Sem área";
    acc.set(area, (acc.get(area) || 0) + 1);
    return acc;
  }, new Map());

  return Array.from(grouped.entries())
    .map(([area, total]) => ({ area, total }))
    .sort((a, b) => b.total - a.total);
}

export default function Dashboard() {
  const [entrevistados, setEntrevistados] = useState([]);
  const [entrevistas, setEntrevistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const carregarDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [entrevistadosResponse, entrevistasResponse, programasResponse] = await Promise.all([
        api.get("/entrevistados/", { params: { skip: 0, limit: 500 } }),
        api.get("/entrevistas/"),
        api.get("/programas/", { params: { skip: 0, limit: 500 } }),
      ]);

      const programasData = parseApiList(programasResponse);
      const programasPorId = new Map(programasData.map((programa) => [programa.id, programa]));

      setEntrevistados(parseApiList(entrevistadosResponse));
      setEntrevistas(
        parseApiList(entrevistasResponse).map((item) =>
          normalizeEntrevista(item, programasPorId),
        ),
      );
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível carregar os dados do dashboard."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDashboard();
  }, []);

  const stats = useMemo(() => {
    const totalEntrevistas = entrevistas.length;
    const agendadas = entrevistas.filter((item) => item.status === "agendada").length;
    const confirmadas = entrevistas.filter((item) => item.status === "confirmada").length;
    const realizadas = entrevistas.filter((item) => item.status === "realizada").length;
    const canceladas = entrevistas.filter((item) => item.status === "cancelada").length;

    return {
      totalEntrevistados: entrevistados.length,
      totalEntrevistas,
      agendadas,
      confirmadas,
      realizadas,
      canceladas,
    };
  }, [entrevistados, entrevistas]);

  const monthlyData = useMemo(() => buildMonthlyData(entrevistas), [entrevistas]);
  const areaData = useMemo(() => buildAreaData(entrevistados), [entrevistados]);

  const upcoming = useMemo(() => {
    return entrevistas
      .filter((item) => ["agendada", "confirmada"].includes(item.status))
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, 5);
  }, [entrevistas]);

  const ultimosHistoricos = useMemo(
    () =>
      entrevistas
        .filter((item) => ["realizada", "cancelada"].includes(item.status))
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5),
    [entrevistas],
  );

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--surte-azul-escuro)]">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Visão geral do sistema SURTE
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="font-medium">Erro ao carregar dashboard</p>
          <p className="mt-1 text-sm">{error}</p>
          <button
            type="button"
            onClick={carregarDashboard}
            className="mt-3 cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {loading ? (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-gray-100 bg-white p-4 shadow-sm sm:p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="h-3 w-2/3 rounded bg-gray-200"></div>
                  <div className="h-8 w-1/3 rounded bg-gray-200"></div>
                  <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total de Entrevistados"
            value={stats.totalEntrevistados}
            icon={Users}
            color="var(--surte-azul-primario)"
          />
          <StatCard
            title="Total de Entrevistas"
            value={stats.totalEntrevistas}
            icon={ListChecks}
            color="var(--surte-laranja-principal)"
          />
          <StatCard
            title="Entrevistas Agendadas"
            value={stats.agendadas}
            icon={Calendar}
            color="var(--surte-azul-primario)"
          />
          <StatCard
            title="Entrevistas Confirmadas"
            value={stats.confirmadas}
            icon={UserCheck}
            color="var(--surte-laranja-secundario)"
          />
          <StatCard
            title="Entrevistas Realizadas"
            value={stats.realizadas}
            icon={CheckCircle}
            color="var(--surte-amarelo-destaque)"
          />
          <StatCard
            title="Entrevistas Canceladas"
            value={stats.canceladas}
            icon={XCircle}
            color="var(--surte-vermelho)"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 text-lg font-bold text-[var(--surte-azul-escuro)] sm:text-xl">
            Entrevistas por Mês
          </h2>
          {loading ? (
            <div className="flex h-[250px] animate-pulse items-center justify-center rounded-lg bg-gray-50">
              <span className="text-sm text-gray-400">Carregando dados...</span>
            </div>
          ) : monthlyData.length === 0 ? (
            <div className="flex h-[250px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50">
              <span className="text-sm text-gray-500">Nenhum dado mensal disponível</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="entrevistas" fill="var(--surte-azul-primario)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 text-lg font-bold text-[var(--surte-azul-escuro)] sm:text-xl">
            Entrevistados por Área
          </h2>
          {loading ? (
            <div className="flex h-[250px] animate-pulse items-center justify-center rounded-lg bg-gray-50">
              <span className="text-sm text-gray-400">Carregando dados...</span>
            </div>
          ) : areaData.length === 0 ? (
            <div className="flex h-[250px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50">
              <span className="text-sm text-gray-500">Nenhum dado por área disponível</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={areaData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ area, percent }) => `${area}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {areaData.map((entry, index) => (
                    <Cell key={`cell-${entry.area}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 text-lg font-bold text-[var(--surte-azul-escuro)] sm:text-xl">
            Próximas Entrevistas
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex animate-pulse items-center justify-between rounded-lg bg-gray-50 p-4"
                >
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/4 rounded bg-gray-200"></div>
                    <div className="h-3 w-1/3 rounded bg-gray-200"></div>
                  </div>
                  <div className="space-y-2 text-right">
                    <div className="h-4 w-16 rounded bg-gray-200"></div>
                    <div className="h-3 w-12 rounded bg-gray-200"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
              <Calendar className="mx-auto mb-2 text-gray-400" size={32} />
              <p className="text-sm font-medium text-gray-500">
                Nenhuma entrevista em agendamento encontrada
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((agendamento) => (
                <div
                  key={agendamento.id}
                  className="flex flex-col gap-2 rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-[var(--surte-azul-escuro)]">
                      {agendamento.nome_entrevistado}
                    </h3>
                    <p className="truncate text-sm text-gray-600">
                      {agendamento.nome_programa}
                    </p>
                    {agendamento.notas && (
                      <p className="mt-1 truncate text-xs text-gray-500">
                        {agendamento.notas}
                      </p>
                    )}
                  </div>
                  <div className="sm:text-right">
                    <p className="text-sm font-medium text-[var(--surte-azul-primario)]">
                      {agendamento.data}
                    </p>
                    <p className="text-sm text-gray-600">{agendamento.hora}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 text-lg font-bold text-[var(--surte-azul-escuro)] sm:text-xl">
            Últimas Entrevistas (Realizadas/Canceladas)
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-lg bg-gray-50 p-4">
                  <div className="mb-2 h-4 w-1/3 rounded bg-gray-200"></div>
                  <div className="h-3 w-2/3 rounded bg-gray-200"></div>
                </div>
              ))}
            </div>
          ) : ultimosHistoricos.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
              <FileText className="mx-auto mb-2 text-gray-400" size={32} />
              <p className="text-sm font-medium text-gray-500">
                Nenhum histórico encontrado
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {ultimosHistoricos.map((item) => (
                <div key={item.id} className="rounded-lg bg-gray-50 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-[var(--surte-azul-escuro)]">
                        {item.nome_entrevistado}
                      </h3>
                      <p className="truncate text-sm text-gray-600">{item.nome_programa}</p>
                      {item.notas && (
                        <p className="mt-1 flex items-center gap-1 truncate text-xs text-gray-500">
                          <FileText size={12} />
                          {item.notas}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 sm:text-right">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusConfig[item.status]?.color || "bg-gray-100 text-gray-700"}`}
                      >
                        {statusConfig[item.status]?.label || item.status}
                      </span>
                      <p className="mt-1 flex items-center gap-1 text-sm text-gray-600 sm:justify-end">
                        <Clock size={14} />
                        {item.data} {item.hora}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
