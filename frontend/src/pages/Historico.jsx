import { useEffect, useState } from "react";
import { Calendar, User, Tv, Play, History } from "lucide-react";
import api from "../services/api";

export default function Historico() {
  const [historico, setHistorico] = useState([]);
  const [filtroArea, setFiltroArea] = useState("todas");
  const [filtroPeriodo, setFiltroPeriodo] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/historico")
      .then((response) => {
        if (Array.isArray(response.data)) {
          setHistorico(response.data);
        } else if (response.data && Array.isArray(response.data.historico)) {
          setHistorico(response.data.historico);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao obter histórico:", error);
        setLoading(false);
      });
  }, []);

  const historicoFiltrado = historico.filter((item) => {
    if (filtroArea !== "todas" && item.area !== filtroArea) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        item.entrevistado?.toLowerCase().includes(term) ||
        item.programa?.toLowerCase().includes(term) ||
        item.tema?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const totalEntrevistas = historico.length;
  // Calculando somatório da duração se houver em formato legível, por enquanto mostra estático ou zerado
  const totalHoras = "0h 00min";
  const totalAudiencia = "0";

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--surte-azul-escuro)]">
          Histórico de Entrevistas
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Acompanhe todas as entrevistas realizadas
        </p>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Área
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
              value={filtroArea}
              onChange={(e) => setFiltroArea(e.target.value)}
            >
              <option value="todas">Todas as Áreas</option>
              <option value="Saúde">Saúde</option>
              <option value="Educação">Educação</option>
              <option value="Tecnologia">Tecnologia</option>
              <option value="Meio Ambiente">Meio Ambiente</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
              value={filtroPeriodo}
              onChange={(e) => setFiltroPeriodo(e.target.value)}
            >
              <option value="todos">Todos os Períodos</option>
              <option value="semana">Última Semana</option>
              <option value="mes">Último Mês</option>
              <option value="trimestre">Último Trimestre</option>
              <option value="ano">Último Ano</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Nome, programa ou tema..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        // Grid estatísticas em skeleton
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">
              Total de Entrevistas
            </p>
            <p className="text-xl sm:text-2xl font-bold text-[var(--surte-azul-primario)]">
              {totalEntrevistas}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">
              Horas Gravadas
            </p>
            <p className="text-xl sm:text-2xl font-bold text-[var(--surte-laranja-principal)]">
              {totalHoras}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">
              Audiência Total
            </p>
            <p className="text-xl sm:text-2xl font-bold text-[var(--surte-amarelo-destaque)]">
              {totalAudiencia}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        // List em skeleton
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100 animate-pulse space-y-4">
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
        // Empty State
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
          <History className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-[var(--surte-azul-escuro)] mb-1">
            Nenhuma entrevista realizada no histórico
          </h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            As entrevistas finalizadas ou realizadas aparecerão listadas aqui para consulta.
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
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-2">
                    <h3 className="text-base sm:text-lg font-bold text-[var(--surte-azul-escuro)]">
                      {item.tema}
                    </h3>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--surte-azul-primario)] text-white w-fit">
                      {item.area}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mt-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User
                        size={16}
                        className="text-[var(--surte-azul-primario)] flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Entrevistado</p>
                        <p className="text-sm font-medium truncate">
                          {item.entrevistado}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Tv
                        size={16}
                        className="text-[var(--surte-laranja-principal)] flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Programa</p>
                        <p className="text-sm font-medium truncate">
                          {item.programa}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar
                        size={16}
                        className="text-[var(--surte-amarelo-destaque)] flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Data</p>
                        <p className="text-sm font-medium">
                          {formatDate(item.data)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Play
                        size={16}
                        className="text-[var(--surte-bege-claro)] flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Duração</p>
                        <p className="text-sm font-medium">{item.duracao}</p>
                      </div>
                    </div>

                    {item.audiencia && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <User
                          size={16}
                          className="text-[var(--surte-laranja-secundario)] flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Audiência</p>
                          <p className="text-sm font-medium">{item.audiencia}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button className="lg:ml-4 px-4 py-2 bg-[var(--surte-azul-primario)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium whitespace-nowrap w-full lg:w-auto">
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

