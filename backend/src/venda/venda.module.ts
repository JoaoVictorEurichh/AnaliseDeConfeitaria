import { Module } from '@nestjs/common';
import { VendaController } from './venda.controller';
import { VendaService } from './venda.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VendaController],
  providers: [VendaService],
})
export class VendaModule {}