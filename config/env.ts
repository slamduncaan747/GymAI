// config/env.ts
export const getOpenAIApiKey = (): string => {
  // For Next.js (client-side) - use NEXT_PUBLIC_ prefix
  if (typeof window !== 'undefined') {
    const key = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!key) {
      throw new Error(
        'NEXT_PUBLIC_OPENAI_API_KEY is not defined in environment variables',
      );
    }
    return key;
  }

  // For Node.js/server-side
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error('OPENAI_API_KEY is not defined in environment variables');
  }
  return key;
};

// Alternative: Create a singleton instance
let openAIService: any = null;

export const getOpenAIService = () => {
  if (!openAIService) {
    const {createOpenAIService} = require('../services/openAIService');
    openAIService = createOpenAIService(getOpenAIApiKey());
  }
  return openAIService;
};
