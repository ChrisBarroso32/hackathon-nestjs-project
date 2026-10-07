import { SetMetadata } from '@nestjs/common';

export const RESPONSE_MESSAGE_KEY = 'responseMessage';
export const DEFAULT_RESPONSE_MESSAGE = 'Success';

// Sets the `message` of the wrapped response (see ResponseInterceptor).
// Works on a handler or on a whole controller; the handler wins.
export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE_KEY, message);
