import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnaliseService {
  constructor(private readonly prisma: PrismaService) {}

  async getVendasPorProduto() {
    const itens = await this.prisma.itemVenda.findMany({
      include: {
        produto: {
          include: { categoria: true },
        },
      },
    });

    const agrupado: Record<
      number,
      {
        produto: string;
        categoria: string;
        quantidadeVendida: number;
        faturamento: number;
      }
    > = {};

    for (const item of itens) {
      const pid = item.produtoId;
      if (!agrupado[pid]) {
        agrupado[pid] = {
          produto: item.produto.nome,
          categoria: item.produto.categoria?.nome ?? '-',
          quantidadeVendida: 0,
          faturamento: 0,
        };
      }
      agrupado[pid].quantidadeVendida += item.quantidade;
      agrupado[pid].faturamento += item.subtotal;
    }

    return Object.values(agrupado).sort(
      (a, b) => b.quantidadeVendida - a.quantidadeVendida,
    );
  }

  async getVendasPorCategoria() {
    const itens = await this.prisma.itemVenda.findMany({
      include: {
        produto: {
          include: { categoria: true },
        },
      },
    });

    const agrupado: Record<
      string,
      { categoria: string; faturamento: number; quantidade: number }
    > = {};

    for (const item of itens) {
      const cat = item.produto.categoria?.nome ?? 'Sem categoria';
      if (!agrupado[cat]) {
        agrupado[cat] = { categoria: cat, faturamento: 0, quantidade: 0 };
      }
      agrupado[cat].faturamento += item.subtotal;
      agrupado[cat].quantidade += item.quantidade;
    }

    return Object.values(agrupado).sort(
      (a, b) => b.faturamento - a.faturamento,
    );
  }

  async getVendasPorCidade() {
    const vendas = await this.prisma.venda.findMany({
      include: { cliente: true },
    });

    const agrupado: Record<
      string,
      { cidade: string; faturamento: number; totalVendas: number }
    > = {};

    for (const venda of vendas) {
      const cidade = venda.cliente.cidade ?? 'Não informada';
      if (!agrupado[cidade]) {
        agrupado[cidade] = { cidade, faturamento: 0, totalVendas: 0 };
      }
      agrupado[cidade].faturamento += venda.valorTotal;
      agrupado[cidade].totalVendas += 1;
    }

    return Object.values(agrupado).sort(
      (a, b) => b.faturamento - a.faturamento,
    );
  }

  async getVendasPorEstado() {
    const vendas = await this.prisma.venda.findMany({
      include: { cliente: true },
    });

    const agrupado: Record<
      string,
      { estado: string; faturamento: number; totalVendas: number }
    > = {};

    for (const venda of vendas) {
      const estado = venda.cliente.estado ?? 'Não informado';
      if (!agrupado[estado]) {
        agrupado[estado] = { estado, faturamento: 0, totalVendas: 0 };
      }
      agrupado[estado].faturamento += venda.valorTotal;
      agrupado[estado].totalVendas += 1;
    }

    return Object.values(agrupado).sort(
      (a, b) => b.faturamento - a.faturamento,
    );
  }

  async getRelatorioGerencial() {
    const [vendas, itens, clientes, produtos] = await Promise.all([
      this.prisma.venda.findMany({ include: { cliente: true, itens: true } }),
      this.prisma.itemVenda.findMany({
        include: { produto: { include: { categoria: true } } },
      }),
      this.prisma.cliente.findMany(),
      this.prisma.produto.findMany({ include: { categoria: true } }),
    ]);

    const faturamentoTotal = vendas.reduce((acc, v) => acc + v.valorTotal, 0);
    const ticketMedio =
      vendas.length > 0 ? faturamentoTotal / vendas.length : 0;

    const qtdPorProduto: Record<number, number> = {};
    const fatPorProduto: Record<number, number> = {};
    for (const item of itens) {
      qtdPorProduto[item.produtoId] =
        (qtdPorProduto[item.produtoId] ?? 0) + item.quantidade;
      fatPorProduto[item.produtoId] =
        (fatPorProduto[item.produtoId] ?? 0) + item.subtotal;
    }

    const produtoMaisVendidoId = Object.entries(qtdPorProduto).sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0];
    const produtoMaiorFaturamentoId = Object.entries(fatPorProduto).sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0];

    const produtoMaisVendido = produtos.find(
      (p) => p.id === Number(produtoMaisVendidoId),
    );
    const produtoMaiorFaturamento = produtos.find(
      (p) => p.id === Number(produtoMaiorFaturamentoId),
    );

    const topClientes = clientes
      .map((c) => ({
        nome: c.nome,
        totalCompras: vendas.filter((v) => v.clienteId === c.id).length,
        totalGasto: vendas
          .filter((v) => v.clienteId === c.id)
          .reduce((acc, v) => acc + v.valorTotal, 0),
      }))
      .sort((a, b) => b.totalGasto - a.totalGasto)
      .slice(0, 5);

    const produtosEstoqueBaixo = produtos
      .filter((p) => p.estoque <= 5)
      .map((p) => ({
        nome: p.nome,
        estoque: p.estoque,
        categoria: p.categoria?.nome ?? '-',
      }));

    return {
      faturamentoTotal: Number(faturamentoTotal.toFixed(2)),
      totalVendas: vendas.length,
      ticketMedio: Number(ticketMedio.toFixed(2)),
      totalClientes: clientes.length,
      produtoMaisVendido: produtoMaisVendido
        ? {
            nome: produtoMaisVendido.nome,
            quantidade: qtdPorProduto[produtoMaisVendido.id] ?? 0,
          }
        : null,
      produtoMaiorFaturamento: produtoMaiorFaturamento
        ? {
            nome: produtoMaiorFaturamento.nome,
            faturamento: Number(
              (fatPorProduto[produtoMaiorFaturamento.id] ?? 0).toFixed(2),
            ),
          }
        : null,
      topClientes,
      produtosEstoqueBaixo,
    };
  }
}
