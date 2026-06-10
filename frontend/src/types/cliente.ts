export interface Cliente {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  pais?: string;
  dataCadastro: string;
}
