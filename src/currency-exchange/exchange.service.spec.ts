import { Test } from '@nestjs/testing';
import { ExchangeService } from './exchange.service';
import { HttpModule } from '@nestjs/common';

describe('ExchangeService', () => {
  let exchangeService: ExchangeService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [ExchangeService],
    }).compile();

    exchangeService = module.get<ExchangeService>(ExchangeService);
  });

  it('should return PLN for base currency code', async () => {
    const response = await exchangeService.convertCurrency('PLN', 'USD');
    const result = response.data.base;
    expect(result).toBe('PLN');
  });

  it('should throw error for unsupported base currency code', async () => {
    const wrongCode = 'PLNX';
    try {
      await exchangeService.convertCurrency(wrongCode, 'USD');
    } catch (error) {
      expect(error).toBe(`Base '${wrongCode}' is not supported.`);
    }
  });
});
