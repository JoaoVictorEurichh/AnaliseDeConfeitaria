import { apiGet, apiPost } from './client';
import type { Venda } from '../types/venda';

export function listarVendas() {
  return apiGet<Venda[]>('/vendas');
}

export function criarVenda(dados: {
  clienteId: number;
  funcionarioId: number;
  itens: { produtoId: number; quantidade: number }[];
}) {
  return apiPost<Venda>('/vendas', dados);
}