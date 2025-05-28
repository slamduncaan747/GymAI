// config/config.ts

// Option 1: If using Expo (no additional packages needed)
// In your .env file, use: EXPO_PUBLIC_OPENAI_API_KEY=your-key
export const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

// Option 2: If using bare React Native with react-native-dotenv
// First install: npm install react-native-dotenv
// Then uncomment these lines and comment out Option 1:
// import { OPENAI_API_KEY as ENV_OPENAI_KEY } from '@env';
// export const OPENAI_API_KEY = ENV_OPENAI_KEY || '';

// Option 3: For immediate testing, you can hardcode it temporarily:
// export const OPENAI_API_KEY = 'sk-your-actual-api-key-here';

console.log('OpenAI API Key loaded:', OPENAI_API_KEY ? 'Yes' : 'No');
