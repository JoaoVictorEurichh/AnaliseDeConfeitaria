import { useEffect, useState } from 'react';
import { listarCategorias, criarCategoria } from '../api/categorias';
import type { Categoria } from '../types/categoria';

export function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const [nome, setNome] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    listarCategorias()
      .then(setCategorias)
      .catch(() => setErro('Não foi possível carregar categorias.'))
      .finally(() => setCarregando(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro('');

    try {
      await criarCategoria({ nome });
      const atualizadas = await listarCategorias();
      setCategorias(atualizadas);
      setNome('');
    } catch {
      setErro('Erro ao salvar categoria.');
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <p>Carregando...</p>;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-amber-900">Categorias</h2>

      {erro && <p className="mb-4 text-red-600">{erro}</p>}

      <form
        onSubmit={handleSubmit}
        className="mb-6 rounded-xl border border-amber-200 bg-white p-4"
      >
        <h3 className="mb-4 font-semibold">Nova categoria</h3>

        <input
          placeholder="Nome (ex: Bolos, Cafés)"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          className="mb-2 mr-2 rounded border border-stone-300 px-3 py-2"
        />

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
          </tr>
        </thead>
        <tbody>
          {categorias.map((c) => (
            <tr key={c.id} className="border-t">
              <td className="p-2">{c.id}</td>
              <td className="p-2">{c.nome}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}