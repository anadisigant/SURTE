import { useEffect, useMemo, useState } from "react";
import { Edit, Mail, Phone, Plus, Search, Trash2, Users, X } from "lucide-react";
import api from "../services/api";

const initialForm = {
  nome_completo: "",
  email: "",
  telefone: "",
  area_atuacao: "",
  instituicao: "",
  temas: "",
  autorizacao_imagem_voz: false,
};

function getErrorMessage(error, fallback) {
  const detail = error?.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(" ");
  }
  return detail || fallback;
}

export default function Entrevistados() {
  const [entrevistados, setEntrevistados] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    window.setTimeout(() => setNotification(null), 3200);
  };

  const carregarEntrevistados = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/entrevistados/", {
        params: { skip: 0, limit: 100 },
      });
      setEntrevistados(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(getErrorMessage(err, "Nao foi possivel carregar os entrevistados."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEntrevistados();
  }, []);

  const filteredEntrevistados = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return entrevistados;

    return entrevistados.filter((entrevistado) =>
      [
        entrevistado.nome_completo,
        entrevistado.email,
        entrevistado.telefone,
        entrevistado.area_atuacao,
        entrevistado.instituicao,
        entrevistado.temas,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [entrevistados, searchTerm]);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setFormData(initialForm);
    setFormError("");
    setEditingId(null);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(initialForm);
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (entrevistado) => {
    setEditingId(entrevistado.id);
    setFormData({
      nome_completo: entrevistado.nome_completo || "",
      email: entrevistado.email || "",
      telefone: entrevistado.telefone || "",
      area_atuacao: entrevistado.area_atuacao || "",
      instituicao: entrevistado.instituicao || "",
      temas: entrevistado.temas || "",
      autorizacao_imagem_voz: Boolean(entrevistado.autorizacao_imagem_voz),
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");

    const payload = {
      nome_completo: formData.nome_completo.trim(),
      email: formData.email.trim() || null,
      telefone: formData.telefone.trim() || null,
      area_atuacao: formData.area_atuacao.trim(),
      instituicao: formData.instituicao.trim() || null,
      temas: formData.temas.trim(),
      autorizacao_imagem_voz: formData.autorizacao_imagem_voz,
    };

    try {
      const response = editingId
        ? await api.put(`/entrevistados/${editingId}`, payload)
        : await api.post("/entrevistados/", payload);

      setEntrevistados((current) => {
        const next = editingId
          ? current.map((item) => (item.id === editingId ? response.data : item))
          : [...current, response.data];

        return next.sort((a, b) => a.nome_completo.localeCompare(b.nome_completo, "pt-BR"));
      });
      showNotification(
        editingId
          ? "Entrevistado atualizado com sucesso."
          : "Entrevistado criado com sucesso.",
      );
      closeModal();
    } catch (err) {
      setFormError(
        getErrorMessage(
          err,
          editingId
            ? "Nao foi possivel atualizar o entrevistado."
            : "Nao foi possivel cadastrar o entrevistado.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entrevistado) => {
    setDeletingId(entrevistado.id);
    setError("");

    try {
      await api.delete(`/entrevistados/${entrevistado.id}`);
      setEntrevistados((current) => current.filter((item) => item.id !== entrevistado.id));
      setConfirmDelete(null);
      showNotification("Entrevistado deletado com sucesso.");
    } catch (err) {
      setError(getErrorMessage(err, "Nao foi possivel excluir o entrevistado."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {notification && (
        <div className="fixed left-1/2 top-4 z-[70] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-center text-green-800 shadow-lg">
          <p className="font-medium">{notification.message}</p>
        </div>
      )}

      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--surte-azul-escuro)]">
            Entrevistados
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Gerencie o cadastro de entrevistados
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex cursor-pointer items-center justify-center gap-2 bg-[var(--surte-azul-primario)] text-white px-4 sm:px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium whitespace-nowrap"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Novo Entrevistado</span>
          <span className="sm:hidden">Novo</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar por nome, area, instituicao, e-mail, telefone ou temas..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          <p className="font-medium">Erro ao carregar entrevistados</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            type="button"
            onClick={carregarEntrevistados}
            className="mt-3 cursor-pointer px-4 py-2 bg-red-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-pulse">
          <div className="h-12 bg-gray-50 border-b border-gray-200"></div>
          <div className="space-y-4 p-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      ) : !error && filteredEntrevistados.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
          <Users className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-[var(--surte-azul-escuro)] mb-1">
            Nenhum entrevistado encontrado
          </h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            {searchTerm
              ? "Nenhum cadastro corresponde a sua busca atual."
              : "Cadastre entrevistados no sistema para que aparecam aqui."}
          </p>
        </div>
      ) : !error ? (
        <>
          <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Nome</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Área</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Instituicao</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Contato</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Temas</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntrevistados.map((entrevistado) => (
                  <tr
                    key={entrevistado.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[var(--surte-azul-escuro)]">
                        {entrevistado.nome_completo}
                      </p>
                      <p className="text-sm text-gray-500">
                        {entrevistado.autorizacao_imagem_voz
                          ? "Imagem e voz autorizadas"
                          : "Sem autorizacao de imagem e voz"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex min-h-[44px] w-[128px] items-center justify-center rounded-lg bg-[var(--surte-azul-primario)] px-3 py-1.5 text-center text-sm font-medium leading-tight text-white">
                        {entrevistado.area_atuacao}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {entrevistado.instituicao || "Nao informada"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} />
                          {entrevistado.email || "Nao informado"}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} />
                          {entrevistado.telefone || "Nao informado"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                      <p className="line-clamp-3">{entrevistado.temas}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(entrevistado)}
                          className="cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors text-[var(--surte-azul-primario)]"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(entrevistado)}
                          disabled={deletingId === entrevistado.id}
                          className="cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors text-[var(--surte-vermelho)] disabled:cursor-not-allowed disabled:opacity-50"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-4">
            {filteredEntrevistados.map((entrevistado) => (
              <div
                key={entrevistado.id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[var(--surte-azul-escuro)] mb-2">
                      {entrevistado.nome_completo}
                    </h3>
                    <span className="inline-flex min-h-[40px] w-[120px] items-center justify-center rounded-lg bg-[var(--surte-azul-primario)] px-3 py-1.5 text-center text-xs font-medium leading-tight text-white">
                      {entrevistado.area_atuacao}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={14} />
                    <span className="truncate">{entrevistado.email || "Nao informado"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={14} />
                    {entrevistado.telefone || "Nao informado"}
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-700">
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-500">Instituicao</p>
                    <p>{entrevistado.instituicao || "Nao informada"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-500">Temas</p>
                    <p>{entrevistado.temas}</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {entrevistado.autorizacao_imagem_voz
                      ? "Imagem e voz autorizadas"
                      : "Sem autorizacao de imagem e voz"}
                  </p>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => openEditModal(entrevistado)}
                    className="flex-1 cursor-pointer flex items-center justify-center gap-2 p-2 bg-[var(--surte-azul-primario)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(entrevistado)}
                    disabled={deletingId === entrevistado.id}
                    className="flex-1 cursor-pointer flex items-center justify-center gap-2 p-2 border border-[var(--surte-vermelho)] text-[var(--surte-vermelho)] rounded-lg hover:bg-[var(--surte-vermelho)] hover:text-white transition-colors text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}

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
                {editingId ? "Editar Entrevistado" : "Novo Entrevistado"}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome_completo}
                    onChange={(event) => updateField("nome_completo", event.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Área de Atuação
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.area_atuacao}
                    onChange={(event) => updateField("area_atuacao", event.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(event) => updateField("telefone", event.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instituição
                </label>
                <input
                  type="text"
                  value={formData.instituicao}
                  onChange={(event) => updateField("instituicao", event.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temas
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.temas}
                  onChange={(event) => updateField("temas", event.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
                  placeholder="Ex: saude publica, educacao, tecnologia"
                />
              </div>

              <label className="flex items-center gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.autorizacao_imagem_voz}
                  onChange={(event) => updateField("autorizacao_imagem_voz", event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[var(--surte-azul-primario)] focus:ring-[var(--surte-azul-primario)]"
                />
                Autorização de uso de imagem e voz
              </label>

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
                  disabled={saving}
                  className="flex-1 cursor-pointer px-4 sm:px-6 py-3 bg-[var(--surte-azul-primario)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Salvando..." : editingId ? "Atualizar" : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onClick={() => (deletingId ? null : setConfirmDelete(null))}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[var(--surte-azul-escuro)]">
                  Excluir entrevistado
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Deseja mesmo excluir este entrevistado?
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                disabled={Boolean(deletingId)}
                className="cursor-pointer rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="font-semibold text-[var(--surte-azul-escuro)]">
                {confirmDelete.nome_completo}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {confirmDelete.email || "Sem e-mail informado"}
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                disabled={Boolean(deletingId)}
                className="flex-1 cursor-pointer rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDelete)}
                disabled={Boolean(deletingId)}
                className="flex-1 cursor-pointer rounded-lg bg-[var(--surte-vermelho)] px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
