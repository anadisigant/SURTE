import { useEffect, useState } from "react";
import { Calendar, Clock, User, Tv, Plus } from "lucide-react";
import api from "../services/api";

const statusConfig = {
  agendado: { label: "Agendado", color: "bg-blue-100 text-blue-700" },
  confirmado: { label: "Confirmado", color: "bg-green-100 text-green-700" },
  realizado: { label: "Realizado", color: "bg-gray-100 text-gray-700" },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-700" },
};

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/agendamentos")
      .then((response) => {
        if (Array.isArray(response.data)) {
          setAgendamentos(response.data);
        } else if (response.data && Array.isArray(response.data.agendamentos)) {
          setAgendamentos(response.data.agendamentos);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao obter agendamentos:", error);
        setLoading(false);
      });
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const totalAgendados = agendamentos.length;
  const confirmadosCount = agendamentos.filter((a) => a.status === "confirmado").length;
  const pendentesCount = agendamentos.filter((a) => a.status === "agendado").length;
  const estaSemanaCount = agendamentos.filter((a) => {
    if (!a.data) return false;
    const itemDate = new Date(a.data);
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    return itemDate >= today && itemDate <= nextWeek;
  }).length;

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--surte-azul-escuro)]">
            Agendamentos
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Gerencie entrevistas agendadas
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-[var(--surte-laranja-principal)] text-white px-4 sm:px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium whitespace-nowrap"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Novo Agendamento</span>
          <span className="sm:hidden">Novo</span>
        </button>
      </div>

      {loading ? (
        // Grid de estatísticas em skeleton
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">
              Total Agendados
            </p>
            <p className="text-xl sm:text-2xl font-bold text-[var(--surte-azul-primario)]">
              {totalAgendados}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">
              Confirmados
            </p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {confirmadosCount}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">
              Pendentes
            </p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {pendentesCount}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">
              Esta Semana
            </p>
            <p className="text-xl sm:text-2xl font-bold text-[var(--surte-laranja-principal)]">
              {estaSemanaCount}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        // List de agendamentos em skeleton
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100 animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : agendamentos.length === 0 ? (
        // Placeholder Estado Vazio
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
          <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-[var(--surte-azul-escuro)] mb-1">
            Nenhum agendamento encontrado
          </h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Não há entrevistas agendadas no sistema no momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {agendamentos.map((agendamento) => (
            <div
              key={agendamento.id}
              className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                    <h3 className="text-lg sm:text-xl font-bold text-[var(--surte-azul-escuro)]">
                      {agendamento.entrevistado}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[agendamento.status]?.color || "bg-gray-100 text-gray-700"} w-fit`}
                    >
                      {statusConfig[agendamento.status]?.label || agendamento.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Tv
                        size={16}
                        className="text-[var(--surte-laranja-principal)] flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Programa</p>
                        <p className="font-medium text-sm truncate">
                          {agendamento.programa}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar
                        size={16}
                        className="text-[var(--surte-azul-primario)] flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Data</p>
                        <p className="font-medium text-sm">
                          {formatDate(agendamento.data)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock
                        size={16}
                        className="text-[var(--surte-amarelo-destaque)] flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Horário</p>
                        <p className="font-medium text-sm">{agendamento.hora}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <User
                        size={16}
                        className="text-[var(--surte-bege-claro)] flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Área</p>
                        <p className="font-medium text-sm truncate">
                          {agendamento.area}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 lg:flex-none px-4 py-2 bg-[var(--surte-azul-primario)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
                    Detalhes
                  </button>
                  {agendamento.status === "agendado" && (
                    <button className="flex-1 lg:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
                      Confirmar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--surte-azul-escuro)] mb-4 sm:mb-6">
              Novo Agendamento
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entrevistado
                </label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]">
                  <option>Selecione um entrevistado...</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Programa
                </label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]">
                  <option>Selecione um programa...</option>
                  <option>Debate Saúde</option>
                  <option>Educação em Foco</option>
                  <option>Tech News</option>
                  <option>Planeta Verde</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horário
                  </label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
                  placeholder="Informações adicionais sobre o agendamento..."
                ></textarea>
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 sm:px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 sm:px-6 py-3 bg-[var(--surte-laranja-principal)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

