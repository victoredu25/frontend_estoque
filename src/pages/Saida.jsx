import { useEffect, useState } from "react";
import { useEstoque } from "../hooks/useEstoque";

export default function Saida() {
  const {
    tecidos,
    getCoresPorTecido,
    getPrecoTecido
  } = useEstoque();

  const [itens, setItens] = useState([]);

  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [clienteId, setClienteId] = useState("");
  const [vendedorId, setVendedorId] = useState("");

  // =========================
  // LOAD
  // =========================
  useEffect(() => {
    async function carregarDados() {
      try {
        const [resCli, resUser] = await Promise.all([
          fetch("http://localhost:3000/clientes"),
          fetch("http://localhost:3000/usuarios")
        ]);

        setClientes(await resCli.json());
        setUsuarios(await resUser.json());
      } catch (err) {
        console.error(err);
      }
    }

    carregarDados();
  }, []);

  // =========================
  // ITEM BASE
  // =========================
  function adicionarItem() {
    setItens(prev => [
      ...prev,
      {
        tecido_id: "",
        cor: "",
        quantidade_rolos: 1,
        pesos: [],
        preco: 0
      }
    ]);
  }

  // =========================
  // UPDATE ITEM
  // =========================
  function atualizarItem(index, campo, valor) {
    setItens(prev => {
      const novos = [...prev];
      const item = { ...novos[index] };

      item[campo] = valor;

      // muda tecido
      if (campo === "tecido_id") {
        item.preco = getPrecoTecido(valor);
        item.cor = "";
      }

      // muda quantidade → recria estrutura correta
      if (campo === "quantidade_rolos") {
        const qtd = Number(valor);

        item.pesos = Array.from(
          { length: qtd },
          (_, i) => item.pesos?.[i] || ""
        );
      }

      novos[index] = item;
      return novos;
    });
  }

  // =========================
  // TOTAL REAL
  // =========================
  const total = itens.reduce((acc, item) => {
    const soma = (item.pesos || []).reduce((a, p) => {
      return a + (Number(p) * (item.preco || 0));
    }, 0);

    return acc + soma;
  }, 0);

  // =========================
  // FINALIZAR VENDA
  // =========================
  async function finalizarVenda() {
    const payload = {
      cliente_id: Number(clienteId),
      vendedor_id: Number(vendedorId),
      data: new Date().toISOString().split("T")[0],
      hora: new Date().toTimeString().slice(0, 8),

      itens: itens.flatMap(item =>
        (item.pesos || []).map(peso => ({
          tecido_id: Number(item.tecido_id),
          cor: item.cor,
          quantidade_rolos: 1,
          peso_kg: Number(peso)
        }))
      )
    };

    try {
      await fetch("http://localhost:3000/saidas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      alert("Venda realizada 🚀");

      setItens([]);
      setClienteId("");
      setVendedorId("");

    } catch (err) {
      console.error(err);
      alert("Erro na venda");
    }
  }

  // =========================
  // RENDER
  // =========================
  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Nova Venda</h1>

      {/* CLIENTE + VENDEDOR */}
      <div className="flex gap-2 mb-4">

        <select value={clienteId} onChange={e => setClienteId(e.target.value)}>
          <option value="">Cliente</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>

        <select value={vendedorId} onChange={e => setVendedorId(e.target.value)}>
          <option value="">Vendedor</option>
          {usuarios.filter(u => u.tipo === "vendedor").map(u => (
            <option key={u.id} value={u.id}>{u.nome}</option>
          ))}
        </select>
      </div>

      {/* ITENS */}
      {itens.map((item, index) => {
        const cores = getCoresPorTecido(item.tecido_id);

        return (
          <div key={index} className="border p-3 mb-3">

            {/* linha principal */}
            <div className="flex gap-2">

              <select
                value={item.tecido_id}
                onChange={e => atualizarItem(index, "tecido_id", e.target.value)}
              >
                <option value="">Tecido</option>
                {tecidos.map(t => (
                  <option key={t.tecido_id} value={t.tecido_id}>
                    {t.tecido_nome}
                  </option>
                ))}
              </select>

              <select
                value={item.cor}
                onChange={e => atualizarItem(index, "cor", e.target.value)}
              >
                <option value="">Cor</option>
                {cores.map(c => (
                  <option key={c.cor} value={c.cor}>
                    {c.cor}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                value={item.quantidade_rolos}
                onChange={e =>
                  atualizarItem(index, "quantidade_rolos", e.target.value)
                }
                placeholder="Qtd rolos"
                className="border p-1 w-24"
              />
            </div>

            {/* inputs dinâmicos de peso */}
            <div className="flex gap-2 flex-wrap mt-2">
              {Array.from({ length: Number(item.quantidade_rolos || 0) }).map((_, i) => (
                <input
                  key={i}
                  type="number"
                  placeholder={`Rolo ${i + 1}`}
                  value={item.pesos?.[i] || ""}
                  onChange={e => {
                    setItens(prev => {
                      const novos = [...prev];

                      if (!novos[index].pesos) {
                        novos[index].pesos = [];
                      }

                      novos[index].pesos[i] = e.target.value;
                      return novos;
                    });
                  }}
                  className="border p-1 w-24"
                />
              ))}
            </div>

            {/* subtotal */}
            <div className="mt-2 text-green-600">
              Subtotal: R$ {(item.pesos || []).reduce(
                (a, p) => a + (Number(p) * (item.preco || 0)),
                0
              ).toFixed(2)}
            </div>

          </div>
        );
      })}

      <button onClick={adicionarItem} className="bg-gray-300 p-2 mt-2">
        + Adicionar Item
      </button>

      <h2 className="mt-4 text-xl">
        Total: R$ {total.toFixed(2)}
      </h2>

      <button onClick={finalizarVenda} className="bg-green-500 p-2 text-white mt-2">
        Confirmar Venda
      </button>
    </div>
  );
}