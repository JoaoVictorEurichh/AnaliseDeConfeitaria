import { IsInt, Min } from 'class-validator';

export class ItemVendaDto {
  @IsInt()
  produtoId!: number;

  @IsInt()
  @Min(1)
  quantidade!: number;
}