import { Injectable, HttpService } from '@nestjs/common';

@Injectable()
export class ExchangeService {
  constructor(private httpService: HttpService) {}

  async convertCurrency(sourceCurrency: string, targetCurrency: string) {
    try {
      return await this.httpService.get(`https://api.exchangeratesapi.io/latest?base=${sourceCurrency}&symbols=${sourceCurrency},${targetCurrency}`).toPromise();
    } catch (error) {
      throw error.response.data.error;
    }
  }
}
