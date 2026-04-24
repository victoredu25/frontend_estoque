import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./AppLayout";

import Historico from "./pages/Historico";
import Estoque from "./pages/Estoque";
import Entrada from "./pages/Entrada";
import Saida from "./pages/Saida";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Administracao from "./pages/Administracao";

import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔓 rota pública */}
        <Route path="/login" element={<Login />} />

        {/* 🔒 rotas protegidas */}
        <Route
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<Estoque />} />
          <Route path="/entrada" element={<Entrada />} />
          <Route path="/saida" element={<Saida />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/administracao" element={<Administracao />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;