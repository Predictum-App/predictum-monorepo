import type { NestExpressApplication } from '@nestjs/platform-express';

import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { LoggingInterceptor } from '@interceptors';

export function setupApp(app: NestExpressApplication) {
  app.enableCors();

  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalPipes(new ValidationPipe());
}

export function setupSwagger(app: NestExpressApplication) {
  const config = new DocumentBuilder()
    .setTitle('Prediction Markets API')
    .setDescription('The API for resolving the markets.')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config, {});
  SwaggerModule.setup('api/docs', app, documentFactory);
}
