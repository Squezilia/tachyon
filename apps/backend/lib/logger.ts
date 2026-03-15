import { formatters, pino, serializers } from '@bogeychan/elysia-logger';

export default pino({
  serializers,
  formatters,
  level: 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});
