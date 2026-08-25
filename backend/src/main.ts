import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // CSP désactivée : API JSON pure + page Swagger UI (scripts inline), pas de
  // contenu utilisateur rendu côté serveur qui justifierait une CSP stricte ici.
  app.use(helmet({ contentSecurityPolicy: false }));
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.setGlobalPrefix('api/v1');
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Tour d'Avant-Garde API")
    .setDescription("API de la plateforme de prière et d'intercession Tour d'Avant-Garde")
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
