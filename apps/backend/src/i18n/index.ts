export default interface Language {
  error: {
    organization: {
      noActive: ResponseError;
      insufficentPermission: ResponseError;
    };
    retail: {
      stockError: ResponseError;
      sellIsAlreadyReversed: ResponseError;
      notFound: ResponseError;
    };
    campaign: {
      notFound: ResponseError;
    };
    product: {
      notFound: ResponseError;
    };
    category: {
      notFound: ResponseError;
    };
    tax: {
      notFound: ResponseError;
    };
    assistant: {
      notFound: ResponseError;
    };
    table: {
      notFound: ResponseError;
    };
  };
}

export interface ResponseError {
  error: string;
  reason: string;
}
