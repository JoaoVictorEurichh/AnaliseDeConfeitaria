import { apiGet, apiPost } from './client';
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