import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";
import { useEstoque } from "../hooks/useEstoque";

export default function Administracao() {
  const { get, post, put, del } = useApi();
  const { tecidos, variacoes } = useEstoque();

  const [abaAtiva, setAbaAtiva] = useState("tecidos");

  // Estados para dados
  const [usuarios, setUsuarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

  // Estados para formulários
  const [novoUsuario, setNovoUsuario] = useState({ nome: "", senha: "", tipo: "vendedor" });
  const [editandoUsuario, setEditandoUsuario] = useState(null);

  const [novoCliente, setNovoCliente] = useState({ nome: "", telefone: "", endereco: "" });
  const [editandoCliente, setEditandoCliente] = useState(null);

  const [novoFornecedor, setNovoFornecedor] = useState({ nome: "", telefone: "" });
  const [editandoFornecedor, setEditandoFornecedor] = useState(null);

  const [editandoTecido, setEditandoTecido] = useState(null);
  const [novoPreco, setNovoPreco] = useState("");

  // Estados de loading e mensagens
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [mensagem, setMensagem] = useState(null);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);
      const [u, c, f] = await Promise.all([
        get("/usuarios"),
        get("/clientes"),
        get("/fornecedores")
      ]);
      setUsuarios(u);
      setClientes(c);
      setFornecedores(f);
    } catch (err) {
      setErro("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  // ========== USUÁRIOS ==========
  async function salvarUsuario() {
    if (!novoUsuario.nome || !novoUsuario.senha) {
      setErro("Nome e senha são obrigatórios");
      return;
    }

    try {
      setLoading(true);
      const res = await post("/usuarios", novoUsuario);
      setUsuarios(prev => [...prev, res]);
      setNovoUsuario({ nome: "", senha: "" });
      setMensagem("Usuário criado com sucesso!");
      setErro(null);
    } catch {
      setErro("Erro ao criar usuário");
    } finally {
      setLoading(false);
    }
  }

  async function atualizarUsuario() {
    if (!editandoUsuario?.nome || !editandoUsuario?.tipo) {
      setErro("Nome e tipo são obrigatórios");
      return;
    }

    try {
      setLoading(true);
      await put(`/usuarios/${editandoUsuario.id}`, {
        nome: editandoUsuario.nome,
        tipo: editandoUsuario.tipo,
        senha: editandoUsuario.senha
      });
      setUsuarios(prev => prev.map(u =>
        u.id === editandoUsuario.id ? editandoUsuario : u
      ));
      setEditandoUsuario(null);
      setMensagem("Usuário atualizado!");
      setErro(null);
    } catch {
      setErro("Erro ao atualizar usuário");
    } finally {
      setLoading(false);
    }
  }

  async function excluirUsuario(id) {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      setLoading(true);
      await del(`/usuarios/${id}`);
      setUsuarios(prev => prev.filter(u => u.id !== id));
      setMensagem("Usuário excluído!");
    } catch {
      setErro("Erro ao excluir usuário");
    } finally {
      setLoading(false);
    }
  }

  // ========== CLIENTES ==========
  async function salvarCliente() {
    if (!novoCliente.nome) {
      setErro("Nome é obrigatório");
      return;
    }

    try {
      setLoading(true);
      const res = await post("/clientes", novoCliente);
      setClientes(prev => [...prev, res]);
      setNovoCliente({ nome: "", telefone: "", endereco: "" });
      setMensagem("Cliente criado com sucesso!");
      setErro(null);
    } catch {
      setErro("Erro ao criar cliente");
    } finally {
      setLoading(false);
    }
  }

  async function atualizarCliente() {
    if (!editandoCliente?.nome) {
      setErro("Nome é obrigatório");
      return;
    }

    try {
      setLoading(true);
      await put(`/clientes/${editandoCliente.id}`, editandoCliente);
      setClientes(prev => prev.map(c =>
        c.id === editandoCliente.id ? editandoCliente : c
      ));
      setEditandoCliente(null);
      setMensagem("Cliente atualizado!");
      setErro(null);
    } catch {
      setErro("Erro ao atualizar cliente");
    } finally {
      setLoading(false);
    }
  }

  async function excluirCliente(id) {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return;

    try {
      setLoading(true);
      await del(`/clientes/${id}`);
      setClientes(prev => prev.filter(c => c.id !== id));
      setMensagem("Cliente excluído!");
      setErro(null);
    } catch (err) {
      console.error(err);
      setErro("Erro ao excluir cliente");
    } finally {
      setLoading(false);
    }
  }

  // ========== FORNECEDORES ==========
  async function salvarFornecedor() {
    if (!novoFornecedor.nome) {
      setErro("Nome é obrigatório");
      return;
    }

    try {
      setLoading(true);
      const res = await post("/fornecedores", novoFornecedor);
      setFornecedores(prev => [...prev, res]);
      setNovoFornecedor({ nome: "", telefone: "" });
      setMensagem("Fornecedor criado com sucesso!");
      setErro(null);
    } catch {
      setErro("Erro ao criar fornecedor");
    } finally {
      setLoading(false);
    }
  }

  async function atualizarFornecedor() {
    if (!editandoFornecedor?.nome) {
      setErro("Nome é obrigatório");
      return;
    }

    try {
      setLoading(true);
      await put(`/fornecedores/${editandoFornecedor.id}`, editandoFornecedor);
      setFornecedores(prev => prev.map(f =>
        f.id === editandoFornecedor.id ? editandoFornecedor : f
      ));
      setEditandoFornecedor(null);
      setMensagem("Fornecedor atualizado!");
      setErro(null);
    } catch {
      setErro("Erro ao atualizar fornecedor");
    } finally {
      setLoading(false);
    }
  }

  async function excluirFornecedor(id) {
    if (!confirm("Tem certeza que deseja excluir este fornecedor?")) return;

    try {
      setLoading(true);
      await del(`/fornecedores/${id}`);
      setFornecedores(prev => prev.filter(f => f.id !== id));
      setMensagem("Fornecedor excluído!");
      setErro(null);
    } catch (err) {
      console.error(err);
      setErro("Erro ao excluir fornecedor");
    } finally {
      setLoading(false);
    }
  }

  // ========== TECIDOS ==========
  async function atualizarPrecoTecido() {
    if (!editandoTecido || !novoPreco || Number(novoPreco) <= 0) {
      setErro("Preço deve ser maior que zero");
      return;
    }

    try {
      setLoading(true);
      await put(`/tecidos/${editandoTecido.tecido_id}`, {
        preco_por_kg: Number(novoPreco)
      });
      setMensagem("Preço atualizado com sucesso!");
      setEditandoTecido(null);
      setNovoPreco("");
      setErro(null);
      // Recarregar dados do estoque
      window.location.reload();
    } catch {
      setErro("Erro ao atualizar preço");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 text-white">

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Administração</h1>
        <p className="text-zinc-400 text-sm">
          Gerencie usuários, clientes, fornecedores e preços
        </p>
      </div>

      {erro && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 mb-3 rounded-lg">{erro}</div>}
      {mensagem && <div className="bg-green-500/20 border border-green-500 text-green-300 p-3 mb-3 rounded-lg">{mensagem}</div>}

      {/* ABAS */}
      <div className="flex gap-1 mb-6 bg-zinc-900 p-1 rounded-lg">
        {[
          { id: "tecidos", label: "Preços de Tecidos" },
          { id: "usuarios", label: "Usuários" },
          { id: "clientes", label: "Clientes" },
          { id: "fornecedores", label: "Fornecedores" }
        ].map(aba => (
          <button
            key={aba.id}
            onClick={() => setAbaAtiva(aba.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              abaAtiva === aba.id
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            {aba.label}
          </button>
        ))}
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">

        {/* TECIDOS */}
        {abaAtiva === "tecidos" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Preços de Tecidos</h2>

            <div className="space-y-3">
              {tecidos.length === 0 ? (
                <div className="p-4 bg-zinc-800 rounded-lg text-zinc-400">
                  Nenhum tecido encontrado. Verifique se há tecidos cadastrados ou estoque disponível.
                </div>
              ) : (
                tecidos.map(tecido => (
                  <div key={tecido.tecido_id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                  <div>
                    <p className="font-semibold">{tecido.tecido_nome}</p>
                    <p className="text-sm text-zinc-400">
                      Preço atual: R$ {Number(tecido.preco_por_kg || 0).toFixed(2)}/kg
                    </p>
                  </div>

                  {editandoTecido?.tecido_id === tecido.tecido_id ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={novoPreco}
                        onChange={e => setNovoPreco(e.target.value)}
                        className="bg-zinc-700 p-2 rounded w-24"
                        placeholder="Novo preço"
                      />
                      <button
                        onClick={atualizarPrecoTecido}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-500 px-3 py-2 rounded text-sm"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => {
                          setEditandoTecido(null);
                          setNovoPreco("");
                        }}
                        className="bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditandoTecido(tecido);
                        setNovoPreco(tecido.preco_por_kg || "");
                      }}
                      className="bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded text-sm"
                    >
                      Editar Preço
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USUÁRIOS */}
        {abaAtiva === "usuarios" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Usuários</h2>

            {/* FORM NOVO USUÁRIO */}
            <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
              <h3 className="font-semibold mb-3">Novo Usuário</h3>
              <div className="flex gap-3">
                <input
                  placeholder="Nome"
                  className="bg-zinc-700 p-2 rounded flex-1"
                  value={novoUsuario.nome}
                  onChange={e => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
                />
                <input
                  type="password"
                  placeholder="Senha"
                  className="bg-zinc-700 p-2 rounded flex-1"
                  value={novoUsuario.senha}
                  onChange={e => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
                />
                <select
                  value={novoUsuario.tipo}
                  onChange={e => setNovoUsuario({ ...novoUsuario, tipo: e.target.value })}
                  className="bg-zinc-700 p-2 rounded"
                >
                  <option value="admin">Admin</option>
                  <option value="vendedor">Vendedor</option>
                  <option value="gerente">Gerente</option>
                </select>
                <button
                  onClick={salvarUsuario}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded"
                >
                  Criar
                </button>
              </div>
            </div>

            {/* LISTA USUÁRIOS */}
            <div className="space-y-2">
              {usuarios.map(usuario => (
                <div key={usuario.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                  {editandoUsuario?.id === usuario.id ? (
                    <div className="flex gap-2 flex-1">
                      <input
                        placeholder="Nome"
                        className="bg-zinc-700 p-2 rounded flex-1"
                        value={editandoUsuario.nome}
                        onChange={e => setEditandoUsuario({ ...editandoUsuario, nome: e.target.value })}
                      />
                      <input
                        type="password"
                        placeholder="Nova senha (opcional)"
                        className="bg-zinc-700 p-2 rounded flex-1"
                        value={editandoUsuario.senha}
                        onChange={e => setEditandoUsuario({ ...editandoUsuario, senha: e.target.value })}
                      />
                      <select
                        value={editandoUsuario.tipo}
                        onChange={e => setEditandoUsuario({ ...editandoUsuario, tipo: e.target.value })}
                        className="bg-zinc-700 p-2 rounded"
                      >
                        <option value="admin">Admin</option>
                        <option value="vendedor">Vendedor</option>
                        <option value="gerente">Gerente</option>
                      </select>
                      <button
                        onClick={atualizarUsuario}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-500 px-3 py-2 rounded text-sm"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setEditandoUsuario(null)}
                        className="bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="font-semibold">{usuario.nome}</p>
                        <p className="text-sm text-zinc-400">ID: {usuario.id} · {usuario.tipo}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditandoUsuario({ ...usuario, senha: "" })}
                          className="bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => excluirUsuario(usuario.id)}
                          className="bg-red-600 hover:bg-red-500 px-3 py-2 rounded text-sm"
                        >
                          Excluir
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CLIENTES */}
        {abaAtiva === "clientes" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Clientes</h2>

            {/* FORM NOVO CLIENTE */}
            <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
              <h3 className="font-semibold mb-3">Novo Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  placeholder="Nome"
                  className="bg-zinc-700 p-2 rounded"
                  value={novoCliente.nome}
                  onChange={e => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                />
                <input
                  placeholder="Telefone"
                  className="bg-zinc-700 p-2 rounded"
                  value={novoCliente.telefone}
                  onChange={e => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
                />
                <input
                  placeholder="Endereço"
                  className="bg-zinc-700 p-2 rounded"
                  value={novoCliente.endereco}
                  onChange={e => setNovoCliente({ ...novoCliente, endereco: e.target.value })}
                />
              </div>
              <button
                onClick={salvarCliente}
                disabled={loading}
                className="mt-3 bg-green-600 hover:bg-green-500 px-4 py-2 rounded"
              >
                Criar Cliente
              </button>
            </div>

            {/* LISTA CLIENTES */}
            <div className="space-y-2">
              {clientes.map(cliente => (
                <div key={cliente.id} className="p-3 bg-zinc-800 rounded-lg">
                  {editandoCliente?.id === cliente.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          placeholder="Nome"
                          className="bg-zinc-700 p-2 rounded"
                          value={editandoCliente.nome}
                          onChange={e => setEditandoCliente({ ...editandoCliente, nome: e.target.value })}
                        />
                        <input
                          placeholder="Telefone"
                          className="bg-zinc-700 p-2 rounded"
                          value={editandoCliente.telefone}
                          onChange={e => setEditandoCliente({ ...editandoCliente, telefone: e.target.value })}
                        />
                        <input
                          placeholder="Endereço"
                          className="bg-zinc-700 p-2 rounded"
                          value={editandoCliente.endereco}
                          onChange={e => setEditandoCliente({ ...editandoCliente, endereco: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={atualizarCliente}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-500 px-3 py-2 rounded text-sm"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditandoCliente(null)}
                          className="bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{cliente.nome}</p>
                        <p className="text-sm text-zinc-400">
                          Tel: {cliente.telefone} | End: {cliente.endereco}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditandoCliente({ ...cliente })}
                          className="bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => excluirCliente(cliente.id)}
                          className="bg-red-600 hover:bg-red-500 px-3 py-2 rounded text-sm"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FORNECEDORES */}
        {abaAtiva === "fornecedores" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Fornecedores</h2>

            {/* FORM NOVO FORNECEDOR */}
            <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
              <h3 className="font-semibold mb-3">Novo Fornecedor</h3>
              <div className="flex gap-3">
                <input
                  placeholder="Nome"
                  className="bg-zinc-700 p-2 rounded flex-1"
                  value={novoFornecedor.nome}
                  onChange={e => setNovoFornecedor({ ...novoFornecedor, nome: e.target.value })}
                />
                <input
                  placeholder="Telefone"
                  className="bg-zinc-700 p-2 rounded flex-1"
                  value={novoFornecedor.telefone}
                  onChange={e => setNovoFornecedor({ ...novoFornecedor, telefone: e.target.value })}
                />
                <button
                  onClick={salvarFornecedor}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded"
                >
                  Criar
                </button>
              </div>
            </div>

            {/* LISTA FORNECEDORES */}
            <div className="space-y-2">
              {fornecedores.map(fornecedor => (
                <div key={fornecedor.id} className="p-3 bg-zinc-800 rounded-lg">
                  {editandoFornecedor?.id === fornecedor.id ? (
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <input
                          placeholder="Nome"
                          className="bg-zinc-700 p-2 rounded flex-1"
                          value={editandoFornecedor.nome}
                          onChange={e => setEditandoFornecedor({ ...editandoFornecedor, nome: e.target.value })}
                        />
                        <input
                          placeholder="Telefone"
                          className="bg-zinc-700 p-2 rounded flex-1"
                          value={editandoFornecedor.telefone}
                          onChange={e => setEditandoFornecedor({ ...editandoFornecedor, telefone: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={atualizarFornecedor}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-500 px-3 py-2 rounded text-sm"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditandoFornecedor(null)}
                          className="bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{fornecedor.nome}</p>
                        <p className="text-sm text-zinc-400">Tel: {fornecedor.telefone}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditandoFornecedor({ ...fornecedor })}
                          className="bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => excluirFornecedor(fornecedor.id)}
                          className="bg-red-600 hover:bg-red-500 px-3 py-2 rounded text-sm"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}