import {
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateFuncionarioDto {
  @IsOptional()
  nome?: string;

  @IsOptional()
  @IsString()
  cargo?: string;
}