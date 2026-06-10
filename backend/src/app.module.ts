import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClienteModule } from './cliente/cliente.module';
import { ProdutoModule } from './produto/produto.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CategoriaModule } from './categoria/categoria.module';
import { FuncionarioModule } from './funcionario/funcionario.module';
import { VendaModule } from './venda/venda.module';
import { AnaliseModule } from './analise/analise.module';

@Module({
  imports: [ClienteModule, ProdutoModule, DashboardModule, CategoriaModule, FuncionarioModule, VendaModule, AnaliseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
