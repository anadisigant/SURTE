import {
  Home,
  Users,
  Calendar,
  History,
  FileText,
  Settings,
  X,
} from "lucide-react";
import { NavLink } from "react-router";

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: Users, label: "Entrevistados", path: "/entrevistados" },
  { icon: Calendar, label: "Agendamentos", path: "/agendamentos" },
  { icon: History, label: "Histórico", path: "/historico" },
  { icon: FileText, label: "Relatórios", path: "/relatorios" },
  { icon: Settings, label: "Configurações", path: "/configuracoes" },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-[var(--surte-azul-escuro)] h-screen flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold">SURTE</h1>
            <p className="text-[var(--surte-amarelo-destaque)] text-sm mt-1">
              Sistema de Entrevistados
            </p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-white hover:bg-white/10 p-2 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                  isActive
                    ? "bg-[var(--surte-amarelo-destaque)] text-[var(--surte-azul-escuro)]"
                    : "text-white hover:bg-white/10"
                }`
              }
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--surte-amarelo-destaque)] flex items-center justify-center text-[var(--surte-azul-escuro)] font-bold">
              U
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Usuário Admin</p>
              <p className="text-white/60 text-xs">admin@surte.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
