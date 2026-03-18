import { Prisma } from '@database/prisma';
import { ErrorResponseSchema } from '@/model';
import logger from './logger';

export class MappedPrismaError {
  error: string;
  reason: string;
  code: string;
  status: 400 | 404 | 503 | 504 | 500;
  meta?: unknown;
  response: {
    error: string;
    reason: string;
  };

  constructor(config: ErrorResponse) {
    this.error = config.error;
    this.reason = config.reason;
    this.code = config.code;
    this.status = config.status;
    this.meta = config.meta;
    this.response = {
      error: this.error,
      reason: this.reason,
    };
  }
}

type ErrorResponse = {
  error: string;
  reason: string;
  code: string;
  status: 400 | 404 | 503 | 504 | 500;
  meta?: unknown;
};

export function mapPrismaError(
  error: Prisma.PrismaClientKnownRequestError
): MappedPrismaError {
  switch (error.code) {
    case 'P2000':
      return new MappedPrismaError({
        error: 'Geçersiz veri',
        reason: 'Bir alan için çok uzun veri gönderildi.',
        code: error.code,
        status: 400,
        meta: error.meta,
      });

    case 'P2002':
      return new MappedPrismaError({
        error: 'Zaten Mevcut Veri',
        reason: 'Aynı eşşiz değerlere sahip bir başka veri bulunmakta.',
        code: error.code,
        status: 400,
        meta: error.meta,
      });

    case 'P2023':
      return new MappedPrismaError({
        error: 'Geçersiz veri',
        reason: 'Geçersiz ID veya referans gönderildi.',
        code: error.code,
        status: 400,
        meta: error.meta,
      });

    case 'P2025':
      return new MappedPrismaError({
        error: 'Kayıt bulunamadı',
        reason: 'Güncellenmek veya silinmek istenen kayıt veritabanında yok.',
        code: error.code,
        status: 404,
        meta: error.meta,
      });

    case 'P1001':
      return new MappedPrismaError({
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
      return new MappedPrismaError({
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
      return new MappedPrismaError({
        status: 500,
        error: 'Bilinmeyen hata',
        reason: 'Beklenmeyen bir hata oluştu.',
        code: error.code,
        meta: error.meta,
      });
  }
}

export const ResponseSchemaSet = {
  400: ErrorResponseSchema,
  404: ErrorResponseSchema,
  500: ErrorResponseSchema,
  503: ErrorResponseSchema,
  504: ErrorResponseSchema,
};
