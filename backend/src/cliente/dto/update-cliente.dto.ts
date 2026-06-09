import { IsEmail, IsOptional } from 'class-validator';

export class UpdateClienteDto {
  @IsOptional()
  nome?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}