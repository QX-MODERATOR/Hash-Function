import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();
  app.useStaticAssets(join(process.cwd(), 'public'));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Hash Function API')
    .setDescription(
      'Generate, inspect, and compare hashes with classic digests, SHA-2, SHA-3, BLAKE2, RIPEMD-160, Whirlpool where supported by the runtime, and bcrypt password hashes.',
    )
    .setVersion('1.0')
    .addTag('Hashing', 'Endpoints for hash generation and comparison')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
Hash Function API is running
UI:           http://localhost:${port}
Swagger Docs: http://localhost:${port}/api
  `);
}

bootstrap();
