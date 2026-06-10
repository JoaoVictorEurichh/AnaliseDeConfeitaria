import { Module } from '@nestjs/common';
import { AnaliseController } from './analise.controller';
import { AnaliseService } from './analise.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AnaliseController],
  providers: [AnaliseService],
})
export class AnaliseModule {}
