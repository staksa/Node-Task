import { NestFactory } from '@nestjs/core';
import { CartModule } from './cart.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import * as rateLimit from 'express-rate-limit';
import * as helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(CartModule);

  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 60 * 60 * 1000,
      max: 1000,
      message: 'Too many requests created from this IP, please try again after an hour',
    }),
  );

  const options = new DocumentBuilder()
    .setTitle('Shopping Cart')
    .setDescription('Shopping cart API with token authentication')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
