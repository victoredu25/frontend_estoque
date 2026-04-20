import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";

export default function Historico() {
  const { get } = useApi();

  const [dados, setDados] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [busca, setBusca] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [loading, setLoading] = useState(false);
  const [aberto, setAberto] = useState(null);

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);

        const [entradas, saidas] = await Promise.all([
          get("/entradas"),
          get("/saidas")
        ]);

        const entradasFormatadas = entradas.map(e => ({
          tipo: "entrada",
          data: e.data,
          hora: e.hora,
          nome: e.fornecedor_nome,
          usuario: e.recebido_por_nome,
          valor: e.valor_total,
          itens: e.itens || []
        }));

        const saidasFormatadas = saidas.map(s => ({
          tipo: "saida",
          data: s.data,
          hora: s.hora,
          nome: s.cliente_nome,
          usuario: s.vendedor_nome,
          valor: s.valor_total,
          itens: s.itens || []
        }));

        const tudo = [...entradasFormatadas, ...saidasFormatadas]
          .sort((a, b) => new Date(`${b.data} ${b.hora}`) - new Date(`${a.data} ${a.hora}`));

        setDados(tudo);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  // 🔎 FILTROS
  const dadosFiltrados = dados.filter(item => {
    if (filtro !== "todos" && item.tipo !== filtro) return false;

    if (busca && !item.nome?.toLowerCase().includes(busca.toLowerCase()))
      return false;

    // 🔥 intervalo de datas
    if (dataInicio && item.data < dataInicio) return false;
    if (dataFim && item.data > dataFim) return false;

    return true;
  });

  // 💰 TOTAL DO PERÍODO
  const totalDia = dadosFiltrados.reduce((acc, item) => {
    return acc + Number(item.valor || 0);
  }, 0);

  function getCor(tipo) {
    return tipo === "entrada"
      ? "text-green-400"
      : "text-blue-400";
  }

  function getLabel(tipo) {
    return tipo === "entrada" ? "Entrada" : "Saída";
  }

  return (
    <div className="p-6 text-white">

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Histórico</h1>
        <p className="text-zinc-400 text-sm">
          Movimentações do sistema
        </p>
      </div>

      {/* FILTROS */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl mb-6 flex flex-wrap gap-3 items-center">

        {/* tipo */}
        <button
          onClick={() => setFiltro("todos")}
          className={`px-4 py-2 rounded-md ${filtro === "todos" ? "bg-blue-600" : "bg-zinc-800"}`}
        >
          Todos
        </button>

        <button
          onClick={() => setFiltro("entrada")}
          className={`px-4 py-2 rounded-md ${filtro === "entrada" ? "bg-green-600" : "bg-zinc-800"}`}
        >
          Entradas
        </button>

        <button
          onClick={() => setFiltro("saida")}
          className={`px-4 py-2 rounded-md ${filtro === "saida" ? "bg-blue-600" : "bg-zinc-800"}`}
        >
          Saídas
        </button>

        {/* busca */}
        <input
          placeholder="Buscar por nome..."
          className="bg-zinc-800 p-2 rounded-md"
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />

        {/* data início */}
        <input
          type="date"
          className="bg-zinc-800 p-2 rounded-md"
          value={dataInicio}
          onChange={e => setDataInicio(e.target.value)}
        />

        {/* data fim */}
        <input
          type="date"
          className="bg-zinc-800 p-2 rounded-md"
          value={dataFim}
          onChange={e => setDataFim(e.target.value)}
        />

        {/* limpar */}
        <button
          onClick={() => {
            setBusca("");
            setDataInicio("");
            setDataFim("");
            setFiltro("todos");
          }}
          className="bg-zinc-700 px-3 py-2 rounded-md text-sm"
        >
          Limpar
        </button>

      </div>

      {/* TOTAL */}
      <div className="mb-4 text-xl font-bold">
        Total: R$ {totalDia.toFixed(2)}
      </div>

      {/* LISTA */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">

        {loading && (
          <div className="p-4 text-blue-400">Carregando...</div>
        )}

        {!loading && dadosFiltrados.length === 0 && (
          <div className="p-4 text-zinc-400">
            Nenhum registro encontrado
          </div>
        )}

        {!loading && dadosFiltrados.map((item, index) => {
          const isOpen = aberto === index;

          return (
            <div key={index} className="border-b border-zinc-800">

              <div
                onClick={() => setAberto(isOpen ? null : index)}
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-zinc-800/40"
              >

                <div>
                  <p className={`font-semibold ${getCor(item.tipo)}`}>
                    {getLabel(item.tipo)}
                  </p>

                  <p className="text-sm text-zinc-300">
                    {item.nome}
                  </p>

                  <p className="text-xs text-zinc-500">
                    {item.usuario}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold">
                    R$ {Number(item.valor || 0).toFixed(2)}
                  </p>

                  <p className="text-xs text-zinc-400">
                    {item.data} • {item.hora}
                  </p>
                </div>

              </div>

              {/* DETALHES */}
              {isOpen && (
                <div className="px-4 pb-4">

                  {item.itens.map((it, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-sm py-2 border-b border-zinc-800"
                    >
                      <div>
                        <p className="text-zinc-300">
                          {it.tecido_nome || `Tecido ${it.tecido_id}`}
                        </p>

                        <p className="text-xs text-zinc-500">
                          Cor: {it.cor}
                        </p>

                        {item.tipo === "saida" && (
                          <p className="text-xs text-zinc-500">
                            Peso: {it.peso_kg} kg
                          </p>
                        )}

                        {item.tipo === "entrada" && (
                          <p className="text-xs text-zinc-500">
                            Rolos: {it.quantidade_rolos}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between mt-3 pt-3 border-t border-zinc-700 font-bold">
                    <span>Total</span>
                    <span>R$ {Number(item.valor || 0).toFixed(2)}</span>
                  </div>

                </div>
              )}

            </div>
          );
        })}

      </div>

    </div>
  );
}