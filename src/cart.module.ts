import { Module, HttpModule } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { ExchangeService } from './currency-exchange/exchange.service';

@Module({
  imports: [HttpModule],
  controllers: [CartController],
  providers: [CartService, ExchangeService],
})
export class CartModule {}
