import {
  Controller,
  Get,
  Post,
  Body,
} from '@nestjs/common';

import { VendaService } from './venda.service';
import { CreateVendaDto } from './dto/create-venda.dto';

@Controller('vendas')
export class VendaController {
  constructor(
    private readonly vendaService: VendaService,
  ) {}

  @Get()
  findAll() {
    return this.vendaService.findAll();
  }

  @Post()
  create(
    @Body() createVendaDto: CreateVendaDto,
  ) {
    return this.vendaService.create(
      createVendaDto,
    );
  }
}