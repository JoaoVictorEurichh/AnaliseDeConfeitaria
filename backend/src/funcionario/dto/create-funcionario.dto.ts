import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateFuncionarioDto {
  @IsNotEmpty()
  nome!: string;

  @IsOptional()
  @IsString()
  cargo?: string;
}