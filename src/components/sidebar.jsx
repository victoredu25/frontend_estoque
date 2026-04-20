import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="fixed top-14 left-0 w-60 h-[calc(100vh-56px)] bg-zinc-950 border-r border-zinc-800 p-4 flex flex-col">

      <div>
        <div className="mb-6 text-zinc-400 text-sm uppercase tracking-widest">
          Menu
        </div>

        <nav className="flex flex-col gap-2">

          <Link
            to="/"
            className="px-3 py-2 rounded-md text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
          >
            Estoque
          </Link>

          <Link
            to="/entrada"
            className="px-3 py-2 rounded-md text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
          >
            Entradas
          </Link>

          <Link
            to="/saida"
            className="px-3 py-2 rounded-md text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
          >
            Saídas
          </Link>

          <Link
            to="/historico"
            className="px-3 py-2 rounded-md text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
          >
            Histórico
          </Link>

          <Link
            to="/dashboard"
            className="px-3 py-2 rounded-md text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
          >
            Dashboard
          </Link>

        </nav>
      </div>

      {/* 🔥 PARTE DE BAIXO */}
      <div className="mt-auto">

        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 rounded-md text-red-400 hover:bg-red-500/10 hover:text-red-300 transition text-left"
        >
          Sair
        </button>

        <div className="mt-4 text-xs text-zinc-600">
          FP Malhas v1
        </div>

      </div>

    </div>
  );
}