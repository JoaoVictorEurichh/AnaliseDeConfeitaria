import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { CreateFuncionarioDto } from './dto/create-funcionario.dto';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';

@Injectable()
export class FuncionarioService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    return this.prisma.funcionario.findMany();
  }

  async findOne(id: number) {
    return this.prisma.funcionario.findUnique({
      where: { id },
    });
  }

  async create(data: CreateFuncionarioDto) {
    return this.prisma.funcionario.create({
      data,
    });
  }

  async update(
    id: number,
    data: UpdateFuncionarioDto,
  ) {
    return this.prisma.funcionario.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.funcionario.delete({
      where: { id },
    });
  }
}