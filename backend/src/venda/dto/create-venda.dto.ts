import {
  IsArray,
  IsInt,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';
import { ItemVendaDto } from './item-venda.dto';

export class CreateVendaDto {
  @IsInt()
  clienteId!: number;

  @IsInt()
  funcionarioId!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemVendaDto)
  itens!: ItemVendaDto[];
}