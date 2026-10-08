import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import 'dotenv/config';

function flattenValidationErrors(
  errors: ValidationError[],
  parent = '',
): { property: string; message: string }[] {
  return errors.flatMap((error) => {
    const property = parent ? `${parent}.${error.property}` : error.property;
    const own = Object.values(error.constraints ?? {}).map((message) => ({
      property,
      message,
    }));
    return [...own, ...flattenValidationErrors(error.children ?? [], property)];
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Required for Better Auth
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) =>
        new BadRequestException(flattenValidationErrors(errors)),
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
