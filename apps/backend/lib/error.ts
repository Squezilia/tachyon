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

  toResponse() {
    return Response.json(
      {
        error: this.message,
        reason: this.reason,
      },
      { status: this.status }
    );
  }
}

export function InterceptPrismaError(error: unknown): never {
  const prismaKnownError =
    error instanceof Prisma.PrismaClientKnownRequestError ? error : undefined;
  const prismaInitError =
    error instanceof Prisma.PrismaClientInitializationError ? error : undefined;
  const prismaValidationError =
    error instanceof Prisma.PrismaClientValidationError ? error : undefined;

  if (prismaValidationError) {
    throw new PrismaFlowError({
      status: 400,
      code: 'PRISMA_VALIDATION',
      error: 'Geçersiz istek',
      reason: 'Gönderilen bilgiler kontrol edilemedi. Lütfen alanları gözden geçirip tekrar deneyin.',
    });
  }

  const prismaCode = prismaKnownError?.code ?? prismaInitError?.errorCode;
  if (prismaCode) {
    let errorResult: {
      error: string;
      reason: string;
      status: PrismaErrorStatus;
    };

    switch (prismaCode) {
      // Connection / datasource (P1xxx)
      case 'P1000':
        errorResult = {
          error: 'Bağlantı sorunu',
          reason: 'Sistem bağlantı bilgileri hatalı veya eksik.',
          status: 500,
        };
        break;

      case 'P1001':
        errorResult = {
          error: 'Hizmete ulaşılamıyor',
          reason: 'Şu anda hizmete ulaşılamıyor. Lütfen biraz sonra tekrar deneyin.',
          status: 503,
        };
        break;

      case 'P1002':
        errorResult = {
          error: 'İşlem zaman aşımı',
          reason: 'İşlem beklenenden uzun sürdü. Lütfen tekrar deneyin.',
          status: 504,
        };
        break;

      case 'P1003':
        errorResult = {
          error: 'Sistem hatası',
          reason: 'Sistem tarafında bir sorun var.',
          status: 500,
        };
        break;

      case 'P1008':
        errorResult = {
          error: 'İşlem zaman aşımı',
          reason: 'İşlem beklenenden uzun sürdü. Lütfen tekrar deneyin.',
          status: 504,
        };
        break;

      case 'P1010':
        errorResult = {
          error: 'Yetki sorunu',
          reason: 'Bu işlem için yetki verilemedi.',
          status: 500,
        };
        break;

      case 'P1011':
        errorResult = {
          error: 'Bağlantı sorunu',
          reason: 'Güvenli bağlantı kurulamadı. Lütfen biraz sonra tekrar deneyin.',
          status: 503,
        };
        break;

      case 'P1012':
      case 'P1013':
        errorResult = {
          error: 'Sistem hatası',
          reason: 'Sistem tarafında bir sorun var.',
          status: 500,
        };
        break;

      // Veri / işlem (P2xxx)
      case 'P2000':
        errorResult = {
          error: 'Geçersiz veri',
          reason: 'Bir alan için çok uzun veri gönderildi.',
          status: 400,
        };
        break;

      case 'P2001':
        errorResult = {
          error: 'Kayıt bulunamadı',
          reason: 'Aranan kayıt bulunamadı.',
          status: 404,
        };
        break;

      case 'P2002':
        errorResult = {
          error: 'Zaten mevcut',
          reason: 'Aynı bilgilere sahip bir kayıt zaten bulunuyor.',
          status: 400,
        };
        break;

      case 'P2003':
        errorResult = {
          error: 'İşlem yapılamadı',
          reason: 'İşlem için gerekli bağlantılı bilgi bulunamadı.',
          status: 400,
        };
        break;

      case 'P2004':
        errorResult = {
          error: 'İşlem yapılamadı',
          reason: 'Bu işlem mevcut kurallar nedeniyle tamamlanamadı.',
          status: 400,
        };
        break;

      case 'P2005':
        errorResult = {
          error: 'Sistem hatası',
          reason: 'Sistem kayıtlarında tutarsızlık var.',
          status: 500,
        };
        break;

      case 'P2006':
        errorResult = {
          error: 'Geçersiz veri',
          reason: 'Bir alan için geçersiz değer gönderildi.',
          status: 400,
        };
        break;

      case 'P2007':
        errorResult = {
          error: 'Geçersiz veri',
          reason: 'Gönderilen bilgiler uygun formatta değil.',
          status: 400,
        };
        break;

      case 'P2008':
      case 'P2009':
        errorResult = {
          error: 'Geçersiz istek',
          reason: 'İstek işlenemedi. Lütfen tekrar deneyin.',
          status: 400,
        };
        break;

      case 'P2010':
        errorResult = {
          error: 'Sistem hatası',
          reason: 'İşlem şu anda tamamlanamıyor.',
          status: 500,
        };
        break;

      case 'P2011':
        errorResult = {
          error: 'Zorunlu alan boş',
          reason: 'Boş bırakılamayan bir alan boş gönderildi.',
          status: 400,
        };
        break;

      case 'P2012':
      case 'P2013':
        errorResult = {
          error: 'Eksik alan',
          reason: 'Zorunlu bir bilgi eksik.',
          status: 400,
        };
        break;

      case 'P2014':
        errorResult = {
          error: 'İşlem yapılamadı',
          reason: 'Bu değişiklik mevcut kurallar nedeniyle yapılamıyor.',
          status: 400,
        };
        break;

      case 'P2015':
      case 'P2018':
        errorResult = {
          error: 'Kayıt bulunamadı',
          reason: 'İlişkili/bağlı kayıt(lar) bulunamadı.',
          status: 404,
        };
        break;

      case 'P2016':
      case 'P2019':
        errorResult = {
          error: 'Geçersiz istek',
          reason: 'İstek işlenemedi. Lütfen alanları kontrol edip tekrar deneyin.',
          status: 400,
        };
        break;

      case 'P2017':
        errorResult = {
          error: 'İşlem yapılamadı',
          reason: 'Seçilen kayıtlar bu işlem için uygun değil.',
          status: 400,
        };
        break;

      case 'P2020':
        errorResult = {
          error: 'Geçersiz veri',
          reason: 'Alan tipi için değer aralık dışında.',
          status: 400,
        };
        break;

      case 'P2021':
      case 'P2022':
        errorResult = {
          error: 'Sistem hatası',
          reason: 'Sistem tarafında bir sorun var.',
          status: 500,
        };
        break;

      case 'P2023':
        errorResult = {
          error: 'Geçersiz veri',
          reason: 'Geçersiz ID veya referans gönderildi.',
          status: 400,
        };
        break;

      case 'P2024':
        errorResult = {
          error: 'Sistem yoğun',
          reason: 'Şu anda sistem yoğun. Lütfen biraz sonra tekrar deneyin.',
          status: 504,
        };
        break;

      case 'P2025':
        errorResult = {
          error: 'Kayıt bulunamadı',
          reason: 'Güncellenmek veya silinmek istenen kayıt veritabanında yok.',
          status: 404,
        };
        break;

      case 'P2026':
        errorResult = {
          error: 'Sistem hatası',
          reason: 'Bu işlem şu anda desteklenmiyor.',
          status: 500,
        };
        break;

      case 'P2027':
        errorResult = {
          error: 'Sistem hatası',
          reason: 'İşlem sırasında bir hata oluştu.',
          status: 500,
        };
        break;

      case 'P2033':
        errorResult = {
          error: 'Geçersiz veri',
          reason: 'Girilen sayı izin verilen aralığın dışında.',
          status: 400,
        };
        break;

      case 'P2034':
        errorResult = {
          error: 'İşlem tekrar gerekli',
          reason: 'İşlem sırasında geçici bir çakışma oluştu. Lütfen tekrar deneyin.',
          status: 503,
        };
        break;

      case 'P2037':
        errorResult = {
          error: 'Sistem yoğun',
          reason: 'Şu anda yoğunluk nedeniyle işlem tamamlanamadı. Lütfen tekrar deneyin.',
          status: 503,
        };
        break;

      default:
        logger.error(error);
        errorResult = {
          error: 'Bilinmeyen Hata',
          reason: 'Beklenmeyen bir hata oluştu.',
          status: 500,
        };
        break;
    }

    throw new PrismaFlowError({
      status: errorResult.status,
      code: prismaCode,
      error: errorResult.error,
      reason: errorResult.reason,
      meta: prismaKnownError?.meta,
    });
  }

  logger.error(error);
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
    switch (code) {
      case 'PRISMA_ERROR':
        return status(error.status, {
          error: error.message,
          reason: error.reason,
        });

      case 'VALIDATION':
        return status(error.status, {
          error: error.name,
          reason: error.message,
        });

      default:
        break;
    }
  });

export const ErrorReferences: {
  400: 'error';
  404: 'error';
  422: 'error';
  500: 'error';
  503: 'error';
  504: 'error';
} = {
  400: 'error',
  404: 'error',
  422: 'error',
  500: 'error',
  503: 'error',
  504: 'error',
};
