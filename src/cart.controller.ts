import { Controller, Post, Delete, Get, Body, Param, BadRequestException, Patch, Query } from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { Cart } from './entities/cart.entity';
import { Product } from './entities/product.entity';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':cartId')
  getCartById(@Param('cartId') cartId: string): Cart {
    return this.cartService.getCartById(cartId);
  }

  @Post('new')
  createNewCart(@Body() cart: Cart): any {
    return this.cartService.createNewCart(cart.id, cart.products);
  }

  @Post(':cartId/products')
  addProduct(@Param('cartId') cartId: string, @Body() product: Product): Product {
    return this.cartService.addProduct(cartId, product);
  }

  @Delete(':cartId/products/:productId')
  deleteProduct(@Param('cartId') cartId: string, @Param('productId') productId: string): string {
    return this.cartService.deleteProduct(cartId, productId);
  }

  @Patch(':cartId/checkout')
  @ApiQuery({ name: 'currency', required: false, type: String })
  async checkoutCart(@Param('cartId') cartId: string, @Query('currency') currency: string): Promise<any> {
    return await this.cartService.checkoutCart(cartId, currency);
  }
}
