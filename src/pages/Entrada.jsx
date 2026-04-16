import { useState } from "react";

export default function Entrada() {
  const [form, setForm] = useState({
    fornecedor_id: "",
    valor_total: "",
    recebido_por: "",
    tecido_id: ""
  });

  const [itens, setItens] = useState([
    { cor: "", quantidade_kg: "", quantidade_rolos: "" }
  ]);

  function handleFormChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  function handleItemChange(index, e) {
    const novosItens = [...itens];
    novosItens[index][e.target.name] = e.target.value;
    setItens(novosItens);
  }

  function adicionarItem() {
    setItens([
      ...itens,
      { cor: "", quantidade_kg: "", quantidade_rolos: "" }
    ]);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      fornecedor_id: Number(form.fornecedor_id),
      valor_total: Number(form.valor_total),
      recebido_por: Number(form.recebido_por),
      itens: itens.map(item => ({
        tecido_id: Number(form.tecido_id),
        cor: item.cor,
        quantidade_kg: Number(item.quantidade_kg),
        quantidade_rolos: Number(item.quantidade_rolos)
      }))
    };

    try {
      const res = await fetch("http://localhost:3000/entradas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      console.log(data);

      alert("Entrada criada com sucesso 🚀");
    } catch (err) {
      console.error(err);
      alert("Erro ao criar entrada");
    }
  }

  return (
    <div>
      <h1 className="text-2xl mb-4">Nova Entrada</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-md">
        <input name="fornecedor_id" placeholder="Fornecedor ID" onChange={handleFormChange} />
        <input name="valor_total" placeholder="Valor total" onChange={handleFormChange} />
        <input name="recebido_por" placeholder="Usuário ID" onChange={handleFormChange} />
        <input name="tecido_id" placeholder="Tecido ID" onChange={handleFormChange} />

        <hr />

        {itens.map((item, index) => (
          <div key={index} className="border p-2 rounded">
            <input
              name="cor"
              placeholder="Cor"
              onChange={(e) => handleItemChange(index, e)}
            />
            <input
              name="quantidade_kg"
              placeholder="KG"
              onChange={(e) => handleItemChange(index, e)}
            />
            <input
              name="quantidade_rolos"
              placeholder="Rolos"
              onChange={(e) => handleItemChange(index, e)}
            />
          </div>
        ))}

        <button type="button" onClick={adicionarItem} className="bg-gray-300 p-2">
          + Adicionar cor
        </button>

        <button className="bg-blue-500 text-white p-2 mt-2">
          Criar Entrada
        </button>
      </form>
    </div>
  );
}