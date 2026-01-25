import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: import.meta.env.GOOGLE_GEN_AI_API_KEY,
});

export default google;
