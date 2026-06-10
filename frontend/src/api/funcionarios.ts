import { apiGet, apiPost } from './client';
import type { Funcionario } from '../types/funcionario';

export function listarFuncionarios() {
  return apiGet<Funcionario[]>('/funcionarios');
}

export function criarFuncionario(dados: {
  nome: string;
  cargo?: string;
}) {
  return apiPost<Funcionario>('/funcionarios', dados);
}