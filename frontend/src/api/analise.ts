import { apiGet } from './client';

export interface VendaPorProduto {
  produto: string;
  categoria: string;
  quantidadeVendida: number;
  faturamento: number;
}

export interface VendaPorCategoria {
  categoria: string;
  faturamento: number;
  quantidade: number;
}

export interface VendaPorCidade {
  cidade: string;
  faturamento: number;
  totalVendas: number;
}

export interface VendaPorEstado {
  estado: string;
  faturamento: number;
  totalVendas: number;
}

export interface RelatorioGerencial {
  faturamentoTotal: number;
  totalVendas: number;
  ticketMedio: number;
  totalClientes: number;
  produtoMaisVendido: { nome: string; quantidade: number } | null;
  produtoMaiorFaturamento: { nome: string; faturamento: number } | null;
  topClientes: { nome: string; totalCompras: number; totalGasto: number }[];
  produtosEstoqueBaixo: { nome: string; estoque: number; categoria: string }[];
}

export function buscarVendasPorProduto() {
  return apiGet<VendaPorProduto[]>('/analise/vendas-por-produto');
}

export function buscarVendasPorCategoria() {
  return apiGet<VendaPorCategoria[]>('/analise/vendas-por-categoria');
}

export function buscarVendasPorCidade() {
  return apiGet<VendaPorCidade[]>('/analise/vendas-por-cidade');
}

export function buscarVendasPorEstado() {
  return apiGet<VendaPorEstado[]>('/analise/vendas-por-estado');
}

export function buscarRelatorioGerencial() {
  return apiGet<RelatorioGerencial>('/analise/relatorio-gerencial');
}
