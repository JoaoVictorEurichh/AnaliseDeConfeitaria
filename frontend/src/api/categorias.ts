import { apiGet, apiPost } from './client';
import type { Categoria } from '../types/categoria';

export function listarCategorias() {
  return apiGet<Categoria[]>('/categorias');
}

export function criarCategoria(dados: { nome: string }) {
  return apiPost<Categoria>('/categorias', dados);
}