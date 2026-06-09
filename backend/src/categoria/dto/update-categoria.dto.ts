import { IsOptional } from 'class-validator';

export class UpdateCategoriaDto {
  @IsOptional()
  nome?: string;
}