import { useEffect, useState } from "react";

export default function Estoque() {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/variacoes")
      .then(res => res.json())
      .then(data => setDados(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1 className="text-2xl mb-4">Estoque</h1>

      <table className="w-full border rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Tecido ID</th>
            <th className="p-2 border">Cor</th>
            <th className="p-2 border">KG</th>
            <th className="p-2 border">Rolos</th>
          </tr>
        </thead>

        <tbody>
          {dados.map(item => (
            <tr key={item.id}>
              <td className="p-2 border">{item.tecido_id}</td>
              <td className="p-2 border">{item.cor}</td>
              <td className="p-2 border">{item.quantidade_kg}</td>
              <td className="p-2 border">{item.quantidade_rolos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}