import { GoogleGenerativeAI } from "@google/generative-ai";
import { SentimentAnalysis, ChatCompletionRequest } from "@/types";

class GeminiService {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    this.client = new GoogleGenerativeAI(apiKey);
    this.model = "gemini-1.5-flash";
  }

  // Analyze sentiment of text
  async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    try {
      const prompt = `Analyze the sentiment of the following text and respond with a JSON object containing:
      - score: a number between -1 (very negative) and 1 (very positive)
      - label: either "positive", "negative", or "neutral"
      - confidence: a number between 0 and 1 indicating confidence in the analysis

      Text: "${text}"

      Respond only with valid JSON.`;

      const model = this.client.getGenerativeModel({ model: this.model });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      const parsedResult = JSON.parse(content);

      return {
        score: parsedResult.score || 0,
        label: parsedResult.label || "neutral",
        confidence: parsedResult.confidence || 0.5,
      };
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      // Return neutral sentiment as fallback
      return {
        score: 0,
        label: "neutral",
        confidence: 0.5,
      };
    }
  }

  // Generate AI chat response
  async generateChatResponse(
    message: string,
    context: string = "",
    language: string = "en"
  ): Promise<{ content: string; suggestions: string[] }> {
    try {
      const systemPrompt = this.getSystemPrompt(language);
      let fullPrompt = systemPrompt;

      if (context) {
        fullPrompt += `\n\nContext: ${context}`;
      }

      fullPrompt += `\n\nUser message: ${message}`;

      const model = this.client.getGenerativeModel({
        model: this.model,
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      });

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const content = response.text();

      const suggestions = this.generateSuggestions(message, language);

      return { content, suggestions };
    } catch (error) {
      console.error("Error generating chat response:", error);
      return {
        content:
          "I apologize, but I cannot provide a response at this time. Please try again later.",
        suggestions: [
          "How are you feeling today?",
          "Would you like to talk about something specific?",
        ],
      };
    }
  }

  // Generate journal prompt
  async generateJournalPrompt(
    mood?: number,
    previousEntries?: string[]
  ): Promise<string> {
    try {
      let prompt = "Generate a thoughtful journaling prompt for someone";

      if (mood) {
        if (mood <= 3) {
          prompt += " who is feeling low or struggling";
        } else if (mood <= 6) {
          prompt += " who is feeling neutral or mixed emotions";
        } else {
          prompt += " who is feeling positive or good";
        }
      }

      if (previousEntries && previousEntries.length > 0) {
        prompt += ` based on their recent journal entries: ${previousEntries.join(
          ", "
        )}`;
      }

      prompt +=
        ". The prompt should be encouraging, non-judgmental, and help them reflect on their thoughts and feelings. Keep it under 100 words.";

      const model = this.client.getGenerativeModel({
        model: this.model,
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.8,
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      return (
        content || "How are you feeling today? What thoughts are on your mind?"
      );
    } catch (error) {
      console.error("Error generating journal prompt:", error);
      return "How are you feeling today? What thoughts are on your mind?";
    }
  }

  // Generate coping strategy suggestions
  async generateCopingSuggestions(
    mood: number,
    emotions: string[],
    language: string = "en"
  ): Promise<string[]> {
    try {
      const prompt = `Based on a mood rating of ${mood}/10 and emotions: ${emotions.join(
        ", "
      )}, suggest 3-5 specific coping strategies. 
      Focus on evidence-based techniques like mindfulness, CBT, breathing exercises, or grounding techniques. 
      Make suggestions practical and actionable. Respond with a JSON array of strings.`;

      const model = this.client.getGenerativeModel({
        model: this.model,
        generationConfig: {
          maxOutputTokens: 200,
          temperature: 0.6,
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      const suggestions = JSON.parse(content || "[]");
      return Array.isArray(suggestions) ? suggestions : [];
    } catch (error) {
      console.error("Error generating coping suggestions:", error);
      return [
        "Take 5 deep breaths",
        "Practice mindfulness meditation",
        "Write down your thoughts",
        "Go for a short walk",
        "Listen to calming music",
      ];
    }
  }

  // Generate session summary
  async generateSessionSummary(
    steps: any[],
    overallMood?: number,
    language: string = "en"
  ): Promise<string> {
    try {
      const prompt = `Generate a brief, encouraging summary for an 8-minute wellness session. 
      Steps completed: ${steps.map((s) => s.title).join(", ")}
      ${overallMood ? `Overall mood: ${overallMood}/10` : ""}
      
      Make it positive, reflective, and encouraging. Keep it under 200 words.`;

      const model = this.client.getGenerativeModel({
        model: this.model,
        generationConfig: {
          maxOutputTokens: 250,
          temperature: 0.7,
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      return (
        content ||
        "Great job completing your wellness session! Take a moment to appreciate your effort."
      );
    } catch (error) {
      console.error("Error generating session summary:", error);
      return "Great job completing your wellness session! Take a moment to appreciate your effort.";
    }
  }

  // Get system prompt based on language
  private getSystemPrompt(language: string): string {
    const prompts = {
      en: `You are a compassionate mental health AI assistant for young adults in Sri Lanka. 
      Provide supportive, non-judgmental responses. Focus on:
      - Active listening and empathy
      - Evidence-based mental health advice
      - Encouraging self-care and coping strategies
      - Cultural sensitivity to Sri Lankan context
      - Crisis awareness (suggest professional help when needed)
      
      Keep responses conversational, supportive, and under 200 words.`,

      si: `ඔබ ශ්‍රී ලංකාවේ තරුණ වැඩිහිටියන් සඳහා සහායක මානසික සෞඛ්‍ය AI සහායකයෙකි.
      සහායක, විනිශ්චය නොකරන ප්‍රතිචාර ලබා දෙන්න. මෙම කරුණු මත අවධානය යොමු කරන්න:
      - ක්‍රියාකාරී සවන් දීම සහ සහානුභූතිය
      - සාක්ෂි-ආශ්‍රිත මානසික සෞඛ්‍ය උපදෙස්
      - ස්වයං රැකවරණය සහ මුහුණ දීමේ උපායන් දිරිමත් කිරීම
      - ශ්‍රී ලාංකික සන්දර්භයට සංස්කෘතික සංවේදීතාව
      - අර්බුද දැනුවත්භාවය (අවශ්‍ය විට වෘත්තීය උපකාරය යෝජනා කරන්න)
      
      ප්‍රතිචාර සාකච්ඡාකාරී, සහායක සහ වචන 200 ට අඩුවෙන් තබන්න.`,

      ta: `நீங்கள் இலங்கையின் இளம் வயதினருக்கான அனுதாபமான மனநல AI உதவியாளர்.
      ஆதரவான, தீர்ப்பளிக்காத பதில்களை வழங்குங்கள். இந்த விஷயங்களில் கவனம் செலுத்துங்கள்:
      - செயலில் கேட்டல் மற்றும் அனுதாபம்
      - சான்று-அடிப்படையிலான மனநல ஆலோசனை
      - சுய பராமரிப்பு மற்றும் சமாளிக்கும் உத்திகளை ஊக்குவித்தல்
      - இலங்கை சூழலுக்கு கலாச்சார உணர்வு
      - நெருக்கடி விழிப்புணர்வு (தேவையானபோது தொழில்முறை உதவியை பரிந்துரைக்கவும்)
      
      பதில்களை உரையாடல், ஆதரவான மற்றும் 200 வார்த்தைகளுக்குள் வைத்திருங்கள்.`,
    };

    return prompts[language as keyof typeof prompts] || prompts.en;
  }

  // Generate chat suggestions based on user message
  private generateSuggestions(message: string, language: string): string[] {
    const suggestions = {
      en: [
        "How are you feeling right now?",
        "What would help you feel better?",
        "Would you like to talk about something specific?",
        "How can I support you today?",
      ],
      si: [
        "දැන් ඔබට කොහොම දැනෙනවද?",
        "ඔබට හොඳට දැනෙන්න කුමක් උදව් වේද?",
        "ඔබට කිසියම් දෙයක් ගැන කතා කිරීමට අවශ්‍යද?",
        "අද මම ඔබට කොහොම සහාය විය හැකිද?",
      ],
      ta: [
        "இப்போது உங்களுக்கு எப்படி உணருகிறீர்கள்?",
        "உங்களுக்கு நன்றாக உணர உதவுவது என்ன?",
        "ஏதாவது குறிப்பிட்ட விஷயத்தைப் பற்றி பேச விரும்புகிறீர்களா?",
        "இன்று நான் உங்களுக்கு எப்படி ஆதரவளிக்க முடியும்?",
      ],
    };

    return suggestions[language as keyof typeof suggestions] || suggestions.en;
  }
}

// Lazy initialization to ensure environment variables are loaded
let geminiServiceInstance: GeminiService | null = null;

export const getGeminiService = (): GeminiService => {
  if (!geminiServiceInstance) {
    geminiServiceInstance = new GeminiService();
  }
  return geminiServiceInstance;
};

export default getGeminiService;
