import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./AppLayout";

import Estoque from "./pages/Estoque";
import Entrada from "./pages/Entrada";
import Saida from "./pages/Saida";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Estoque />} />
          <Route path="/entrada" element={<Entrada />} />
          <Route path="/saida" element={<Saida />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;