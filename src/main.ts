import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException, UseGuards } from '@nestjs/common';
import { TestExceptionFilter } from './helpers/excaption.filter';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const result = errors.map((error: any) => ({
          field: error.property,
          message: error.constraints[Object.keys(error.constraints)[0]],
        }));
        return new BadRequestException(result);
      },
      stopAtFirstError: false,
    }),
  );
  app.useGlobalFilters(new TestExceptionFilter());

  app.enableCors();
  app.use(cookieParser());
  await app.listen(5001);
}
bootstrap();
