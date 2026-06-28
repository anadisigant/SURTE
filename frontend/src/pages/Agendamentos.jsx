import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, FileText, Plus, Tv, User, X } from "lucide-react";
import api from "../services/api";

const initialForm = {
  entrevistado_id: "",
  programa_id: "",
  data: "",
  hora: "",
  notas: "",
};

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

function normalizeEntrevista(item) {
  const dataHora = item.data_hora ? new Date(item.data_hora) : null;

  return {
    id: item.id,
    entrevistado_id: item.entrevistado_id,
    programa_id: item.programa_id,
    nome_entrevistado: item.nome_entrevistado || "Entrevistado nao informado",
    nome_programa: item.nome_programa || "Programa nao informado",
    data_hora: item.data_hora,
    status: item.status,
    notas: item.notas || "",
    data: dataHora ? dataHora.toLocaleDateString("pt-BR") : "",
    hora: dataHora
      ? dataHora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      : "",
    timestamp: dataHora ? dataHora.getTime() : 0,
  };
}

export default function Agendamentos() {
  const [entrevistas, setEntrevistas] = useState([]);
  const [entrevistados, setEntrevistados] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState(initialForm);

  const carregarEntrevistas = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/entrevistas/");
      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      setEntrevistas(data.map(normalizeEntrevista));
    } catch (err) {
      setError(getErrorMessage(err, "Nao foi possivel carregar as entrevistas."));
    } finally {
      setLoading(false);
    }
  };

  const carregarOpcoes = async () => {
    setLoadingOptions(true);

    try {
      const [entrevistadosResponse, programasResponse] = await Promise.all([
        api.get("/entrevistados/", { params: { skip: 0, limit: 500 } }),
        api.get("/programas/", { params: { skip: 0, limit: 500 } }),
      ]);

      setEntrevistados(Array.isArray(entrevistadosResponse.data) ? entrevistadosResponse.data : []);
      setProgramas(Array.isArray(programasResponse.data) ? programasResponse.data : []);
    } catch (err) {
      setFormError(getErrorMessage(err, "Nao foi possivel carregar entrevistados e programas."));
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    carregarEntrevistas();
  }, []);

  const openModal = () => {
    setFormData(initialForm);
    setFormError("");
    setShowModal(true);
    carregarOpcoes();
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setFormData(initialForm);
    setFormError("");
  };

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const entrevistasOrdenadas = useMemo(
    () =>
      entrevistas
        .filter((entrevista) => entrevista.status !== "realizada")
        .sort((a, b) => a.timestamp - b.timestamp),
    [entrevistas],
  );

  const totalAgendados = entrevistasOrdenadas.length;
  const confirmadosCount = entrevistasOrdenadas.filter((item) => item.status === "confirmada").length;
  const pendentesCount = entrevistasOrdenadas.filter((item) => item.status === "agendada").length;
  const estaSemanaCount = entrevistasOrdenadas.filter((item) => {
    if (!item.timestamp) return false;
    const itemDate = new Date(item.timestamp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    return itemDate >= today && itemDate <= nextWeek;
  }).length;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");

    const payload = {
      entrevistado_id: Number(formData.entrevistado_id),
      programa_id: Number(formData.programa_id),
      data_hora: new Date(`${formData.data}T${formData.hora}`).toISOString(),
      notas: formData.notas.trim() || null,
    };

    try {
      await api.post("/entrevistas/", payload);
      await carregarEntrevistas();
      closeModal();
    } catch (err) {
      setFormError(getErrorMessage(err, "Nao foi possivel criar a entrevista."));
    } finally {
      setSaving(false);
    }
  };

  const atualizarStatus = async (entrevista, status) => {
    setStatusLoadingId(entrevista.id);
    setError("");

    try {
      await api.patch(`/entrevistas/${entrevista.id}/status`, { status });
      await carregarEntrevistas();
    } catch (err) {
      setError(getErrorMessage(err, "Nao foi possivel atualizar o status da entrevista."));
    } finally {
      setStatusLoadingId(null);
    }
  };

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
          onClick={openModal}
          className="flex cursor-pointer items-center justify-center gap-2 bg-[var(--surte-laranja-principal)] text-white px-4 sm:px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium whitespace-nowrap"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Nova Entrevista</span>
          <span className="sm:hidden">Nova</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          <p className="font-medium">Erro em entrevistas</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            type="button"
            onClick={carregarEntrevistas}
            className="mt-3 cursor-pointer px-4 py-2 bg-red-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 animate-pulse">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Total</p>
            <p className="text-xl sm:text-2xl font-bold text-[var(--surte-azul-primario)]">
              {totalAgendados}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Confirmadas</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">{confirmadosCount}</p>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Agendadas</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{pendentesCount}</p>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Esta Semana</p>
            <p className="text-xl sm:text-2xl font-bold text-[var(--surte-laranja-principal)]">
              {estaSemanaCount}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((item) => (
            <div key={item} className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100 animate-pulse space-y-4">
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
      ) : entrevistasOrdenadas.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
          <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-[var(--surte-azul-escuro)] mb-1">
            Nenhuma entrevista encontrada
          </h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Crie uma entrevista para que ela apareca na agenda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {entrevistasOrdenadas.map((entrevista) => (
            <div
              key={entrevista.id}
              className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_140px] sm:items-center gap-2 mb-3">
                    <h3 className="text-lg sm:text-xl font-bold text-[var(--surte-azul-escuro)] min-w-0">
                      {entrevista.nome_entrevistado}
                    </h3>
                    <span
                      className={`inline-flex w-fit sm:w-[120px] justify-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig[entrevista.status]?.color || "bg-gray-100 text-gray-700"}`}
                    >
                      {statusConfig[entrevista.status]?.label || entrevista.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Tv size={16} className="text-[var(--surte-laranja-principal)] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Programa</p>
                        <p className="font-medium text-sm truncate">{entrevista.nome_programa}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} className="text-[var(--surte-azul-primario)] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Data</p>
                        <p className="font-medium text-sm">{entrevista.data}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={16} className="text-[var(--surte-amarelo-destaque)] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Horario</p>
                        <p className="font-medium text-sm">{entrevista.hora}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <User size={16} className="text-[var(--surte-bege-claro)] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">IDs</p>
                        <p className="font-medium text-sm truncate">
                          E{entrevista.entrevistado_id} / P{entrevista.programa_id}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText size={16} className="text-[var(--surte-laranja-secundario)] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Notas</p>
                        <p className="font-medium text-sm truncate">{entrevista.notas || "Sem notas"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {["agendada", "confirmada"].includes(entrevista.status) && (
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                    {entrevista.status === "agendada" && (
                      <button
                        type="button"
                        onClick={() => atualizarStatus(entrevista, "confirmada")}
                        disabled={statusLoadingId === entrevista.id}
                        className="cursor-pointer px-4 py-2 bg-green-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Confirmar
                      </button>
                    )}
                    {entrevista.status === "confirmada" && (
                      <button
                        type="button"
                        onClick={() => atualizarStatus(entrevista, "realizada")}
                        disabled={statusLoadingId === entrevista.id}
                        className="cursor-pointer px-4 py-2 bg-green-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Realizar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => atualizarStatus(entrevista, "cancelada")}
                      disabled={statusLoadingId === entrevista.id}
                      className="cursor-pointer px-4 py-2 bg-red-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--surte-azul-escuro)]">
                Nova Entrevista
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="cursor-pointer p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                {formError}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entrevistado
                </label>
                <select
                  required
                  disabled={loadingOptions}
                  value={formData.entrevistado_id}
                  onChange={(event) => updateField("entrevistado_id", event.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)] disabled:opacity-60"
                >
                  <option value="">Selecione um entrevistado...</option>
                  {entrevistados.map((entrevistado) => (
                    <option key={entrevistado.id} value={entrevistado.id}>
                      {entrevistado.nome_completo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Programa
                </label>
                <select
                  required
                  disabled={loadingOptions}
                  value={formData.programa_id}
                  onChange={(event) => updateField("programa_id", event.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)] disabled:opacity-60"
                >
                  <option value="">Selecione um programa...</option>
                  {programas.map((programa) => (
                    <option key={programa.id} value={programa.id}>
                      {programa.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.data}
                    onChange={(event) => updateField("data", event.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horario
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.hora}
                    onChange={(event) => updateField("hora", event.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  rows={3}
                  value={formData.notas}
                  onChange={(event) => updateField("notas", event.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
                  placeholder="Informacoes adicionais sobre a entrevista..."
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 cursor-pointer px-4 sm:px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || loadingOptions}
                  className="flex-1 cursor-pointer px-4 sm:px-6 py-3 bg-[var(--surte-laranja-principal)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Agendando..." : "Agendar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
