import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClienteModule } from './cliente/cliente.module';
import { ProdutoModule } from './produto/produto.module';
import { PedidoModule } from './pedido/pedido.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [ClienteModule, ProdutoModule, PedidoModule, DashboardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
