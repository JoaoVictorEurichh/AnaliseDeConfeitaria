import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  buscarVendasPorProduto,
  buscarVendasPorCategoria,
  buscarVendasPorCidade,
  buscarVendasPorEstado,
  buscarRelatorioGerencial,
} from '../api/analise';
import type {
  VendaPorProduto,
  VendaPorCategoria,
  VendaPorCidade,
  VendaPorEstado,
  RelatorioGerencial,
} from '../api/analise';

const CORES_GRAFICO = [
  '#d97706', '#b45309', '#92400e', '#78350f', '#f59e0b',
  '#fbbf24', '#fcd34d', '#a16207', '#ca8a04', '#854d0e',
];

function formatarMoeda(valor: number) {
  return `R$ ${valor.toFixed(2)}`;
}

export function AnalisePage() {
  const [porProduto, setPorProduto] = useState<VendaPorProduto[]>([]);
  const [porCategoria, setPorCategoria] = useState<VendaPorCategoria[]>([]);
  const [porCidade, setPorCidade] = useState<VendaPorCidade[]>([]);
  const [porEstado, setPorEstado] = useState<VendaPorEstado[]>([]);
  const [relatorio, setRelatorio] = useState<RelatorioGerencial | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    Promise.all([
      buscarVendasPorProduto(),
      buscarVendasPorCategoria(),
      buscarVendasPorCidade(),
      buscarVendasPorEstado(),
      buscarRelatorioGerencial(),
    ])
      .then(([produtos, categorias, cidades, estados, rel]) => {
        setPorProduto(produtos);
        setPorCategoria(categorias);
        setPorCidade(cidades);
        setPorEstado(estados);
        setRelatorio(rel);
      })
      .catch(() => setErro('Erro ao carregar dados de análise.'))
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) return <p className="p-4 text-stone-500">Carregando análises...</p>;
  if (erro) return <p className="p-4 text-red-600">{erro}</p>;

  const top10Quantidade = porProduto.slice(0, 10);
  const top10Faturamento = [...porProduto]
    .sort((a, b) => b.faturamento - a.faturamento)
    .slice(0, 10);

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-amber-900">Análise de Dados</h2>

      {relatorio && (
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { titulo: 'Faturamento Total', valor: formatarMoeda(relatorio.faturamentoTotal) },
            { titulo: 'Total de Vendas', valor: relatorio.totalVendas },
            { titulo: 'Ticket Médio', valor: formatarMoeda(relatorio.ticketMedio) },
            { titulo: 'Total de Clientes', valor: relatorio.totalClientes },
          ].map((card) => (
            <div
              key={card.titulo}
              className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs text-stone-500">{card.titulo}</p>
              <p className="mt-1 text-xl font-bold text-amber-900">{card.valor}</p>
            </div>
          ))}
        </div>
      )}

      {relatorio && (relatorio.produtoMaisVendido || relatorio.produtoMaiorFaturamento) && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {relatorio.produtoMaisVendido && (
            <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                Produto mais vendido
              </p>
              <p className="mt-1 text-lg font-bold text-stone-800">
                {relatorio.produtoMaisVendido.nome}
              </p>
              <p className="text-sm text-stone-500">
                {relatorio.produtoMaisVendido.quantidade} unidades vendidas
              </p>
            </div>
          )}
          {relatorio.produtoMaiorFaturamento && (
            <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                Produto com maior faturamento
              </p>
              <p className="mt-1 text-lg font-bold text-stone-800">
                {relatorio.produtoMaiorFaturamento.nome}
              </p>
              <p className="text-sm text-stone-500">
                {formatarMoeda(relatorio.produtoMaiorFaturamento.faturamento)}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
          <h3 className="mb-1 font-semibold text-amber-900">Top 10 produtos — quantidade vendida</h3>
          <p className="mb-4 text-xs text-stone-400">Unidades vendidas por produto</p>
          {top10Quantidade.length === 0 ? (
            <p className="text-stone-400">Sem dados.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={top10Quantidade} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="produto" width={80} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${Number(v ?? 0)} un.`, 'Qtd. vendida']} />
                <Bar dataKey="quantidadeVendida" fill="#d97706" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
          <h3 className="mb-1 font-semibold text-amber-900">Top 10 produtos — faturamento</h3>
          <p className="mb-4 text-xs text-stone-400">Receita gerada por produto</p>
          {top10Faturamento.length === 0 ? (
            <p className="text-stone-400">Sem dados.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={top10Faturamento} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="produto" width={80} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [formatarMoeda(Number(v ?? 0)), 'Faturamento']} />
                <Bar dataKey="faturamento" fill="#b45309" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
          <h3 className="mb-1 font-semibold text-amber-900">Faturamento por categoria</h3>
          <p className="mb-4 text-xs text-stone-400">Receita agrupada por categoria de produto</p>
          {porCategoria.length === 0 ? (
            <p className="text-stone-400">Sem dados.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={porCategoria}
                  dataKey="faturamento"
                  nameKey="categoria"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {porCategoria.map((_, idx) => (
                    <Cell key={idx} fill={CORES_GRAFICO[idx % CORES_GRAFICO.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatarMoeda(Number(v ?? 0))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
          <h3 className="mb-1 font-semibold text-amber-900">Faturamento por cidade</h3>
          <p className="mb-4 text-xs text-stone-400">Receita agrupada pela cidade do cliente</p>
          {porCidade.length === 0 ? (
            <p className="text-stone-400">Sem dados ou clientes sem cidade cadastrada.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={porCidade}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cidade" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip
                  formatter={(v, name) =>
                    name === 'faturamento'
                      ? [formatarMoeda(Number(v ?? 0)), 'Faturamento']
                      : [`${Number(v ?? 0)}`, 'Vendas']
                  }
                />
                <Bar dataKey="faturamento" fill="#d97706" radius={[4, 4, 0, 0]} name="faturamento" />
                <Bar dataKey="totalVendas" fill="#92400e" radius={[4, 4, 0, 0]} name="totalVendas" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
          <h3 className="mb-1 font-semibold text-amber-900">Faturamento por estado</h3>
          <p className="mb-4 text-xs text-stone-400">Receita agrupada pelo estado do cliente</p>
          {porEstado.length === 0 ? (
            <p className="text-stone-400">Sem dados ou clientes sem estado cadastrado.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={porEstado}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="estado" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip
                  formatter={(v, name) =>
                    name === 'faturamento'
                      ? [formatarMoeda(Number(v ?? 0)), 'Faturamento']
                      : [`${Number(v ?? 0)}`, 'Vendas']
                  }
                />
                <Bar dataKey="faturamento" fill="#b45309" radius={[4, 4, 0, 0]} name="faturamento" />
                <Bar dataKey="totalVendas" fill="#78350f" radius={[4, 4, 0, 0]} name="totalVendas" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {relatorio && relatorio.produtosEstoqueBaixo.length > 0 && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4">
          <h3 className="mb-3 font-semibold text-red-800">Alerta: estoque baixo</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-red-200">
                  <th className="py-2 text-left text-red-700">Produto</th>
                  <th className="py-2 text-left text-red-700">Categoria</th>
                  <th className="py-2 text-left text-red-700">Estoque</th>
                </tr>
              </thead>
              <tbody>
                {relatorio.produtosEstoqueBaixo.map((p, i) => (
                  <tr key={i} className="border-b border-red-100">
                    <td className="py-2 font-medium text-stone-800">{p.nome}</td>
                    <td className="py-2 text-stone-600">{p.categoria}</td>
                    <td className="py-2 font-bold text-red-700">{p.estoque}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
