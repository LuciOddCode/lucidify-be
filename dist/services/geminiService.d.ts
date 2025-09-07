import { SentimentAnalysis } from "../types";
declare class GeminiService {
    private client;
    private model;
    constructor();
    analyzeSentiment(text: string): Promise<SentimentAnalysis>;
    generateChatResponse(message: string, context?: string, language?: string): Promise<{
        content: string;
        suggestions: string[];
    }>;
    generateJournalPrompt(mood?: number, previousEntries?: string[]): Promise<string>;
    generateCopingSuggestions(mood: number, emotions: string[], language?: string): Promise<string[]>;
    generateSessionSummary(steps: any[], overallMood?: number, language?: string): Promise<string>;
    private getSystemPrompt;
    private generateSuggestions;
}
declare const _default: GeminiService;
export default _default;
//# sourceMappingURL=geminiService.d.ts.map