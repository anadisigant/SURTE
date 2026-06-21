import { BrowserRouter, Routes, Route } from "react-router";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import MobileHeader from "./components/MobileHeader";
import Dashboard from "./pages/Dashboard";
import Entrevistados from "./pages/Entrevistados";
import Agendamentos from "./pages/Agendamentos";
import Historico from "./pages/Historico";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto w-full">
          <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/entrevistados" element={<Entrevistados />} />
              <Route path="/agendamentos" element={<Agendamentos />} />
              <Route path="/historico" element={<Historico />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
