import { useEffect, useState } from 'react';

const PYTHON_URL = 'http://localhost:8000';

interface ClienteChurn {
  id: number;
  nome: string;
  total_pedidos: number;
  valor_total: number;
  ticket_medio: number;
  dias_ultima_compra: number | null;
  propensao_compra: number;
  churn_score: number;
  classificacao: 'Alto risco' | 'Médio risco' | 'Baixo risco';
}

interface RespostaChurn {
  clientes: ClienteChurn[];
  importancia_features: Record<string, number>;
  total_alto_risco: number;
  total_medio_risco: number;
  total_baixo_risco: number;
}

const BADGE: Record<string, string> = {
  'Alto risco': 'bg-red-100 text-red-800',
  'Médio risco': 'bg-yellow-100 text-yellow-800',
  'Baixo risco': 'bg-green-100 text-green-800',
};

function nomeFeature(chave: string) {
  const mapa: Record<string, string> = {
    total_pedidos: 'Qtd. pedidos',
    valor_total: 'Valor total',
    ticket_medio: 'Ticket médio',
    dias_cadastro: 'Dias cadastrado',
    dias_ultima_compra: 'Dias sem comprar',
    frequencia_mensal: 'Freq. mensal',
  };
  return mapa[chave] ?? chave;
}

export function DecisaoEstrategicaPage() {
  const [dados, setDados] = useState<RespostaChurn | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtro, setFiltro] = useState<string>('Todos');

  useEffect(() => {
    fetch(`${PYTHON_URL}/clientes-churn`)
      .then((r) => {
        if (!r.ok) throw new Error('Erro na requisição');
        return r.json();
      })
      .then((json: RespostaChurn) => setDados(json))
      .catch(() =>
        setErro(
          'Não foi possível conectar ao serviço de IA. Certifique-se de que o serviço Python está rodando na porta 8000.',
        ),
      )
      .finally(() => setCarregando(false));
  }, []);

  if (carregando)
    return <p className="p-4 text-stone-500">Carregando análise de churn...</p>;

  if (erro)
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        <p className="font-semibold">Serviço indisponível</p>
        <p className="mt-1 text-sm">{erro}</p>
        <p className="mt-3 text-sm text-stone-600">
          Execute na pasta <code className="rounded bg-stone-100 px-1">python-service/</code>:
          <br />
          <code className="mt-1 block rounded bg-stone-100 px-2 py-1">
            pip install -r requirements.txt && uvicorn main:app --reload --port 8000
          </code>
        </p>
      </div>
    );

  if (!dados) return null;

  const clientesFiltrados =
    filtro === 'Todos'
      ? dados.clientes
      : dados.clientes.filter((c) => c.classificacao === filtro);

  const importanciaOrdenada = Object.entries(dados.importancia_features).sort(
    (a, b) => b[1] - a[1],
  );

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-amber-900">
        Decisão Estratégica — Churn & Scoring
      </h2>
      <p className="mb-6 text-sm text-stone-500">
        Classificação gerada por modelo Random Forest com normalização Min-Max e tratamento de outliers (IQR).
      </p>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{dados.total_alto_risco}</p>
          <p className="text-sm text-red-600">Alto risco de churn</p>
        </div>
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-center">
          <p className="text-2xl font-bold text-yellow-700">{dados.total_medio_risco}</p>
          <p className="text-sm text-yellow-600">Médio risco de churn</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{dados.total_baixo_risco}</p>
          <p className="text-sm text-green-600">Baixo risco de churn</p>
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 font-semibold text-amber-900">
          Importância das variáveis (Random Forest)
        </h3>
        <div className="flex flex-col gap-2">
          {importanciaOrdenada.map(([chave, valor]) => (
            <div key={chave} className="flex items-center gap-3">
              <span className="w-36 shrink-0 text-sm text-stone-600">
                {nomeFeature(chave)}
              </span>
              <div className="flex-1 rounded-full bg-stone-100">
                <div
                  className="h-3 rounded-full bg-amber-500"
                  style={{ width: `${(valor * 100).toFixed(0)}%` }}
                />
              </div>
              <span className="w-12 text-right text-sm font-medium text-stone-700">
                {(valor * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <span className="text-sm font-medium text-stone-600">Filtrar:</span>
        {['Todos', 'Alto risco', 'Médio risco', 'Baixo risco'].map((opcao) => (
          <button
            key={opcao}
            onClick={() => setFiltro(opcao)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              filtro === opcao
                ? 'bg-amber-600 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {opcao}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-amber-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-amber-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-amber-900">Nome</th>
              <th className="px-4 py-3 text-right font-semibold text-amber-900">Pedidos</th>
              <th className="px-4 py-3 text-right font-semibold text-amber-900">Total gasto</th>
              <th className="px-4 py-3 text-right font-semibold text-amber-900">Ticket médio</th>
              <th className="px-4 py-3 text-right font-semibold text-amber-900">Dias sem comprar</th>
              <th className="px-4 py-3 text-right font-semibold text-amber-900">Propensão</th>
              <th className="px-4 py-3 text-right font-semibold text-amber-900">Churn score</th>
              <th className="px-4 py-3 text-center font-semibold text-amber-900">Classificação</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map((c, i) => (
              <tr key={c.id} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                <td className="px-4 py-3">
                  <p className="font-medium text-stone-800">{c.nome}</p>
                </td>
                <td className="px-4 py-3 text-right text-stone-600">{c.total_pedidos}</td>
                <td className="px-4 py-3 text-right text-stone-600">
                  R$ {c.valor_total.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right text-stone-600">
                  R$ {c.ticket_medio.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right text-stone-500">
                  {c.dias_ultima_compra !== null ? `${c.dias_ultima_compra}d` : '—'}
                </td>
                <td className="px-4 py-3 text-right font-medium text-green-700">
                  {c.propensao_compra}%
                </td>
                <td className="px-4 py-3 text-right font-medium text-red-600">
                  {c.churn_score}%
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${BADGE[c.classificacao]}`}
                  >
                    {c.classificacao}
                  </span>
                </td>
              </tr>
            ))}
            {clientesFiltrados.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-stone-400">
                  Nenhum cliente nesta categoria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
