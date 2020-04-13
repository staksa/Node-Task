import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Cart } from './entities/cart.entity';
import { Product } from './entities/product.entity';
import { ExchangeService } from './currency-exchange/exchange.service';

@Injectable()
export class CartService {
  carts: Cart[] = [];
  products: Product[] = [];

  constructor(private exchangeService: ExchangeService) {}

  // Get single cart by id
  // throw error if cart doesnt exits
  // on success return a cart
  getCartById(cartId: string) {
    return this.search('cart', this.carts, cartId);
  }

  // Create new cart by id, optionally pass products
  // throw error if cart id already exists
  // on success return array of carts with new one included
  createNewCart(id: string, products: Product[] = []) {
    const duplicate = (obj: { id: string }) => obj.id === id;
    if (this.carts.some(duplicate)) throw new BadRequestException(`Cart of id: ${id} already exists`);
    this.carts.push({ id, products });
    return this.carts;
  }

  // Add new product to a cart by passing cart id and product
  // on success return added product
  addProduct(cartId: string, product: Product) {
    const cart = this.search('cart', this.carts, cartId);
    cart.products.push(product);
    return product;
  }

  // Delete product from cart by passing cart and product ids
  // on success return a message
  deleteProduct(cartId: string, productId: string) {
    const cart = this.search('cart', this.carts, cartId);
    const product = this.search('product', cart.products, productId);
    cart.products = cart.products.filter((x: Product) => x !== product);
    return `Sucefully deleted ${productId} from cart: ${cartId}.`;
  }

  // Checkout cart by getting a sum of all products
  // with converted prices if source currency code is different
  // than target user currency code
  // on success return cart with calculated total price
  async checkoutCart(cartId: string, currency: string = 'USD') {
    const cart = this.search('cart', this.carts, cartId);
    if (cart.total) throw new BadRequestException(`Cart with id ${cartId}, already went through checkout!`);
    cart.total = await this.calculateTotalPrice(cart.products, currency);
    return cart;
  }

  // Fetch item from collection (cart, product)
  // pass type of collection and id
  // on success return found item
  private search(type: string, collection: any[], id: string) {
    const foundItem = collection.find(item => item.id === id);
    if (!foundItem) throw new NotFoundException(`Could not find ${type} with id: ${id}.`);
    return foundItem;
  }

  // Calculate total price by mapping through each product
  // converting its currency if its not the same as source currency code
  // and them setting a sum of all quantities * converted price
  // on success return total price and target currency code
  private async calculateTotalPrice(products: Product[], currency: string) {
    try {
      const prices = await Promise.all(
        products.map(async product => {
          if (product.price.currency === currency) return product.price.value * product.quantity;
          const response = await this.exchangeService.convertCurrency(product.price.currency, currency);
          return product.price.value * response.data.rates[`${currency}`] * product.quantity;
        }),
      );
      const sum = prices.reduce((a, b) => a + b, 0);
      return { value: Number(sum.toFixed(2)), currency };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
