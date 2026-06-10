import { apiGet, apiPost } from './client';
import type { Cliente } from '../types/cliente';

export function listarClientes() {
  return apiGet<Cliente[]>('/clientes');
}

export function criarCliente(dados: {
  nome: string;
  email: string;
  telefone?: string;
}) {
  return apiPost<Cliente>('/clientes', dados);
}