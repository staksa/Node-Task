import { Product } from './product.entity';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Price } from './price.entity';

export class Cart {
  id: string;
  products?: Product[];
  @ApiHideProperty()
  total?: Price;
}
