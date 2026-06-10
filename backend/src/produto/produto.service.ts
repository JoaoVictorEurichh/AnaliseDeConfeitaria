import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Injectable()
export class ProdutoService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    return this.prisma.produto.findMany();
  }

  async findOne(id: number) {
    return this.prisma.produto.findUnique({
      where: { id },
    });
  }

  async create(data: CreateProdutoDto) {
    const existente = await this.prisma.produto.findFirst({
      where: { nome: data.nome },
    });
    if (existente) {
      throw new BadRequestException(`Já existe um produto com o nome "${data.nome}".`);
    }
    return this.prisma.produto.create({ data });
  }

  async adicionarEstoque(id: number, quantidade: number) {
    if (quantidade <= 0) {
      throw new BadRequestException('A quantidade deve ser maior que zero.');
    }
    return this.prisma.produto.update({
      where: { id },
      data: { estoque: { increment: quantidade } },
    });
  }

  async update(id: number, data: UpdateProdutoDto) {
    if (data.nome) {
      const existente = await this.prisma.produto.findFirst({
        where: { nome: data.nome, NOT: { id } },
      });
      if (existente) {
        throw new BadRequestException(`Já existe um produto com o nome "${data.nome}".`);
      }
    }
    return this.prisma.produto.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.produto.delete({
      where: { id },
    });
  }
}
