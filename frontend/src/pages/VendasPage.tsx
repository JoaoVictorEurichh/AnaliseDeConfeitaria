import { useEffect, useState } from 'react';
import { listarVendas, criarVenda } from '../api/vendas';
import { listarClientes } from '../api/clientes';
import { listarFuncionarios } from '../api/funcionarios';
import { listarProdutos } from '../api/produtos';
import type { Venda } from '../types/venda';
import type { Cliente } from '../types/cliente';
import type { Funcionario } from '../types/funcionario';
import type { Produto } from '../types/produto';

type ItemCarrinho = {
  produtoId: number;
  nome: string;
  preco: number;
  quantidade: number;
};

export function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);

  const [clienteId, setClienteId] = useState('');
  const [funcionarioId, setFuncionarioId] = useState('');
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);

  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    Promise.all([
      listarVendas(),
      listarClientes(),
      listarFuncionarios(),
      listarProdutos(),
    ])
      .then(([listaVendas, listaClientes, listaFuncionarios, listaProdutos]) => {
        setVendas(listaVendas);
        setClientes(listaClientes);
        setFuncionarios(listaFuncionarios);
        setProdutos(listaProdutos);
      })
      .catch(() => setErro('Erro ao carregar dados de vendas.'))
      .finally(() => setCarregando(false));
  }, []);

  const totalCarrinho = carrinho.reduce(
    (soma, item) => soma + item.preco * item.quantidade,
    0,
  );

  function adicionarAoCarrinho() {
    const produto = produtos.find((p) => p.id === Number(produtoId));
    if (!produto) return;

    const qtd = Number(quantidade);
    if (qtd < 1) return;

    setCarrinho((atual) => {
      const existente = atual.find((item) => item.produtoId === produto.id);

      if (existente) {
        return atual.map((item) =>
          item.produtoId === produto.id
            ? { ...item, quantidade: item.quantidade + qtd }
            : item,
        );
      }

      return [
        ...atual,
        {
          produtoId: produto.id,
          nome: produto.nome,
          preco: produto.preco,
          quantidade: qtd,
        },
      ];
    });
  }

  function removerDoCarrinho(produtoIdRemover: number) {
    setCarrinho((atual) =>
      atual.filter((item) => item.produtoId !== produtoIdRemover),
    );
  }

  async function finalizarVenda(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro('');

    if (carrinho.length === 0) {
      setErro('Adicione pelo menos um produto ao carrinho.');
      setSalvando(false);
      return;
    }

    try {
      await criarVenda({
        clienteId: Number(clienteId),
        funcionarioId: Number(funcionarioId),
        itens: carrinho.map(({ produtoId, quantidade }) => ({
          produtoId,
          quantidade,
        })),
      });

      const atualizadas = await listarVendas();
      setVendas(atualizadas);
      setCarrinho([]);
      setClienteId('');
      setFuncionarioId('');
      setProdutoId('');
      setQuantidade('1');
    } catch {
      setErro('Erro ao finalizar venda. Verifique estoque e dados.');
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <p>Carregando vendas...</p>;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-amber-900">Vendas</h2>

      {erro && <p className="mb-4 text-red-600">{erro}</p>}

      <form
        onSubmit={finalizarVenda}
        className="mb-8 rounded-xl border border-amber-200 bg-white p-4"
      >
        <h3 className="mb-4 font-semibold text-amber-900">Nova venda</h3>

        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            required
            className="rounded border border-stone-300 px-3 py-2"
          >
            <option value="">Selecione o cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>

          <select
            value={funcionarioId}
            onChange={(e) => setFuncionarioId(e.target.value)}
            required
            className="rounded border border-stone-300 px-3 py-2"
          >
            <option value="">Selecione o funcionário</option>
            {funcionarios.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <select
            value={produtoId}
            onChange={(e) => setProdutoId(e.target.value)}
            className="rounded border border-stone-300 px-3 py-2"
          >
            <option value="">Selecione o produto</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} — R$ {p.preco.toFixed(2)} (est: {p.estoque})
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            className="w-24 rounded border border-stone-300 px-3 py-2"
          />

          <button
            type="button"
            onClick={adicionarAoCarrinho}
            className="rounded-lg bg-amber-600 px-4 py-2 text-white hover:bg-amber-700"
          >
            Adicionar
          </button>
        </div>

        {carrinho.length > 0 && (
          <table className="mb-4 w-full border border-stone-200">
            <thead className="bg-amber-50">
              <tr>
                <th className="p-2 text-left">Produto</th>
                <th className="p-2 text-left">Qtd</th>
                <th className="p-2 text-left">Subtotal</th>
                <th className="p-2 text-left">Ação</th>
              </tr>
            </thead>
            <tbody>
              {carrinho.map((item) => (
                <tr key={item.produtoId} className="border-t">
                  <td className="p-2">{item.nome}</td>
                  <td className="p-2">{item.quantidade}</td>
                  <td className="p-2">
                    R$ {(item.preco * item.quantidade).toFixed(2)}
                  </td>
                  <td className="p-2">
                    <button
                      type="button"
                      onClick={() => removerDoCarrinho(item.produtoId)}
                      className="text-red-600 hover:underline"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="mb-4 font-semibold">
          Total: R$ {totalCarrinho.toFixed(2)}
        </p>

        <button
          type="submit"
          disabled={salvando}
          className="rounded-lg bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {salvando ? 'Finalizando...' : 'Finalizar venda'}
        </button>
      </form>

      <h3 className="mb-4 font-semibold text-amber-900">Histórico de vendas</h3>

      <table className="w-full border border-stone-200">
        <thead className="bg-amber-50">
          <tr>
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Cliente</th>
            <th className="p-2 text-left">Funcionário</th>
            <th className="p-2 text-left">Data</th>
            <th className="p-2 text-left">Total</th>
          </tr>
        </thead>
        <tbody>
          {vendas.map((venda) => (
            <tr key={venda.id} className="border-t">
              <td className="p-2">{venda.id}</td>
              <td className="p-2">{venda.cliente.nome}</td>
              <td className="p-2">{venda.funcionario.nome}</td>
              <td className="p-2">
                {new Date(venda.dataVenda).toLocaleDateString('pt-BR')}
              </td>
              <td className="p-2">R$ {venda.valorTotal.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}