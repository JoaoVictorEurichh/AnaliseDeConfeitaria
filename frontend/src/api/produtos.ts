import { apiGet, apiPost, apiPatch } from './client';
import type { Produto } from '../types/produto';

export function listarProdutos() {
  return apiGet<Produto[]>('/produtos');
}

export function criarProduto(dados: {
  nome: string;
  preco: number;
  estoque: number;
  categoriaId: number;
}) {
  return apiPost<Produto>('/produtos', dados);
}

export function adicionarEstoque(id: number, quantidade: number) {
  return apiPatch<Produto>(`/produtos/${id}/estoque`, { quantidade });
}
