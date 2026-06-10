import { Controller, Get } from '@nestjs/common';
import { AnaliseService } from './analise.service';

@Controller('analise')
export class AnaliseController {
  constructor(private readonly analiseService: AnaliseService) {}

  @Get('vendas-por-produto')
  getVendasPorProduto() {
    return this.analiseService.getVendasPorProduto();
  }

  @Get('vendas-por-categoria')
  getVendasPorCategoria() {
    return this.analiseService.getVendasPorCategoria();
  }

  @Get('vendas-por-cidade')
  getVendasPorCidade() {
    return this.analiseService.getVendasPorCidade();
  }

  @Get('vendas-por-estado')
  getVendasPorEstado() {
    return this.analiseService.getVendasPorEstado();
  }

  @Get('relatorio-gerencial')
  getRelatorioGerencial() {
    return this.analiseService.getRelatorioGerencial();
  }
}
