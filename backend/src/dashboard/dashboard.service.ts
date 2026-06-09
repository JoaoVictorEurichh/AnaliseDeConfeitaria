import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getDashboard() {
    const totalClientes =
      await this.prisma.cliente.count();

    const totalProdutos =
      await this.prisma.produto.count();

    const totalFuncionarios =
      await this.prisma.funcionario.count();

    const totalVendas =
      await this.prisma.venda.count();

    const vendas =
      await this.prisma.venda.findMany();

    const faturamentoTotal =
      vendas.reduce(
        (total, venda) =>
          total + venda.valorTotal,
        0,
      );

    const hoje = new Date();

    const inicioDia = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate(),
    );

    const inicioMes = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      1,
    );

    const vendasDia =
      await this.prisma.venda.findMany({
        where: {
          dataVenda: {
            gte: inicioDia,
          },
        },
      });

    const vendasMes =
      await this.prisma.venda.findMany({
        where: {
          dataVenda: {
            gte: inicioMes,
          },
        },
      });

    const faturamentoDia =
      vendasDia.reduce(
        (total, venda) =>
          total + venda.valorTotal,
        0,
      );

    const faturamentoMes =
      vendasMes.reduce(
        (total, venda) =>
          total + venda.valorTotal,
        0,
      );

    const produtosEstoqueBaixo =
      await this.prisma.produto.count({
        where: {
          estoque: {
            lte: 5,
          },
        },
      });

    return {
      totalClientes,
      totalProdutos,
      totalFuncionarios,
      totalVendas,
      faturamentoTotal,
      faturamentoDia,
      faturamentoMes,
      produtosEstoqueBaixo,
    };
  }
}