import { useEffect, useState } from 'react';
import { listarClientes, criarCliente } from '../api/clientes';
import type { Cliente } from '../types/cliente';

export function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [pais, setPais] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    listarClientes()
      .then(setClientes)
      .catch(() => setErro('Não foi possível carregar os clientes.'))
      .finally(() => setCarregando(false));
  }, []);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro('');

    try {
      await criarCliente({
        nome,
        email,
        telefone: telefone || undefined,
        cidade: cidade || undefined,
        estado: estado || undefined,
        pais: pais || undefined,
      });

      const atualizados = await listarClientes();
      setClientes(atualizados);
      setNome('');
      setEmail('');
      setTelefone('');
      setCidade('');
      setEstado('');
      setPais('');
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar cliente.');
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <p className="p-4 text-stone-500">Carregando...</p>;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-amber-900">Clientes</h2>

      {erro && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{erro}</p>
      )}

      <div className="mb-8 rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 font-semibold text-amber-900">Novo cliente</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="Nome *"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
          <input
            type="email"
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="E-mail *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
          <input
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="Cidade"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
          />
          <input
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="Estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          />
          <input
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="País"
            value={pais}
            onChange={(e) => setPais(e.target.value)}
          />
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
              <th className="px-4 py-3 text-left font-semibold text-amber-900">E-mail</th>
              <th className="px-4 py-3 text-left font-semibold text-amber-900">Telefone</th>
              <th className="px-4 py-3 text-left font-semibold text-amber-900">Cidade</th>
              <th className="px-4 py-3 text-left font-semibold text-amber-900">Estado</th>
              <th className="px-4 py-3 text-left font-semibold text-amber-900">País</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente, i) => (
              <tr key={cliente.id} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                <td className="px-4 py-3 text-stone-500">{cliente.id}</td>
                <td className="px-4 py-3 font-medium text-stone-800">{cliente.nome}</td>
                <td className="px-4 py-3 text-stone-600">{cliente.email ?? '-'}</td>
                <td className="px-4 py-3 text-stone-500">{cliente.telefone ?? '-'}</td>
                <td className="px-4 py-3 text-stone-500">{cliente.cidade ?? '-'}</td>
                <td className="px-4 py-3 text-stone-500">{cliente.estado ?? '-'}</td>
                <td className="px-4 py-3 text-stone-500">{cliente.pais ?? '-'}</td>
              </tr>
            ))}
            {clientes.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-stone-400">
                  Nenhum cliente cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
