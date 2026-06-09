import {
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class UpdateProdutoDto {
  @IsOptional()
  nome?: string;

  @IsOptional()
  categoria?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  preco?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estoque?: number;
}