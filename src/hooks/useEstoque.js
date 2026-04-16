import { useEffect, useState } from "react";

export function useEstoque() {
  const [variacoes, setVariacoes] = useState([]);
  const [tecidos, setTecidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function carregarEstoque() {
      try {
        setLoading(true);

        const res = await fetch("http://localhost:3000/variacoes");
        const data = await res.json();

        // 1. filtra estoque disponível
        const filtrado = data.filter(v => v.quantidade_rolos > 0);

        setVariacoes(filtrado);

        // 2. tecidos únicos (baseado em tecido_id)
        const tecidosUnicos = [
          ...new Map(
            filtrado.map(v => [v.tecido_id, v])
          ).values()
        ];

        setTecidos(tecidosUnicos);

      } catch (err) {
        console.error("Erro ao carregar estoque:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    carregarEstoque();
  }, []);

  // função utilitária: cores por tecido
  function getCoresPorTecido(tecidoId) {
    return variacoes.filter(v => v.tecido_id == tecidoId);
  }

  // função utilitária: pegar preço do tecido
  function getPrecoTecido(tecidoId) {
    const tecido = tecidos.find(t => t.tecido_id == tecidoId);
    return tecido?.preco_por_kg || 0;
  }

  return {
    variacoes,
    tecidos,
    loading,
    error,
    getCoresPorTecido,
    getPrecoTecido
  };
}