import {
  IsEmail,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateClienteDto {
  @IsOptional()
  nome?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  cidade?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  pais?: string;
}
