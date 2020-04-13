import { Test } from '@nestjs/testing';
import { CartService } from './cart.service';
import { HttpModule, NotFoundException, BadRequestException } from '@nestjs/common';
import { ExchangeService } from './currency-exchange/exchange.service';

describe('CartService', () => {
  let cartService: CartService;
  let productMock;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [CartService, ExchangeService],
    }).compile();

    productMock = [
      {
        id: 'product1',
        name: 'apple',
        price: {
          value: 10,
          currency: 'PLN',
        },
        quantity: 2,
        description: 'juicy apple',
      },
    ];
    cartService = module.get<CartService>(CartService);
  });

  describe('create new cart: ', () => {
    it('should add new cart to list of carts', () => {
      cartService.createNewCart('5678');
      expect(cartService.carts.length).toBe(1);
    });
    it('should create new cart with no products', () => {
      const result = cartService.createNewCart('1234');
      expect(result[0].products.length).toBe(0);
    });
    it('should add new cart with product', () => {
      const result = cartService.createNewCart('5678', productMock);
      expect(result[0].products.length).toBe(1);
    });
    it('should throw error cart with given id exists', () => {
      cartService.createNewCart('1a2b3c');
      expect(() => cartService.createNewCart('1a2b3c')).toThrowError();
    });
  });

  describe('get cart by id: ', () => {
    it('should return cart with given id if cart found', () => {
      cartService.createNewCart('123');
      const result = cartService.getCartById('123');
      expect(result.id).toBe('123');
    });

    it('should throw error id if cart not found', () => {
      expect(() => cartService.getCartById('XYZ')).toThrowError();
    });
  });

  describe('add product to cart: ', () => {
    it('should add new product to cart', () => {
      cartService.createNewCart('1a2b3c');
      cartService.addProduct('1a2b3c', productMock[0]);
      const cart = cartService.carts.find(x => x.id === '1a2b3c');
      const newProduct = cart.products.find(x => x.id === 'product1');
      expect(newProduct.id).toBe('product1');
    });
  });

  describe('delete product from cart: ', () => {
    it('should remove product from cart', () => {
      cartService.createNewCart('1a2b3c');
      cartService.addProduct('1a2b3c', productMock[0]);
      cartService.deleteProduct('1a2b3c', 'product1');
      expect(cartService.carts[0].products.length).toBe(0);
    });
  });

  describe('proceed with checkout: ', () => {
    it('should throw error if cart already went through checkout ', async () => {
      try {
        cartService.createNewCart('1a2b3c');
        cartService.addProduct('1a2b3c', productMock[0]);
        await cartService.checkoutCart('1a2b3c');
        await cartService.checkoutCart('1a2b3c');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
    it('should return prices sum with base currency same as target currency', async () => {
      cartService.createNewCart('1a2b3c');
      cartService.addProduct('1a2b3c', productMock[0]);
      const result = await cartService.checkoutCart('1a2b3c', 'PLN');
      expect(result.total.value).toBe(20);
      expect(result.total.currency).toBe('PLN');
    });

    it('should return prices sum with base currency different as target currency (converted)', async () => {
      cartService.createNewCart('1a2b3c');
      cartService.addProduct('1a2b3c', productMock[0]);
      const result = await cartService.checkoutCart('1a2b3c', 'USD');
      expect(result.total.value).toBeLessThanOrEqual(20);
      expect(result.total.currency).toBe('USD');
    });
  });
});
