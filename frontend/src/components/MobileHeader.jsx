import { Menu } from "lucide-react";

export default function MobileHeader({ onMenuClick }) {
  return (
    <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
      <button
        onClick={onMenuClick}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Menu size={24} className="text-[var(--surte-azul-escuro)]" />
      </button>
      <div>
        <h1 className="text-lg font-bold text-[var(--surte-azul-escuro)]">
          SURTE
        </h1>
      </div>
    </header>
  );
}
