import { useMemo } from "react";

export default function VendaResumoModal({
  aberto,
  onClose,
  onConfirmar,
  cliente,
  vendedor,
  itens,
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

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[600px] max-h-[80vh] overflow-auto p-4 rounded shadow">

        <h2 className="text-xl mb-3">Resumo da Venda</h2>

        {/* INFO GERAL */}
        <div className="mb-3 text-sm">
          <p><b>Cliente:</b> {cliente}</p>
          <p><b>Vendedor:</b> {vendedor}</p>
        </div>

        {/* ITENS */}
        <div className="border-t pt-2">
          {itens.map((item, idx) => (
            <div key={idx} className="mb-2 border-b pb-2 text-sm">

              <p>
                <b>Tecido:</b> {item.tecido_nome || item.tecido_id}
              </p>

              <p>
                <b>Cor:</b> {item.cor}
              </p>

              <p>
                <b>Rolos:</b> {item.quantidade_rolos}
              </p>

              <p>
                <b>Pesos:</b> {item.pesos?.join(", ")}
              </p>

              <p>
                Subtotal: R$ {(
                  (item.pesos || []).reduce(
                    (a, p) => a + Number(p || 0) * (item.preco || 0),
                    0
                  )
                ).toFixed(2)}
              </p>

            </div>
          ))}
        </div>

        {/* TOTAL */}
        <h3 className="mt-3 text-lg">
          Total: R$ {total.toFixed(2)}
        </h3>

        {/* AÇÕES */}
        <div className="flex justify-end gap-2 mt-4">

          <button
            onClick={onClose}
            disabled={loading}
            className="bg-gray-400 text-white px-3 py-1"
          >
            Voltar
          </button>

          <button
            onClick={onConfirmar}
            disabled={loading}
            className="bg-green-600 text-white px-3 py-1"
          >
            {loading ? "Processando..." : "Confirmar Venda"}
          </button>

        </div>

      </div>
    </div>
  );
}