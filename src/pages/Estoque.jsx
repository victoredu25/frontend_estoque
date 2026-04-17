import { useEffect, useState } from "react";

export default function Estoque() {
  const [dados, setDados] = useState([]);
  const [filtroCor, setFiltroCor] = useState("");

  const PESO_MEDIO_ROLO = 18.5;

  useEffect(() => {
    fetch("http://localhost:3000/variacoes")
      .then(res => res.json())
      .then(data => setDados(data))
      .catch(err => console.error(err));
  }, []);

  const dadosFiltrados = dados.filter(item =>
    item.cor?.toLowerCase().includes(filtroCor.toLowerCase())
  );

  const totalRolos = dadosFiltrados.reduce(
    (acc, item) => acc + Number(item.quantidade_rolos || 0),
    0
  );

  const variedades = dadosFiltrados.length;

  const pesoEstimadoTotal = totalRolos * PESO_MEDIO_ROLO;

  function getStatus(qtd) {
    if (qtd < 10) return { label: "Estoque baixo", color: "text-red-400" };
    if (qtd <= 20) return { label: "Estoque médio", color: "text-yellow-400" };
    return { label: "Estoque alto", color: "text-green-400" };
  }

  return (
    <div className="text-white">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Estoque</h1>
        <p className="text-zinc-400 text-sm">
          Visão geral do estoque atual do sistema
        </p>
      </div>

      {/* FILTRO */}
      <div className="mb-4 flex gap-3">
        <input
          className="bg-zinc-900 border border-zinc-800 p-2 rounded-md w-72"
          placeholder="Buscar por cor..."
          value={filtroCor}
          onChange={(e) => setFiltroCor(e.target.value)}
        />

        <button
          onClick={() => setFiltroCor("")}
          className="bg-zinc-800 px-3 rounded-md"
        >
          Limpar
        </button>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <p className="text-zinc-400 text-sm">Total de rolos</p>
          <p className="text-2xl font-bold">{totalRolos}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <p className="text-zinc-400 text-sm">Peso estimado (kg)</p>
          <p className="text-2xl font-bold">
            {pesoEstimadoTotal.toFixed(1)} kg
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <p className="text-zinc-400 text-sm">Variedades</p>
          <p className="text-2xl font-bold">{variedades}</p>
        </div>

      </div>

      {/* TABELA */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">

        <div className="p-4 border-b border-zinc-800">
          <h2 className="font-semibold">Lista de variações</h2>
        </div>

        <table className="w-full text-sm">

          <thead className="text-left text-zinc-400 bg-zinc-950">
            <tr>
              <th className="p-3">Tecido</th>
              <th className="p-3">Cor</th>
              <th className="p-3">Rolos</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {dadosFiltrados.map((item) => {
              const status = getStatus(item.quantidade_rolos);

              return (
                <tr
                  key={item.id}
                  className="border-t border-zinc-800 hover:bg-zinc-800/40 transition"
                >

                  <td className="p-3 font-medium">
                    {item.tecido_nome || item.tecido_id}
                  </td>

                  <td className="p-3">
                    <span className="px-2 py-1 rounded-md bg-zinc-800">
                      {item.cor}
                    </span>
                  </td>

                  <td className="p-3 font-semibold">
                    {item.quantidade_rolos}
                  </td>

                  <td className="p-3">
                    <span className={`${status.color} font-semibold`}>
                      {status.label}
                    </span>
                  </td>

                </tr>
              );
            })}
          </tbody>

        </table>

      </div>
    </div>
  );
}