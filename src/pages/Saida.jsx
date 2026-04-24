import { useEffect, useState } from "react";
import { useEstoque } from "../hooks/useEstoque";
import { useApi } from "../hooks/useApi";
import { usePersistedState } from "../hooks/usePersistedState";
import VendaResumoModal from "../components/VendaResumoModal";

export default function Saida() {
  const { tecidos, getCoresPorTecido, getPrecoTecido, variacoes } = useEstoque();
  const { get, post } = useApi();

  const [itens, setItens] = usePersistedState("saida_itens", []);
  const [clienteId, setClienteId] = usePersistedState("saida_cliente", "");
  const [vendedorId, setVendedorId] = usePersistedState("saida_vendedor", "");

  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [mostrarNovoCliente, setMostrarNovoCliente] = useState(false);

  const [novoCliente, setNovoCliente] = useState({
    nome: "",
    telefone: "",
    endereco: ""
  });

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const [mostrarResumo, setMostrarResumo] = useState(false);

  function getEstoqueDisponivel(tecido_id, cor) {
    const item = variacoes.find(
      v => v.tecido_id == tecido_id && v.cor == cor
    );
    return item?.quantidade_rolos || 0;
  }

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);

        const [clientesData, usuariosData] = await Promise.all([
          get("/clientes"),
          get("/usuarios")
        ]);

        setClientes(clientesData);
        setUsuarios(usuariosData);
      } catch {
        setErro("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

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

  function removerItem(index) {
    setItens(prev => prev.filter((_, i) => i !== index));
  }

  function atualizarItem(index, campo, valor) {
    setItens(prev => {
      const novos = [...prev];
      const item = { ...novos[index] };

      item[campo] = valor;

      if (campo === "tecido_id") {
        item.preco = getPrecoTecido(valor);
        item.cor = "";
      }

      if (campo === "cor") {
        const estoque = getEstoqueDisponivel(item.tecido_id, valor);
        item.quantidade_rolos = Math.min(item.quantidade_rolos || 1, estoque);

        item.pesos = Array.from(
          { length: item.quantidade_rolos },
          (_, i) => item.pesos?.[i] || ""
        );
      }

      if (campo === "quantidade_rolos") {
        const estoque = getEstoqueDisponivel(item.tecido_id, item.cor);

        const qtd = Math.max(1, Math.min(Number(valor || 1), estoque));

        item.quantidade_rolos = qtd;

        item.pesos = Array.from(
          { length: qtd },
          (_, i) => item.pesos?.[i] || ""
        );
      }

      novos[index] = item;
      return novos;
    });
  }

  function validarPeso(valor) {
    return /^\d+(\.\d{0,2})?$/.test(valor);
  }

  function calcularValorItem(item) {
    if (!item?.pesos?.length) return 0;

    return item.pesos.reduce((acc, p) => {
      return acc + (Number(p || 0) * (item.preco || 0));
    }, 0);
  }

  const total = itens.reduce((acc, item) => {
    return acc + calcularValorItem(item);
  }, 0);

  function abrirResumo() {
    if (!clienteId || !vendedorId) {
      setErro("Selecione cliente e vendedor");
      return;
    }

    if (itens.length === 0) {
      setErro("Adicione itens");
      return;
    }

    setErro(null);
    setMostrarResumo(true);
  }

  async function finalizarVenda() {
    const valido = itens.every(item =>
      item.tecido_id &&
      item.cor &&
      item.pesos?.length > 0 &&
      item.pesos.every(p => p && Number(p) > 0)
    );

    if (!valido) {
      setErro("Preencha todos os campos corretamente");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        cliente_id: Number(clienteId),
        vendedor_id: Number(vendedorId),
        data: new Date().toISOString().split("T")[0],
        hora: new Date().toTimeString().slice(0, 8),
        itens: itens.flatMap(item =>
          item.pesos.map(peso => ({
            tecido_id: Number(item.tecido_id),
            cor: item.cor,
            quantidade_rolos: 1,
            peso_kg: Number(peso)
          }))
        )
      };

      await post("/saidas", payload);

      setItens([]);
      setClienteId("");
      setVendedorId("");

      localStorage.removeItem("saida_itens");
      localStorage.removeItem("saida_cliente");
      localStorage.removeItem("saida_vendedor");

      setMensagem("Venda realizada com sucesso 🚀");
      setMostrarResumo(false);

    } catch {
      setErro("Erro ao finalizar venda");
    } finally {
      setLoading(false);
    }
  }

  function cancelarVenda() {
    const ok = window.confirm("Tem certeza que deseja cancelar a venda?");
    if (!ok) return;

    setItens([]);
    setClienteId("");
    setVendedorId("");
    setMensagem("Venda cancelada");
  }

  function salvarCliente() {
    const nomeValido = /^[A-Za-zÀ-ÿ\s]+$/.test(novoCliente.nome);
    const telefoneValido = /^\d{11}$/.test(novoCliente.telefone);

    if (!nomeValido) return setErro("Nome só pode conter letras");
    if (!telefoneValido) return setErro("Telefone deve ter 11 dígitos");

    post("/clientes", novoCliente)
      .then((res) => {
        setClientes(prev => [...prev, res]);
        setNovoCliente({ nome: "", telefone: "", endereco: "" });
        setMostrarNovoCliente(false);
        setErro(null);
        setMensagem("Cliente cadastrado com sucesso 🚀");
      })
      .catch(() => setErro("Erro ao cadastrar cliente"));
  }

  return (
    <div className="p-6 text-white">

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nova Venda</h1>
        <p className="text-zinc-400 text-sm">
          Registre saídas de estoque com precisão
        </p>
      </div>

      {erro && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 mb-3 rounded-lg">{erro}</div>}
      {mensagem && <div className="bg-green-500/20 border border-green-500 text-green-300 p-3 mb-3 rounded-lg">{mensagem}</div>}

      {/* CLIENTE / VENDEDOR */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl mb-6 flex gap-4 items-center">

        <select
          className="bg-zinc-800 p-2 rounded-md"
          value={clienteId}
          onChange={e => setClienteId(e.target.value)}
        >
          <option value="">Cliente</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>

        <select
          className="bg-zinc-800 p-2 rounded-md"
          value={vendedorId}
          onChange={e => setVendedorId(e.target.value)}
        >
          <option value="">Vendedor</option>
          {usuarios.map(u => (
            <option key={u.id} value={u.id}>{u.nome}</option>
          ))}
        </select>

        <button
          onClick={() => setMostrarNovoCliente(true)}
          className="bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-md text-sm"
        >
          + Cliente
        </button>
      </div>

      {/* MODAL CLIENTE */}
      {mostrarNovoCliente && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded-xl w-[400px]">

            <h2 className="text-lg font-bold mb-3">Novo Cliente</h2>

            <input
              placeholder="Nome"
              className="w-full p-2 mb-2 bg-zinc-800 rounded"
              value={novoCliente.nome}
              onChange={e => setNovoCliente({ ...novoCliente, nome: e.target.value })}
            />

            <input
              placeholder="Telefone"
              className="w-full p-2 mb-2 bg-zinc-800 rounded"
              value={novoCliente.telefone}
              onChange={e => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
            />

            <input
              placeholder="Endereço"
              className="w-full p-2 mb-3 bg-zinc-800 rounded"
              value={novoCliente.endereco}
              onChange={e => setNovoCliente({ ...novoCliente, endereco: e.target.value })}
            />

            <div className="flex gap-2">
              <button onClick={salvarCliente} className="bg-green-600 px-3 py-2 rounded">
                Salvar
              </button>

              <button onClick={() => setMostrarNovoCliente(false)} className="bg-red-600 px-3 py-2 rounded">
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ITENS */}
      {itens.map((item, index) => (
        <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">

          <div className="flex gap-3">

            <select
              className="bg-zinc-800 p-2 rounded-md"
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
              className="bg-zinc-800 p-2 rounded-md"
              value={item.cor}
              onChange={e => atualizarItem(index, "cor", e.target.value)}
            >
              <option value="">Cor</option>
              {getCoresPorTecido(item.tecido_id).map(c => (
                <option key={c.cor} value={c.cor}>{c.cor}</option>
              ))}
            </select>

            <input
              className="bg-zinc-800 p-2 rounded-md w-24"
              type="number"
              min="1"
              value={item.quantidade_rolos}
              onChange={e =>
                atualizarItem(index, "quantidade_rolos", e.target.value)
              }
            />
          </div>

          <div className="flex justify-between items-center mt-3">

            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: Number(item.quantidade_rolos || 0) }).map((_, i) => (
                <input
                  key={i}
                  className="bg-zinc-800 p-2 rounded-md w-24"
                  type="number"
                  step="0.01"
                  value={item.pesos?.[i] || ""}
                  onChange={e => {
                    const val = e.target.value;
                    if (!validarPeso(val) && val !== "") return;

                    setItens(prev => {
                      const novos = [...prev];
                      if (!novos[index].pesos) novos[index].pesos = [];
                      novos[index].pesos[i] = val;
                      return novos;
                    });
                  }}
                />
              ))}
            </div>

            <div className="text-green-400 font-bold">
              R$ {calcularValorItem(item).toFixed(2)}
            </div>

          </div>

          <button
            onClick={() => removerItem(index)}
            className="text-red-400 mt-3 text-sm"
          >
            Remover item
          </button>

        </div>
      ))}

      {/* BOTÃO */}
      <div className="mb-4">
        <button
          onClick={adicionarItem}
          className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-md"
        >
          + Adicionar Item
        </button>
      </div>

      {/* TOTAL */}
      <div className="text-xl font-bold mb-4">
        Total do pedido: R$ {total.toFixed(2)}
      </div>

      {/* AÇÕES */}
      <div className="flex gap-3">
        <button
          onClick={abrirResumo}
          className="bg-blue-600 px-4 py-2 rounded-md"
        >
          Confirmar Venda
        </button>

        <button
          onClick={cancelarVenda}
          className="bg-red-600 px-4 py-2 rounded-md"
        >
          Cancelar
        </button>
      </div>

      <VendaResumoModal
        aberto={mostrarResumo}
        onClose={() => setMostrarResumo(false)}
        onConfirmar={finalizarVenda}
        cliente={clientes.find(c => c.id == clienteId)?.nome}
        vendedor={usuarios.find(u => u.id == vendedorId)?.nome}
        itens={itens}
        tecidos={tecidos}
        loading={loading}
      />

    </div>
  );
}