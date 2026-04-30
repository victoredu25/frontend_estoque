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

        setVariacoes(variacoesData);

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

  function getCoresPorTecido(tecidoId, { inStock = true } = {}) {
    const id = Number(tecidoId);
    if (!id) return [];

    const coresUnicas = [];

    for (const variacao of variacoes) {
      if (Number(variacao.tecido_id) !== id) continue;
      if (inStock && Number(variacao.quantidade_rolos) <= 0) continue;

      const cor = String(variacao.cor || "").trim();
      if (!cor) continue;

      if (!coresUnicas.some(item => item.cor === cor)) {
        coresUnicas.push({ ...variacao, cor });
      }
    }

    return coresUnicas;
  }

  function getPrecoTecido(tecidoId) {
    const id = Number(tecidoId);
    if (!id) return 0;

    const tecido = tecidos.find(t => Number(t.tecido_id) === id);
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