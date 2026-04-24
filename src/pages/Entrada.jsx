import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";
import { useEstoque } from "../hooks/useEstoque";
import { usePersistedState } from "../hooks/usePersistedState";

export default function Entrada() {
  const { get, post } = useApi();
  const { tecidos, getCoresPorTecido } = useEstoque();

  const [fornecedores, setFornecedores] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [itens, setItens] = usePersistedState("entrada_itens", []);
  const [fornecedorId, setFornecedorId] = usePersistedState("entrada_fornecedor", "");
  const [tecidoId, setTecidoId] = usePersistedState("entrada_tecido", "");
  const [recebidoPor, setRecebidoPor] = usePersistedState("entrada_recebido_por", "");
  const [valorTotal, setValorTotal] = usePersistedState("entrada_valor_total", "");

  const [novoFornecedor, setNovoFornecedor] = useState({ nome: "", telefone: "" });
  const [mostrarNovoFornecedor, setMostrarNovoFornecedor] = useState(false);

  const [erro, setErro] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function carregar() {
      const [f, u] = await Promise.all([
        get("/fornecedores"),
        get("/usuarios")
      ]);

      setFornecedores(f);
      setUsuarios(u);
    }

    carregar();
  }, []);

  function adicionarItem() {
    if (!tecidoId) {
      setErro("Selecione um tecido primeiro");
      return;
    }

    setItens(prev => [
      ...prev,
      { cor: "", quantidade_rolos: 1 }
    ]);
  }

  function atualizarItem(index, campo, valor) {
    setItens(prev => {
      const copia = [...prev];
      copia[index][campo] = valor;
      return copia;
    });
  }

  function removerItem(index) {
    setItens(prev => prev.filter((_, i) => i !== index));
  }

  function validar() {
    if (!fornecedorId || !recebidoPor) return "Fornecedor e usuário são obrigatórios";
    if (!tecidoId) return "Tecido obrigatório";
    if (!valorTotal || Number(valorTotal) <= 0) return "Valor total deve ser maior que zero";
    if (itens.length === 0) return "Adicione pelo menos uma cor";

    for (const i of itens) {
      if (!i.cor) return "Todas as cores são obrigatórias";
      if (!i.quantidade_rolos || Number(i.quantidade_rolos) <= 0)
        return "Rolos devem ser maiores que zero";
    }

    return null;
  }

  async function confirmarEntrada() {
    const msgErro = validar();
    if (msgErro) {
      setErro(msgErro);
      return;
    }

    const ok = window.confirm("Confirmar entrada?");
    if (!ok) return;

    try {
      setLoading(true);

      await post("/entradas", {
        fornecedor_id: Number(fornecedorId),
        valor_total: Number(valorTotal),
        recebido_por: Number(recebidoPor),
        itens: itens.map(i => ({
          tecido_id: Number(tecidoId),
          cor: i.cor,
          quantidade_rolos: Number(i.quantidade_rolos)
        }))
      });

      setItens([]);
      setFornecedorId("");
      setTecidoId("");
      setRecebidoPor("");
      setValorTotal("");

      setMensagem("Entrada registrada 🚀");
      setErro(null);

    } catch {
      setErro("Erro ao registrar entrada");
    } finally {
      setLoading(false);
    }
  }

  async function salvarFornecedor() {
    if (!novoFornecedor.nome) return;

    const res = await post("/fornecedores", novoFornecedor);

    setFornecedores(prev => [...prev, res]);
    setFornecedorId(res.id);

    setNovoFornecedor({ nome: "", telefone: "" });
    setMostrarNovoFornecedor(false);
  }

  return (
    <div className="p-6 text-white">

      <h1 className="text-3xl font-bold mb-6">Nova Entrada</h1>

      {erro && <div className="bg-red-500/20 p-3 rounded mb-3">{erro}</div>}
      {mensagem && <div className="bg-green-500/20 p-3 rounded mb-3">{mensagem}</div>}

      {/* TOPO */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex gap-4 mb-6">

        <select
          className="bg-zinc-800 p-2 rounded"
          value={fornecedorId}
          onChange={e => setFornecedorId(e.target.value)}
        >
          <option value="">Fornecedor</option>
          {fornecedores.map(f => (
            <option key={f.id} value={f.id}>{f.nome}</option>
          ))}
        </select>

        <button
          onClick={() => setMostrarNovoFornecedor(true)}
          className="bg-zinc-800 px-3 rounded"
        >
          + Fornecedor
        </button>

        <select
          className="bg-zinc-800 p-2 rounded"
          value={tecidoId}
          onChange={e => setTecidoId(e.target.value)}
        >
          <option value="">Tecido</option>
          {tecidos.map(t => (
            <option key={t.tecido_id} value={t.tecido_id}>
              {t.tecido_nome}
            </option>
          ))}
        </select>

        <select
          className="bg-zinc-800 p-2 rounded"
          value={recebidoPor}
          onChange={e => setRecebidoPor(e.target.value)}
        >
          <option value="">Recebido por</option>
          {usuarios.map(u => (
            <option key={u.id} value={u.id}>{u.nome}</option>
          ))}
        </select>

      </div>

      {/* ITENS */}
      {itens.map((item, index) => (
        <div key={index} className="bg-zinc-900 border border-zinc-800 p-4 rounded mb-3">

          <div className="flex gap-3">

            <select
              className="bg-zinc-800 p-2 rounded"
              value={item.cor}
              onChange={e => atualizarItem(index, "cor", e.target.value)}
            >
              <option value="">Cor</option>
              {getCoresPorTecido(tecidoId).map(c => (
                <option key={c.cor} value={c.cor}>{c.cor}</option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              className="bg-zinc-800 p-2 rounded w-24"
              value={item.quantidade_rolos}
              onChange={e =>
                atualizarItem(index, "quantidade_rolos", e.target.value)
              }
            />

          </div>

          <button
            onClick={() => removerItem(index)}
            className="text-red-400 mt-2 text-sm"
          >
            Remover
          </button>

        </div>
      ))}

      {/* BOTÃO ADD */}
      <button
        onClick={adicionarItem}
        className="bg-zinc-800 px-4 py-2 rounded mb-6"
      >
        + Adicionar cor
      </button>

      {/* VALOR TOTAL */}
      <div className="mb-6">
        <label className="block text-sm mb-2">Valor Total da Entrada (R$)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          className="bg-zinc-800 p-2 rounded w-48"
          value={valorTotal}
          onChange={e => setValorTotal(e.target.value)}
          placeholder="0.00"
        />
      </div>

      {/* FOOTER */}
      <div className="flex gap-3">

        <button
          onClick={confirmarEntrada}
          disabled={loading}
          className="bg-blue-600 px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Confirmar entrada"}
        </button>

        <button
          onClick={() => {
            if (confirm("Cancelar entrada?")) {
              setItens([]);
              setFornecedorId("");
              setTecidoId("");
              setRecebidoPor("");
              setValorTotal("");
            }
          }}
          className="bg-red-600 px-4 py-2 rounded"
        >
          Cancelar
        </button>

      </div>

      {/* MODAL FORNECEDOR */}
      {mostrarNovoFornecedor && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-zinc-900 p-6 rounded w-[400px]">

            <input
              placeholder="Nome"
              className="w-full p-2 bg-zinc-800 mb-2"
              value={novoFornecedor.nome}
              onChange={e =>
                setNovoFornecedor({ ...novoFornecedor, nome: e.target.value })
              }
            />

            <input
              placeholder="Telefone"
              className="w-full p-2 bg-zinc-800 mb-3"
              value={novoFornecedor.telefone}
              onChange={e =>
                setNovoFornecedor({ ...novoFornecedor, telefone: e.target.value })
              }
            />

            <div className="flex gap-2">
              <button onClick={salvarFornecedor} className="bg-green-600 px-3 py-2 rounded">
                Salvar
              </button>

              <button
                onClick={() => setMostrarNovoFornecedor(false)}
                className="bg-red-600 px-3 py-2 rounded"
              >
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}