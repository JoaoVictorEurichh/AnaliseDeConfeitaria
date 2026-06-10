import { useEffect, useState } from 'react';
import { listarProdutos, criarProduto } from '../api/produtos';
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

  useEffect(() => {
    Promise.all([listarProdutos(), listarCategorias()])
      .then(([listaProdutos, listaCategorias]) => {
        setProdutos(listaProdutos);
        setCategorias(listaCategorias);
      })
      .catch(() => setErro('Não foi possível carregar os produtos.'))
      .finally(() => setCarregando(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
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
    } catch {
      setErro('Erro ao salvar produto.');
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <p>Carregando...</p>;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-amber-900">Produtos</h2>

      {erro && <p className="mb-4 text-red-600">{erro}</p>}

      <form
        onSubmit={handleSubmit}
        className="mb-6 rounded-xl border border-amber-200 bg-white p-4"
      >
        <h3 className="mb-4 font-semibold">Novo produto</h3>

        <div className="mb-2">
          <input
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="w-full max-w-md rounded border border-stone-300 px-3 py-2"
          />
        </div>

        <div className="mb-2">
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Preço"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            required
            className="w-full max-w-md rounded border border-stone-300 px-3 py-2"
          />
        </div>

        <div className="mb-2">
          <input
            type="number"
            min="0"
            placeholder="Estoque"
            value={estoque}
            onChange={(e) => setEstoque(e.target.value)}
            required
            className="w-full max-w-md rounded border border-stone-300 px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            required
            className="w-full max-w-md rounded border border-stone-300 px-3 py-2"
          >
            <option value="">Selecione a categoria</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={salvando}
          className="rounded-lg bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
      </form>

      <table className="w-full border border-stone-200">
        <thead className="bg-amber-50">
          <tr>
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Nome</th>
            <th className="p-2 text-left">Preço</th>
            <th className="p-2 text-left">Estoque</th>
            <th className="p-2 text-left">Categoria</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((produto) => (
            <tr key={produto.id} className="border-t">
              <td className="p-2">{produto.id}</td>
              <td className="p-2">{produto.nome}</td>
              <td className="p-2">R$ {produto.preco.toFixed(2)}</td>
              <td className="p-2">{produto.estoque}</td>
              <td className="p-2">
                {categorias.find((c) => c.id === produto.categoriaId)?.nome ??
                  produto.categoriaId}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
