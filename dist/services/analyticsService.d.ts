import { MoodAnalytics, JournalAnalytics } from "../types";
declare class AnalyticsService {
    getMoodAnalytics(userId: string, days?: number): Promise<MoodAnalytics>;
    getJournalAnalytics(userId: string, days?: number): Promise<JournalAnalytics>;
    private calculateMoodTrend;
    private calculateWeeklyData;
    private calculateEmotionFrequency;
    private calculateSentimentDistribution;
    private calculateCommonThemes;
    private calculateWeeklySummary;
    getInsights(userId: string): Promise<{
        moodInsights: string[];
        journalInsights: string[];
        recommendations: string[];
    }>;
    private generateMoodInsights;
    private generateJournalInsights;
    private generateRecommendations;
}
declare const _default: AnalyticsService;
export default _default;
//# sourceMappingURL=analyticsService.d.ts.map