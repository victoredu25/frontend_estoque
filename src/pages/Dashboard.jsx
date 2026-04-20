import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";
import { useEstoque } from "../hooks/useEstoque";

function Card({ title, value }) {
  return (
    <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
      <p className="text-zinc-400 text-sm">{title}</p>
      <h2 className="text-2xl font-bold text-green-400">
        R$ {Number(value).toFixed(2)}
      </h2>
    </div>
  );
}

function Lista({ titulo, dados }) {
  return (
    <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
      <h2 className="mb-3 font-bold">{titulo}</h2>

      {dados.length === 0 && (
        <p className="text-zinc-500 text-sm">Sem dados</p>
      )}

      {dados.map(([nome, valor], i) => (
        <div
          key={i}
          className="flex justify-between text-sm py-1 border-b border-zinc-800"
        >
          <span>{nome}</span>
          <span>R$ {Number(valor).toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

function EstoqueCritico() {
  const { variacoes } = useEstoque();

  // pega só quem tem estoque baixo (ex: <= 10 rolos)
  const criticos = variacoes
    .map(v => ({
      nome: `${v.tecido_nome || "Tecido"} - ${v.cor}`,
      rolos: Number(v.quantidade_rolos || 0)
    }))
    .sort((a, b) => a.rolos - b.rolos)
    .slice(0, 5); // top 5 mais críticos

  const max = Math.max(...criticos.map(v => v.rolos), 1);

  return (
    <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
      <h2 className="mb-4 font-bold text-red-400">
        ⚠️ Estoque crítico
      </h2>

      {criticos.length === 0 && (
        <p className="text-zinc-500 text-sm">
          Nenhum tecido crítico
        </p>
      )}

      {criticos.map((item, i) => (
        <div key={i} className="mb-3">

          <div className="flex justify-between text-sm mb-1">
            <span>{item.nome}</span>
            <span>{item.rolos} rolos</span>
          </div>

          <div className="w-full bg-zinc-800 h-2 rounded">
            <div
              className={`h-2 rounded ${
                item.rolos <= 3
                  ? "bg-red-500"
                  : item.rolos <= 7
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${(item.rolos / max) * 100}%` }}
            />
          </div>

        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { get } = useApi();

  const [saidas, setSaidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState(30);

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        const s = await get("/saidas");
        setSaidas(s || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  const hoje = new Date();

  const dadosFiltrados = saidas.filter(s => {
    const data = new Date(s.data);
    const diff = (hoje - data) / (1000 * 60 * 60 * 24);
    return diff <= periodo;
  });

  // 💰 FATURAMENTO
  const total = dadosFiltrados.reduce(
    (acc, s) => acc + Number(s.valor_total || 0),
    0
  );

  // 🧍 TOP CLIENTES
  const clientesMap = {};
  dadosFiltrados.forEach(s => {
    const nome = s.cliente_nome || `Cliente ${s.cliente_id}`;
    clientesMap[nome] =
      (clientesMap[nome] || 0) + Number(s.valor_total || 0);
  });

  const topClientes = Object.entries(clientesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // 🧵 TOP VARIAÇÕES
  const variacoesMap = {};
  dadosFiltrados.forEach(s => {
    (s.itens || []).forEach(i => {
      const nome =
        (i.tecido_nome || `Tecido ${i.tecido_id}`) +
        " - " +
        (i.cor || "");

      const valor =
        Number(i.peso_kg || 0) * Number(i.preco || 0);

      variacoesMap[nome] =
        (variacoesMap[nome] || 0) + valor;
    });
  });

  const topVariacoes = Object.entries(variacoesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // 📊 VENDAS POR DIA (7 dias)
  const vendasPorDia = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    vendasPorDia[key] = 0;
  }

  dadosFiltrados.forEach(s => {
    if (vendasPorDia[s.data] !== undefined) {
      vendasPorDia[s.data] += Number(s.valor_total || 0);
    }
  });

  const maxVenda = Math.max(...Object.values(vendasPorDia), 1);

  // 📊 VENDAS POR VENDEDOR
  const vendedoresMap = {};
  dadosFiltrados.forEach(s => {
    const nome = s.vendedor_nome || `Vendedor ${s.vendedor_id}`;
    vendedoresMap[nome] =
      (vendedoresMap[nome] || 0) + Number(s.valor_total || 0);
  });

  const vendedoresLista = Object.entries(vendedoresMap).sort(
    (a, b) => b[1] - a[1]
  );

  const maxVendedor = Math.max(
    ...vendedoresLista.map(v => v[1]),
    1
  );

  if (loading) {
    return <div className="p-6 text-white">Carregando...</div>;
  }

  return (
    <div className="p-6 text-white">

      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* FILTRO */}
      <div className="flex gap-2 mb-6">
        {[7, 30, 90].map(p => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`px-4 py-2 rounded-md ${
              periodo === p ? "bg-blue-600" : "bg-zinc-800"
            }`}
          >
            {p} dias
          </button>
        ))}
      </div>

      {/* FATURAMENTO */}
      <div className="mb-6">
        <Card title={`Faturamento (${periodo} dias)`} value={total} />
      </div>

      {/* GRÁFICOS */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">

        {/* 📊 VENDAS 7 DIAS */}
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
          <h2 className="mb-4 font-bold">Vendas últimos 7 dias</h2>

          <div className="flex items-end gap-2 h-40">
            {Object.entries(vendasPorDia).map(([dia, valor], i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="bg-blue-500 w-full rounded-t"
                  style={{ height: `${(valor / maxVenda) * 100}%` }}
                />
                <span className="text-xs mt-1 text-zinc-400">
                  {dia.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 🧍 VENDAS POR VENDEDOR */}
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
          <h2 className="mb-4 font-bold">Vendas por vendedor</h2>

          {vendedoresLista.map(([nome, valor], i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>{nome}</span>
                <span>R$ {valor.toFixed(2)}</span>
              </div>

              <div className="w-full bg-zinc-800 h-2 rounded">
                <div
                  className="bg-green-500 h-2 rounded"
                  style={{ width: `${(valor / maxVendedor) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* LISTAS */}
      <div className="grid md:grid-cols-2 gap-4">
        <Lista titulo="Top clientes" dados={topClientes} />
        <Lista titulo="Top variações" dados={topVariacoes} />
      </div>

      {/* ESTOQUE CRÍTICO */}
      <div className="mt-6">
        <EstoqueCritico />
      </div>

    </div>
  );
}