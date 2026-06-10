export interface Venda {
    id: number;
    valorTotal: number;
    dataVenda: string;
    clienteId: number;
    funcionarioId: number;
    cliente: {
      id: number;
      nome: string;
      email: string;
    };
    itens: {
      id: number;
      quantidade: number;
      subtotal: number;
      produto: {
        id: number;
        nome: string;
        preco: number;
      };
    }[];
  }