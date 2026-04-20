import { createContext, useContext, useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { post } = useApi();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔁 restaura sessão
  useEffect(() => {
    const token = localStorage.getItem("token");
    const usuario = localStorage.getItem("usuario");

    if (token && usuario) {
      setUser(JSON.parse(usuario));
    }

    setLoading(false);
  }, []);

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
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}