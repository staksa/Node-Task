import { Price } from './price.entity';

export class Product {
  id: string;
  name: string;
  price: Price;
  quantity: number;
  description?: string;
}
