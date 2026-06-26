import { useEffect, useState } from "react";
import { Users, Calendar, CheckCircle, TrendingUp } from "lucide-react";
import StatCard from "../components/StatCard";
import api from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#393285", "#fabb07", "#ef7f1a", "#cfb683", "#e74923"];

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEntrevistados: 0,
    agendamentosAtivos: 0,
    entrevistasRealizadas: 0,
    taxaAprovacao: "0%",
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [areaData, setAreaData] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard")
      .then((response) => {
        const { stats, monthlyData, areaData, upcoming } = response.data;
        if (stats) setStats(stats);
        if (monthlyData) setMonthlyData(monthlyData);
        if (areaData) setAreaData(areaData);
        if (upcoming) setUpcoming(upcoming);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao carregar dados do dashboard:", error);
        setLoading(false);
      });
  }, []);

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

      {loading ? (
        // Skeleton para os StatCards
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Total de Entrevistados"
            value={stats.totalEntrevistados}
            icon={Users}
            color="var(--surte-azul-primario)"
          />

          <StatCard
            title="Agendamentos Ativos"
            value={stats.agendamentosAtivos}
            icon={Calendar}
            color="var(--surte-laranja-principal)"
          />

          <StatCard
            title="Entrevistas Realizadas"
            value={stats.entrevistasRealizadas}
            icon={CheckCircle}
            color="var(--surte-amarelo-destaque)"
          />

          <StatCard
            title="Taxa de Aprovação"
            value={stats.taxaAprovacao}
            icon={TrendingUp}
            color="var(--surte-laranja-secundario)"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Gráfico de Entrevistas por Mês */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold text-[var(--surte-azul-escuro)] mb-4">
            Entrevistas por Mês
          </h2>
          {loading ? (
            <div className="h-[250px] flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">
              <span className="text-sm text-gray-400">Carregando dados...</span>
            </div>
          ) : monthlyData.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <span className="text-sm text-gray-500">Nenhum dado mensal disponível</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="entrevistas" fill="var(--surte-azul-primario)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Gráfico de Entrevistados por Área */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold text-[var(--surte-azul-escuro)] mb-4">
            Entrevistados por Área
          </h2>
          {loading ? (
            <div className="h-[250px] flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">
              <span className="text-sm text-gray-400">Carregando dados...</span>
            </div>
          ) : areaData.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
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
                  label={({ area, percent }) =>
                    `${area}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {areaData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Próximos Agendamentos */}
      <div className="mt-4 sm:mt-6 bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--surte-azul-escuro)] mb-4">
          Próximos Agendamentos
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="space-y-2 text-right">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <Calendar className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-sm text-gray-500 font-medium">Nenhum agendamento futuro encontrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((agendamento, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-2"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-[var(--surte-azul-escuro)]">
                    {agendamento.nome}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {agendamento.area} • {agendamento.programa}
                  </p>
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
    </div>
  );
}

