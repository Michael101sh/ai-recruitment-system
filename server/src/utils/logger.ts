import winston from 'winston';

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

/**
 * Structured logger built on Winston.
 *
 * - **Development**: human-friendly coloured console output.
 * - **Production**: machine-readable JSON (ready for log aggregators like
 *   Datadog, ELK, CloudWatch, etc.).
 *
 * The log level can be controlled via the `LOG_LEVEL` env variable
 * (defaults to `info`).
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'ai-recruitment-api' },
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
  ),
  transports: [
    new winston.transports.Console({
      format:
        process.env.NODE_ENV === 'production'
          ? json()
          : combine(
              colorize(),
              printf(({ timestamp: ts, level, message, stack, service: _s, ...meta }) => {
                let msg = `${ts} [${level}]: ${message}`;
                if (stack) msg += `\n${stack}`;
                const keys = Object.keys(meta);
                if (keys.length > 0) msg += ` ${JSON.stringify(meta)}`;
                return msg;
              }),
            ),
    }),
  ],
});

export { logger };
