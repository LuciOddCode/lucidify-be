"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MoodEntry_1 = require("../models/MoodEntry");
const JournalEntry_1 = require("../models/JournalEntry");
class AnalyticsService {
    async getMoodAnalytics(userId, days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const moodEntries = await MoodEntry_1.MoodEntry.find({
                userId,
                timestamp: { $gte: startDate },
            }).sort({ timestamp: 1 });
            if (moodEntries.length === 0) {
                return {
                    averageMood: 0,
                    moodTrend: [],
                    weeklyData: [],
                    emotionFrequency: [],
                };
            }
            const averageMood = moodEntries.reduce((sum, entry) => sum + entry.mood, 0) /
                moodEntries.length;
            const trendDays = 7;
            const trendStartDate = new Date();
            trendStartDate.setDate(trendStartDate.getDate() - trendDays);
            const trendEntries = moodEntries.filter((entry) => entry.timestamp >= trendStartDate);
            const moodTrend = this.calculateMoodTrend(trendEntries, trendDays);
            const weeklyData = this.calculateWeeklyData(moodEntries);
            const emotionFrequency = this.calculateEmotionFrequency(moodEntries);
            return {
                averageMood: Math.round(averageMood * 10) / 10,
                moodTrend,
                weeklyData,
                emotionFrequency,
            };
        }
        catch (error) {
            console.error("Error getting mood analytics:", error);
            throw error;
        }
    }
    async getJournalAnalytics(userId, days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const journalEntries = await JournalEntry_1.JournalEntry.find({
                userId,
                timestamp: { $gte: startDate },
            }).sort({ timestamp: 1 });
            if (journalEntries.length === 0) {
                return {
                    totalEntries: 0,
                    averageLength: 0,
                    sentimentDistribution: { positive: 0, negative: 0, neutral: 0 },
                    commonThemes: [],
                    weeklySummary: [],
                };
            }
            const totalEntries = journalEntries.length;
            const averageLength = journalEntries.reduce((sum, entry) => sum + entry.content.length, 0) /
                totalEntries;
            const sentimentDistribution = this.calculateSentimentDistribution(journalEntries);
            const commonThemes = this.calculateCommonThemes(journalEntries);
            const weeklySummary = this.calculateWeeklySummary(journalEntries);
            return {
                totalEntries,
                averageLength: Math.round(averageLength),
                sentimentDistribution,
                commonThemes,
                weeklySummary,
            };
        }
        catch (error) {
            console.error("Error getting journal analytics:", error);
            throw error;
        }
    }
    calculateMoodTrend(entries, days) {
        const trend = new Array(days).fill(0);
        const counts = new Array(days).fill(0);
        entries.forEach((entry) => {
            const dayIndex = Math.floor((Date.now() - entry.timestamp.getTime()) / (1000 * 60 * 60 * 24));
            if (dayIndex >= 0 && dayIndex < days) {
                trend[dayIndex] += entry.mood;
                counts[dayIndex]++;
            }
        });
        return trend.map((sum, index) => counts[index] > 0 ? Math.round((sum / counts[index]) * 10) / 10 : 0);
    }
    calculateWeeklyData(entries) {
        const daysOfWeek = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];
        const weeklyData = daysOfWeek.map((day) => ({ day, mood: 0, count: 0 }));
        entries.forEach((entry) => {
            const dayOfWeek = entry.timestamp.getDay();
            weeklyData[dayOfWeek].mood += entry.mood;
            weeklyData[dayOfWeek].count++;
        });
        return weeklyData.map((day) => ({
            ...day,
            mood: day.count > 0 ? Math.round((day.mood / day.count) * 10) / 10 : 0,
        }));
    }
    calculateEmotionFrequency(entries) {
        const emotionCount = {};
        entries.forEach((entry) => {
            entry.emotions.forEach((emotion) => {
                emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
            });
        });
        return Object.entries(emotionCount)
            .map(([emotion, count]) => ({ emotion, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }
    calculateSentimentDistribution(entries) {
        const distribution = { positive: 0, negative: 0, neutral: 0 };
        entries.forEach((entry) => {
            const label = entry.sentiment.label;
            distribution[label]++;
        });
        return distribution;
    }
    calculateCommonThemes(entries) {
        const themeCount = {};
        entries.forEach((entry) => {
            entry.tags.forEach((tag) => {
                themeCount[tag] = (themeCount[tag] || 0) + 1;
            });
        });
        return Object.entries(themeCount)
            .map(([theme, count]) => ({ theme, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }
    calculateWeeklySummary(entries) {
        const weeks = {};
        entries.forEach((entry) => {
            const weekStart = new Date(entry.timestamp);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const weekKey = weekStart.toISOString().split("T")[0];
            if (!weeks[weekKey]) {
                weeks[weekKey] = { entries: [], totalSentiment: 0 };
            }
            weeks[weekKey].entries.push(entry);
            weeks[weekKey].totalSentiment += entry.sentiment.score;
        });
        return Object.entries(weeks)
            .map(([week, data]) => ({
            week,
            entries: data.entries.length,
            averageSentiment: data.entries.length > 0
                ? Math.round((data.totalSentiment / data.entries.length) * 100) /
                    100
                : 0,
        }))
            .sort((a, b) => a.week.localeCompare(b.week));
    }
    async getInsights(userId) {
        try {
            const moodAnalytics = await this.getMoodAnalytics(userId, 30);
            const journalAnalytics = await this.getJournalAnalytics(userId, 30);
            const moodInsights = this.generateMoodInsights(moodAnalytics);
            const journalInsights = this.generateJournalInsights(journalAnalytics);
            const recommendations = this.generateRecommendations(moodAnalytics, journalAnalytics);
            return {
                moodInsights,
                journalInsights,
                recommendations,
            };
        }
        catch (error) {
            console.error("Error getting insights:", error);
            throw error;
        }
    }
    generateMoodInsights(analytics) {
        const insights = [];
        if (analytics.averageMood > 7) {
            insights.push("You've been feeling quite positive lately! Keep up the great work.");
        }
        else if (analytics.averageMood < 4) {
            insights.push("You've been going through a tough time. Remember, it's okay to not be okay.");
        }
        else {
            insights.push("Your mood has been relatively stable. Consider what helps you feel your best.");
        }
        if (analytics.moodTrend.length > 0) {
            const recentTrend = analytics.moodTrend.slice(-3);
            if (recentTrend.every((mood, i) => i === 0 || mood > recentTrend[i - 1])) {
                insights.push("Your mood has been improving over the past few days!");
            }
            else if (recentTrend.every((mood, i) => i === 0 || mood < recentTrend[i - 1])) {
                insights.push("Your mood has been declining recently. Consider reaching out for support.");
            }
        }
        if (analytics.emotionFrequency.length > 0) {
            const topEmotion = analytics.emotionFrequency[0];
            insights.push(`Your most common emotion lately has been ${topEmotion.emotion}.`);
        }
        return insights;
    }
    generateJournalInsights(analytics) {
        const insights = [];
        if (analytics.totalEntries > 20) {
            insights.push("You've been very consistent with journaling! This is great for your mental health.");
        }
        else if (analytics.totalEntries < 5) {
            insights.push("Consider journaling more regularly. Even a few minutes a day can help.");
        }
        if (analytics.averageLength > 500) {
            insights.push("You write detailed entries, which shows great self-reflection.");
        }
        const totalSentiment = analytics.sentimentDistribution.positive +
            analytics.sentimentDistribution.negative +
            analytics.sentimentDistribution.neutral;
        if (totalSentiment > 0) {
            const positiveRatio = analytics.sentimentDistribution.positive / totalSentiment;
            if (positiveRatio > 0.6) {
                insights.push("Your journal entries tend to be quite positive. This is wonderful!");
            }
            else if (positiveRatio < 0.3) {
                insights.push("Your journal entries have been more negative lately. Consider what might help.");
            }
        }
        return insights;
    }
    generateRecommendations(moodAnalytics, journalAnalytics) {
        const recommendations = [];
        if (moodAnalytics.averageMood < 5) {
            recommendations.push("Consider trying some coping strategies or reaching out to a trusted person.");
        }
        if (journalAnalytics.totalEntries < 10) {
            recommendations.push("Try journaling for 5-10 minutes each day to build a healthy habit.");
        }
        if (moodAnalytics.emotionFrequency.length > 0) {
            const topEmotion = moodAnalytics.emotionFrequency[0];
            if (["anxiety", "worry", "stress"].includes(topEmotion.emotion.toLowerCase())) {
                recommendations.push("Try some breathing exercises or mindfulness techniques to help with anxiety.");
            }
            else if (["sadness", "loneliness", "depression"].includes(topEmotion.emotion.toLowerCase())) {
                recommendations.push("Consider reaching out to friends or family, or try some uplifting activities.");
            }
        }
        recommendations.push("Remember to be kind to yourself and celebrate small wins.");
        return recommendations;
    }
}
exports.default = new AnalyticsService();
//# sourceMappingURL=analyticsService.js.map