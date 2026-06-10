import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { buscarDashboard } from '../api/dashboard';
import { listarVendas } from '../api/vendas';
import type { Dashboard } from '../types/dashboard';
import type { Venda } from '../types/venda';

function vendasPorMes(vendas: Venda[]) {
  const meses: Record<string, number> = {};

  vendas.forEach((venda) => {
    const data = new Date(venda.dataVenda);
    const chave = `${data.getMonth() + 1}/${data.getFullYear()}`;
    meses[chave] = (meses[chave] || 0) + venda.valorTotal;
  });

  return Object.entries(meses).map(([mes, total]) => ({
    mes,
    total,
  }));
}

function topClientes(vendas: Venda[]) {
  const totais: Record<string, number> = {};

  vendas.forEach((venda) => {
    const nome = venda.cliente.nome;
    totais[nome] = (totais[nome] || 0) + venda.valorTotal;
  });

  return Object.entries(totais)
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
}

export function DashboardPage() {
  const [dados, setDados] = useState<Dashboard | null>(null);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([buscarDashboard(), listarVendas()])
      .then(([dashboard, listaVendas]) => {
        setDados(dashboard);
        setVendas(listaVendas);
      })
      .catch(() => setErro('Erro ao carregar dashboard.'))
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) return <p>Carregando dashboard...</p>;
  if (erro) return <p className="text-red-600">{erro}</p>;
  if (!dados) return null;

  const dadosMes = vendasPorMes(vendas);
  const dadosClientes = topClientes(vendas);

  const cards = [
    { titulo: 'Clientes', valor: dados.totalClientes },
    { titulo: 'Produtos', valor: dados.totalProdutos },
    { titulo: 'Vendas', valor: dados.totalVendas },
    { titulo: 'Faturamento hoje', valor: `R$ ${dados.faturamentoDia.toFixed(2)}` },
    { titulo: 'Faturamento mês', valor: `R$ ${dados.faturamentoMes.toFixed(2)}` },
    { titulo: 'Estoque baixo', valor: dados.produtosEstoqueBaixo },
  ];

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-amber-900">Dashboard</h2>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.titulo}
            className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-stone-500">{card.titulo}</p>
            <p className="text-2xl font-bold text-amber-900">{card.valor}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-amber-200 bg-white p-4">
          <h3 className="mb-4 font-semibold text-amber-900">Faturamento por mês</h3>
          {dadosMes.length === 0 ? (
            <p className="text-stone-500">Sem vendas cadastradas.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(valor: number) => `R$ ${valor.toFixed(2)}`} />
                <Bar dataKey="total" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-amber-200 bg-white p-4">
          <h3 className="mb-4 font-semibold text-amber-900">Top 5 clientes</h3>
          {dadosClientes.length === 0 ? (
            <p className="text-stone-500">Sem vendas cadastradas.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosClientes} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="nome" width={100} />
                <Tooltip formatter={(valor: number) => `R$ ${valor.toFixed(2)}`} />
                <Bar dataKey="total" fill="#b45309" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}