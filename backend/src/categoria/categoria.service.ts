import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriaService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    return this.prisma.categoria.findMany();
  }

  async findOne(id: number) {
    return this.prisma.categoria.findUnique({
      where: { id },
    });
  }

  async create(data: CreateCategoriaDto) {
    return this.prisma.categoria.create({
      data,
    });
  }

  async update(
    id: number,
    data: UpdateCategoriaDto,
  ) {
    return this.prisma.categoria.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.categoria.delete({
      where: { id },
    });
  }
}