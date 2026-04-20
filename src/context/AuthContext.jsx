import { createContext, useState } from "react";
import { useApi } from "../hooks/useApi";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { post } = useApi();

  // Inicializar estado diretamente do localStorage
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const usuario = localStorage.getItem("usuario");
    return token && usuario ? JSON.parse(usuario) : null;
  });

  async function login(nome, senha) {
    const res = await post("/auth/login", { nome, senha }); // 🔥 corrigido

    localStorage.setItem("token", res.token);
    localStorage.setItem("usuario", JSON.stringify(res.usuario));

    setUser(res.usuario);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };