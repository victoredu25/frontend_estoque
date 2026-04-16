import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-5">
      <h1 className="text-xl font-bold mb-8">Estoque</h1>

      <nav className="flex flex-col gap-4">
        <Link to="/" className="hover:text-gray-300">Estoque</Link>
        <Link to="/entrada" className="hover:text-gray-300">Entrada</Link>
        <Link to="/saida" className="hover:text-gray-300">Saída</Link>
      </nav>
    </div>
  );
}