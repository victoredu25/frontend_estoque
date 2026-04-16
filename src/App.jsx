import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/sidebar";
import Estoque from "./pages/Estoque";
import Entrada from "./pages/Entrada";
import Saida from "./pages/Saida";

function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        <Sidebar />

        <div className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Estoque />} />
            <Route path="/entrada" element={<Entrada />} />
            <Route path="/saida" element={<Saida />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;