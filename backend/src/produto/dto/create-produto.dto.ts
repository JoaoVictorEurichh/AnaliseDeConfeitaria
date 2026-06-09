import {
  IsNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateProdutoDto {
  @IsNotEmpty()
  nome!: string;

  @IsNotEmpty()
  categoria!: string;

  @IsNumber()
  @Min(0.01)
  preco!: number;

  @IsNumber()
  @Min(0)
  estoque!: number;
}