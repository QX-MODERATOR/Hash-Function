import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Enable validation pipe globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Hash Function API')
    .setDescription(
      'A comprehensive API for generating and comparing hashes using various cryptographic algorithms including MD5, SHA family (SHA-1, SHA-256, SHA-384, SHA-512), SHA-3 family (SHA3-256, SHA3-384, SHA3-512), BLAKE2 (BLAKE2b512, BLAKE2s256), RIPEMD-160, Whirlpool, and Bcrypt.',
    )
    .setVersion('1.0')
    .addTag('Hashing', 'Endpoints for hash generation and comparison')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║          🔐 Hash Function API is now running! 🔐             ║
║                                                               ║
║  API URL:        http://localhost:${port}                         ║
║  Swagger Docs:   http://localhost:${port}/api                     ║
║                                                               ║
║  Available Algorithms:                                        ║
║  • MD5, SHA-1, SHA-256, SHA-384, SHA-512                     ║
║  • SHA3-256, SHA3-384, SHA3-512                              ║
║  • BLAKE2b512, BLAKE2s256                                     ║
║  • RIPEMD-160, Whirlpool, Bcrypt                             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
