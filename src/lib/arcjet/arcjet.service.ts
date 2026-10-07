import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import arcjet, { fixedWindow, shield } from '@arcjet/node';

@Injectable()
export class ArcjetService {
  private readonly client: ReturnType<typeof arcjet>;

  constructor(config: ConfigService) {
    const mode = config.get<string>('ARCJET_MODE', 'DRY_RUN');
    if (mode !== 'LIVE' && mode !== 'DRY_RUN') {
      throw new Error(`Invalid ARCJET_MODE "${mode}". Use LIVE or DRY_RUN.`);
    }

    this.client = arcjet({
      key: config.getOrThrow<string>('ARCJET_KEY'),
      rules: [shield({ mode }), fixedWindow({ mode, window: '1m', max: 10 })],
    });
  }

  protect(...args: Parameters<ReturnType<typeof arcjet>['protect']>) {
    return this.client.protect(...args);
  }
}
