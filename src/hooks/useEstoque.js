import { useEffect, useState } from "react";

import axios from "axios";

const BASE_URL = "https://backend-estoque-8boj.onrender.com";

const api = axios.create({
  baseURL: BASE_URL
});

export function useEstoque() {
  const [variacoes, setVariacoes] = useState([]);
  const [tecidos, setTecidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function carregarEstoque() {
      try {
        setLoading(true);

        const [variacoesRes, tecidosRes] = await Promise.all([
          api.get('/variacoes'),
          api.get('/tecidos')
        ]);

        const variacoesData = variacoesRes.data;
        const tecidosData = tecidosRes.data;

        console.log('Tecidos data:', tecidosData);
        console.log('Variacoes data:', variacoesData);

        const filtrado = variacoesData.filter(v => v.quantidade_rolos > 0);

        setVariacoes(filtrado);

        setTecidos(tecidosData.map(t => ({
          ...t,
          tecido_id: t.id,
          tecido_nome: t.nome
        })));

      } catch (err) {
        console.error("Erro ao carregar estoque:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    carregarEstoque();
  }, []);

  function getCoresPorTecido(tecidoId) {
    return variacoes.filter(v => v.tecido_id == tecidoId);
  }

  function getPrecoTecido(tecidoId) {
    const tecido = tecidos.find(t => t.tecido_id == tecidoId);
    return tecido?.preco_por_kg || 0;
  }

  // 🆕 NOVO: valida estoque antes de vender
  function validarEstoqueVenda(itens) {
    const erros = [];

    for (const item of itens) {
      const variacao = variacoes.find(
        v => v.tecido_id == item.tecido_id && v.cor == item.cor
      );

      if (!variacao) {
        erros.push(`Estoque não encontrado (${item.cor})`);
        continue;
      }

      const totalRolosPedido = item.pesos.length;
      const estoqueDisponivel = variacao.quantidade_rolos;

      if (totalRolosPedido > estoqueDisponivel) {
        erros.push(
          `Estoque insuficiente (${item.cor}) → pedido: ${totalRolosPedido}, disponível: ${estoqueDisponivel}`
        );
      }
    }

    return {
      ok: erros.length === 0,
      erros
    };
  }

  return {
    variacoes,
    tecidos,
    loading,
    error,
    getCoresPorTecido,
    getPrecoTecido,
    validarEstoqueVenda // 👈 novo
  };
}