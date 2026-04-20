import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();

  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(null);

  async function entrar() {
    try {
      await login(nome, senha);

      // 🔥 redireciona depois do login
      window.location.href = "/";
    } catch {
      setErro("Usuário ou senha inválidos");
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-zinc-900 text-white">

      <div className="bg-zinc-800 p-6 rounded-xl w-80">

        <h1 className="text-xl mb-4">Login</h1>

        {erro && <p className="text-red-400 mb-2">{erro}</p>}

        <input
          placeholder="Usuário"
          className="w-full p-2 mb-2 bg-zinc-700 rounded"
          value={nome}
          onChange={e => setNome(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          className="w-full p-2 mb-3 bg-zinc-700 rounded"
          value={senha}
          onChange={e => setSenha(e.target.value)}
        />

        <button
          onClick={entrar}
          className="w-full bg-blue-600 p-2 rounded hover:bg-blue-700"
        >
          Entrar
        </button>

      </div>
    </div>
  );
}