import { useEffect, useState } from "react";
import { Search, Plus, Mail, Phone, Edit, Trash2, Eye, Users } from "lucide-react";
import api from "../services/api";

export default function Entrevistados() {
  const [entrevistados, setEntrevistados] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/entrevistados")
      .then((response) => {
        if (Array.isArray(response.data)) {
          setEntrevistados(response.data);
        } else if (response.data && Array.isArray(response.data.entrevistados)) {
          setEntrevistados(response.data.entrevistados);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao obter entrevistados:", error);
        setLoading(false);
      });
  }, []);

  const filteredEntrevistados = entrevistados.filter(
    (e) =>
      e.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.instituicao?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
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
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-[var(--surte-azul-primario)] text-white px-4 sm:px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium whitespace-nowrap"
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
            placeholder="Buscar por nome, área ou instituição..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        // Skeleton Loader
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-pulse">
          <div className="h-12 bg-gray-50 border-b border-gray-200"></div>
          <div className="space-y-4 p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      ) : filteredEntrevistados.length === 0 ? (
        // Empty State Placeholder
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
          <Users className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-[var(--surte-azul-escuro)] mb-1">
            Nenhum entrevistado encontrado
          </h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            {searchTerm ? "Nenhum cadastro corresponde à sua busca atual." : "Cadastre entrevistados no sistema para que apareçam aqui."}
          </p>
        </div>
      ) : (
        <>
          {/* Tabela para desktop */}
          <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Nome
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Área
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Instituição
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Contato
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Participações
                  </th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEntrevistados.map((entrevistado) => (
                  <tr
                    key={entrevistado.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-[var(--surte-azul-escuro)]">
                          {entrevistado.nome}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {Array.isArray(entrevistado.especialidades) &&
                            entrevistado.especialidades.map((esp, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-[var(--surte-bege-claro)] text-[var(--surte-azul-escuro)] px-2 py-1 rounded"
                              >
                                {esp}
                              </span>
                            ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--surte-azul-primario)] text-white">
                        {entrevistado.area}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {entrevistado.instituicao}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} />
                          {entrevistado.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} />
                          {entrevistado.telefone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-[var(--surte-laranja-principal)]">
                        {entrevistado.participacoes ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-[var(--surte-azul-primario)]"
                          title="Visualizar"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-[var(--surte-laranja-principal)]"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-[var(--surte-vermelho)]"
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

          {/* Cards para mobile */}
          <div className="lg:hidden space-y-4">
            {filteredEntrevistados.map((entrevistado) => (
              <div
                key={entrevistado.id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--surte-azul-escuro)] mb-2">
                      {entrevistado.nome}
                    </h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[var(--surte-azul-primario)] text-white">
                      {entrevistado.area}
                    </span>
                  </div>
                  <span className="text-xl font-bold text-[var(--surte-laranja-principal)]">
                    {entrevistado.participacoes ?? 0}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {Array.isArray(entrevistado.especialidades) &&
                    entrevistado.especialidades.map((esp, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-[var(--surte-bege-claro)] text-[var(--surte-azul-escuro)] px-2 py-1 rounded"
                      >
                        {esp}
                      </span>
                    ))}
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  {entrevistado.instituicao}
                </p>

                <div className="space-y-1 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={14} />
                    <span className="truncate">{entrevistado.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={14} />
                    {entrevistado.telefone}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 p-2 bg-[var(--surte-azul-primario)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm">
                    <Eye size={16} />
                    Ver
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 p-2 bg-[var(--surte-laranja-principal)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm">
                    <Edit size={16} />
                    Editar
                  </button>
                  <button className="p-2 border border-[var(--surte-vermelho)] text-[var(--surte-vermelho)] rounded-lg hover:bg-[var(--surte-vermelho)] hover:text-white transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
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
              Novo Entrevistado
            </h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Área de Atuação
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]">
                    <option>Selecione...</option>
                    <option>Saúde</option>
                    <option>Educação</option>
                    <option>Tecnologia</option>
                    <option>Meio Ambiente</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instituição
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especialidades (separadas por vírgula)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
                  placeholder="Ex: Cardiologia, Medicina Preventiva"
                />
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
                  className="flex-1 px-4 sm:px-6 py-3 bg-[var(--surte-azul-primario)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

