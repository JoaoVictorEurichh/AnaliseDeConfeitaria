import { useEffect, useState } from 'react';
import { listarProdutos, criarProduto, adicionarEstoque } from '../api/produtos';
import { listarCategorias } from '../api/categorias';
import type { Produto } from '../types/produto';
import type { Categoria } from '../types/categoria';

export function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [salvando, setSalvando] = useState(false);

  const [qtdEstoque, setQtdEstoque] = useState<Record<number, string>>({});
  const [adicionando, setAdicionando] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([listarProdutos(), listarCategorias()])
      .then(([listaProdutos, listaCategorias]) => {
        setProdutos(listaProdutos);
        setCategorias(listaCategorias);
      })
      .catch(() => setErro('Não foi possível carregar os produtos.'))
      .finally(() => setCarregando(false));
  }, []);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro('');

    try {
      await criarProduto({
        nome,
        preco: Number(preco),
        estoque: Number(estoque),
        categoriaId: Number(categoriaId),
      });

      const atualizados = await listarProdutos();
      setProdutos(atualizados);
      setNome('');
      setPreco('');
      setEstoque('');
      setCategoriaId('');
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar produto.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleAdicionarEstoque(produtoId: number) {
    const qtd = Number(qtdEstoque[produtoId]);
    if (!qtd || qtd <= 0) return;

    setAdicionando(produtoId);
    setErro('');

    try {
      await adicionarEstoque(produtoId, qtd);
      const atualizados = await listarProdutos();
      setProdutos(atualizados);
      setQtdEstoque((prev) => ({ ...prev, [produtoId]: '' }));
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao adicionar estoque.');
    } finally {
      setAdicionando(null);
    }
  }

  if (carregando) return <p className="p-4 text-stone-500">Carregando...</p>;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-amber-900">Produtos</h2>

      {erro && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{erro}</p>
      )}

      <div className="mb-8 rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 font-semibold text-amber-900">Novo produto</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            placeholder="Nome *"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Preço *"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            required
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <input
            type="number"
            min="0"
            placeholder="Estoque inicial *"
            value={estoque}
            onChange={(e) => setEstoque(e.target.value)}
            required
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            required
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="">Selecione a categoria *</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={salvando}
              className="rounded-lg bg-amber-600 px-5 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>

      <div className="overflow-x-auto rounded-xl border border-amber-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-amber-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-amber-900">ID</th>
              <th className="px-4 py-3 text-left font-semibold text-amber-900">Nome</th>
              <th className="px-4 py-3 text-left font-semibold text-amber-900">Preço</th>
              <th className="px-4 py-3 text-left font-semibold text-amber-900">Estoque</th>
              <th className="px-4 py-3 text-left font-semibold text-amber-900">Categoria</th>
              <th className="px-4 py-3 text-left font-semibold text-amber-900">Adicionar estoque</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((produto, i) => (
              <tr key={produto.id} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                <td className="px-4 py-3 text-stone-500">{produto.id}</td>
                <td className="px-4 py-3 font-medium text-stone-800">{produto.nome}</td>
                <td className="px-4 py-3 text-stone-600">R$ {produto.preco.toFixed(2)}</td>
                <td className="px-4 py-3 font-semibold text-amber-800">{produto.estoque}</td>
                <td className="px-4 py-3 text-stone-500">
                  {categorias.find((c) => c.id === produto.categoriaId)?.nome ?? '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qtd."
                      value={qtdEstoque[produto.id] ?? ''}
                      onChange={(e) =>
                        setQtdEstoque((prev) => ({ ...prev, [produto.id]: e.target.value }))
                      }
                      className="w-20 rounded-lg border border-stone-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <button
                      onClick={() => handleAdicionarEstoque(produto.id)}
                      disabled={adicionando === produto.id || !qtdEstoque[produto.id]}
                      className="rounded-lg bg-amber-500 px-3 py-1 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-40"
                    >
                      {adicionando === produto.id ? '...' : '+'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {produtos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-stone-400">
                  Nenhum produto cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
