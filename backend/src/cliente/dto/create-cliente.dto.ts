import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateClienteDto {
  @IsNotEmpty()
  nome!: string;

  @IsEmail()
  email!: string;
}