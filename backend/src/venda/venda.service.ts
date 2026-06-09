import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateVendaDto } from './dto/create-venda.dto';

@Injectable()
export class VendaService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    return this.prisma.venda.findMany({
      include: {
        cliente: true,
        funcionario: true,
        itens: {
          include: {
            produto: true,
          },
        },
      },
    });
  }

  async create(
    createVendaDto: CreateVendaDto,
  ) {
    let valorTotal = 0;

    const itensProcessados: {
      produtoId: number;
      quantidade: number;
      subtotal: number;
    }[] = [];

    for (const item of createVendaDto.itens) {
      const produto =
        await this.prisma.produto.findUnique({
          where: {
            id: item.produtoId,
          },
        });

      if (!produto) {
        throw new BadRequestException(
          `Produto ${item.produtoId} não encontrado`,
        );
      }

      if (produto.estoque < item.quantidade) {
        throw new BadRequestException(
          `Estoque insuficiente para ${produto.nome}`,
        );
      }

      const subtotal =
        produto.preco * item.quantidade;

      valorTotal += subtotal;

      itensProcessados.push({
        produtoId: produto.id,
        quantidade: item.quantidade,
        subtotal,
      });
    }

    const venda =
      await this.prisma.venda.create({
        data: {
          clienteId:
            createVendaDto.clienteId,
          funcionarioId:
            createVendaDto.funcionarioId,
          valorTotal,
        },
      });

    for (const item of itensProcessados) {
      await this.prisma.itemVenda.create({
        data: {
          vendaId: venda.id,
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          subtotal: item.subtotal,
        },
      });

      await this.prisma.produto.update({
        where: {
          id: item.produtoId,
        },
        data: {
          estoque: {
            decrement: item.quantidade,
          },
        },
      });
    }

    return venda;
  }
}