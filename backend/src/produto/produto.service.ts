import { Injectable } from '@nestjs/common';
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
    return this.prisma.produto.create({
      data,
    });
  }

  async update(
    id: number,
    data: UpdateProdutoDto,
  ) {
    return this.prisma.produto.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.produto.delete({
      where: { id },
    });
  }
}