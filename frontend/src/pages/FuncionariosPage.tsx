import { useEffect, useState } from 'react';
import { listarFuncionarios, criarFuncionario } from '../api/funcionarios';
import type { Funcionario } from '../types/funcionario';

export function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    listarFuncionarios()
      .then(setFuncionarios)
      .catch(() => setErro('Não foi possível carregar funcionários.'))
      .finally(() => setCarregando(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro('');

    try {
      await criarFuncionario({
        nome,
        cargo: cargo || undefined,
      });

      const atualizados = await listarFuncionarios();
      setFuncionarios(atualizados);
      setNome('');
      setCargo('');
    } catch {
      setErro('Erro ao salvar funcionário.');
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <p>Carregando...</p>;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-amber-900">Funcionários</h2>

      {erro && <p className="mb-4 text-red-600">{erro}</p>}

      <form
        onSubmit={handleSubmit}
        className="mb-6 rounded-xl border border-amber-200 bg-white p-4"
      >
        <h3 className="mb-4 font-semibold">Novo funcionário</h3>

        <input
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          className="mb-2 mr-2 rounded border border-stone-300 px-3 py-2"
        />

        <input
          placeholder="Cargo"
          value={cargo}
          onChange={(e) => setCargo(e.target.value)}
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
            <th className="p-2 text-left">Cargo</th>
          </tr>
        </thead>
        <tbody>
          {funcionarios.map((f) => (
            <tr key={f.id} className="border-t">
              <td className="p-2">{f.id}</td>
              <td className="p-2">{f.nome}</td>
              <td className="p-2">{f.cargo ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}