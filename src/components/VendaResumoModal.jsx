import { useMemo } from "react";

export default function VendaResumoModal({
  aberto,
  onClose,
  onConfirmar,
  cliente,
  vendedor,
  itens,
  tecidos,
  loading
}) {
  const total = useMemo(() => {
    return itens.reduce((acc, item) => {
      const soma = (item.pesos || []).reduce((a, p) => {
        return a + Number(p || 0) * (item.preco || 0);
      }, 0);
      return acc + soma;
    }, 0);
  }, [itens]);

  const getTecidoNome = (tecidoId) => {
    const tecido = tecidos.find(t => t.tecido_id == tecidoId);
    return tecido?.tecido_nome || tecidoId;
  };

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-800 w-[600px] max-h-[80vh] overflow-auto p-6 rounded-xl text-white">

        <h2 className="text-2xl font-bold mb-4">Resumo da Venda</h2>

        {/* INFO GERAL */}
        <div className="mb-4 text-sm">
          <p className="mb-1"><b>Cliente:</b> {cliente}</p>
          <p><b>Vendedor:</b> {vendedor}</p>
        </div>

        {/* ITENS */}
        <div className="border-t border-zinc-700 pt-4">
          {itens.map((item, idx) => (
            <div key={idx} className="mb-4 border-b border-zinc-700 pb-4">

              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-lg">{getTecidoNome(item.tecido_id)}</p>
                  <p className="text-zinc-400">Cor: {item.cor}</p>
                  <p className="text-zinc-400">Quantidade de Rolos: {item.quantidade_rolos}</p>
                </div>
                <div className="text-green-400 font-bold text-lg">
                  R$ {(
                    (item.pesos || []).reduce(
                      (a, p) => a + Number(p || 0) * (item.preco || 0),
                      0
                    )
                  ).toFixed(2)}
                </div>
              </div>

              {/* LISTA DE ROLOS */}
              <div className="ml-4">
                <p className="text-sm text-zinc-400 mb-1">Detalhes dos Rolos:</p>
                {(item.pesos || []).map((peso, i) => (
                  <div key={i} className="text-sm flex justify-between">
                    <span>Rolo {i + 1}:</span>
                    <span>{peso} kg</span>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

        {/* TOTAL */}
        <div className="border-t border-zinc-700 pt-4 mt-4">
          <h3 className="text-xl font-bold text-green-400">
            Total da Venda: R$ {total.toFixed(2)}
          </h3>
        </div>

        {/* AÇÕES */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-md text-sm disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirmar}
            disabled={loading}
            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-md text-sm disabled:opacity-50"
          >
            {loading ? "Processando..." : "Confirmar Venda"}
          </button>
        </div>

      </div>
    </div>
  );
}