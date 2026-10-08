import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  DEFAULT_RESPONSE_MESSAGE,
  RESPONSE_MESSAGE_KEY,
} from '../decorators/response-message.decorator';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T | null;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T> | T>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T> | T> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const message =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? DEFAULT_RESPONSE_MESSAGE;

    return next.handle().pipe(
      map((data) => {
        // File/stream downloads must reach the client untouched.
        if (data instanceof StreamableFile) {
          return data;
        }

        const { statusCode } = context.switchToHttp().getResponse<Response>();
        return { statusCode, message, data: data ?? null };
      }),
    );
  }
}
