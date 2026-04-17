import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="fixed top-14 left-0 w-60 h-[calc(100vh-56px)] bg-zinc-950 border-r border-zinc-800 p-4">

      <div className="mb-6 text-zinc-400 text-sm uppercase tracking-widest">
        Menu
      </div>

      <nav className="flex flex-col gap-2">

        <Link
          to="/saida"
          className="px-3 py-2 rounded-md text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
        >
          Saídas
        </Link>

        <Link
          to="/entrada"
          className="px-3 py-2 rounded-md text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
        >
          Entradas
        </Link>

        <Link
          to="/"
          className="px-3 py-2 rounded-md text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
        >
          Estoque
        </Link>

        <Link
          to="/usuarios"
          className="px-3 py-2 rounded-md text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
        >
          Usuários
        </Link>

      </nav>

      <div className="absolute bottom-4 text-xs text-zinc-600">
        FP Malhas v1
      </div>

    </div>
  );
}