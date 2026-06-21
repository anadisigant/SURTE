import { Settings, Bell, Shield, Users as UsersIcon } from "lucide-react";

export default function Configuracoes() {
  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--surte-azul-escuro)]">
          Configurações
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Gerencie as configurações do sistema
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[var(--surte-azul-primario)]/10 rounded-lg flex items-center justify-center">
              <Settings
                className="text-[var(--surte-azul-primario)]"
                size={20}
              />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--surte-azul-escuro)]">
              Configurações Gerais
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Instituição
              </label>
              <input
                type="text"
                defaultValue="SURTE - Rádio e TV Universitária"
                className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)] text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail de Contato
              </label>
              <input
                type="email"
                defaultValue="contato@surte.edu.br"
                className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--surte-azul-primario)] text-sm sm:text-base"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[var(--surte-laranja-principal)]/10 rounded-lg flex items-center justify-center">
              <Bell
                className="text-[var(--surte-laranja-principal)]"
                size={20}
              />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--surte-azul-escuro)]">
              Notificações
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium text-gray-700">
                  Notificar novos agendamentos
                </p>
                <p className="text-sm text-gray-500">
                  Receba e-mails quando houver novos agendamentos
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--surte-azul-primario)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--surte-azul-primario)]"></div>
              </label>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium text-gray-700">
                  Lembrete de confirmação
                </p>
                <p className="text-sm text-gray-500">
                  Enviar lembrete 24h antes de entrevistas agendadas
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--surte-azul-primario)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--surte-azul-primario)]"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[var(--surte-amarelo-destaque)]/10 rounded-lg flex items-center justify-center">
              <Shield className="text-[var(--surte-marrom)]" size={20} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--surte-azul-escuro)]">
              Privacidade e Segurança
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium text-gray-700">
                  Conformidade com LGPD
                </p>
                <p className="text-sm text-gray-500">
                  Exigir termos de consentimento de entrevistados
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--surte-azul-primario)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--surte-azul-primario)]"></div>
              </label>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium text-gray-700">Backup automático</p>
                <p className="text-sm text-gray-500">
                  Realizar backup diário dos dados
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--surte-azul-primario)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--surte-azul-primario)]"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[var(--surte-bege-claro)]/30 rounded-lg flex items-center justify-center">
              <UsersIcon className="text-[var(--surte-marrom)]" size={20} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--surte-azul-escuro)]">
              Gestão de Usuários
            </h2>
          </div>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Controle de acesso e permissões do sistema
          </p>
          <button className="w-full sm:w-auto bg-[var(--surte-azul-primario)] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium">
            Gerenciar Usuários
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button className="bg-[var(--surte-azul-primario)] text-white px-6 sm:px-8 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium">
            Salvar Alterações
          </button>
          <button className="px-6 sm:px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
