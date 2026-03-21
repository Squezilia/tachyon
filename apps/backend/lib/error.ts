import { Prisma } from '@database/prisma';
import logger from './logger';
import Elysia from 'elysia';

export type PrismaErrorStatus = 400 | 404 | 500 | 503 | 504;

type PrismaErrorConfig = {
  error: string;
  reason: string;
  code: string;
  status: PrismaErrorStatus;
  meta?: unknown;
};

export class PrismaFlowError extends Error {
  status: PrismaErrorStatus;
  reason: string;
  code: string;
  meta?: unknown;

  constructor(config: PrismaErrorConfig) {
    super(config.error);
    this.name = 'PrismaFlowError';
    this.status = config.status;
    this.reason = config.reason;
    this.code = config.code;
    this.meta = config.meta;
  }
}

export function InterceptPrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2000':
        throw new PrismaFlowError({
          error: 'Geçersiz veri',
          reason: 'Bir alan için çok uzun veri gönderildi.',
          code: error.code,
          status: 400,
          meta: error.meta,
        });

      case 'P2002':
        throw new PrismaFlowError({
          error: 'Zaten Mevcut Veri',
          reason: 'Aynı eşşiz değerlere sahip bir başka veri bulunmakta.',
          code: error.code,
          status: 400,
          meta: error.meta,
        });

      case 'P2023':
        throw new PrismaFlowError({
          error: 'Geçersiz veri',
          reason: 'Geçersiz ID veya referans gönderildi.',
          code: error.code,
          status: 400,
          meta: error.meta,
        });

      case 'P2025':
        throw new PrismaFlowError({
          error: 'Kayıt bulunamadı',
          reason: 'Güncellenmek veya silinmek istenen kayıt veritabanında yok.',
          code: error.code,
          status: 404,
          meta: error.meta,
        });

      case 'P1001':
        throw new PrismaFlowError({
          error: 'Veritabanına bağlanılamıyor',
          reason: 'Veritabanı şu anda ulaşılamıyor olabilir.',
          status: 503,
          code: error.code,
          meta: {
            ...error.meta,
            tip: 'Bağlantı ayarlarını veya ağ bağlantısını kontrol et.',
          },
        });

      case 'P1002':
        throw new PrismaFlowError({
          error: 'Veritabanı yanıt vermiyor',
          reason: 'Veritabanı bağlantısı zaman aşımına uğradı.',
          status: 504,
          code: error.code,
          meta: {
            ...error.meta,
            tip: 'Yoğunluk veya timeout değerlerini kontrol et.',
          },
        });

      default:
        logger.error(error);
        throw new PrismaFlowError({
          status: 500,
          error: 'Bilinmeyen hata',
          reason: 'Beklenmeyen bir hata oluştu.',
          code: error.code,
          meta: error.meta,
        });
    }
  }
  throw new PrismaFlowError({
    status: 500,
    error: 'Bilinmeyen hata',
    reason: 'Beklenmeyen bir hata oluştu.',
    code: 'UNKNOWN',
  });
}

export const handleError = new Elysia()
  .error({ PRISMA_ERROR: PrismaFlowError })
  .onError(({ code, error, status }) => {
    if (code === 'PRISMA_ERROR') {
      return status(error.status, {
        error: error.message,
        reason: error.reason,
      });
    }
  });

export const ErrorReferences: {
  400: 'error';
  404: 'error';
  500: 'error';
  503: 'error';
  504: 'error';
} = {
  400: 'error',
  404: 'error',
  500: 'error',
  503: 'error',
  504: 'error',
};
