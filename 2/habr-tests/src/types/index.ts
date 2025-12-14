export interface Article {
    title: string;
    link: string;
    author: string;
    rating?: number;
    views?: string;
    tags: string[];
}

export interface User {
    username: string;
    email: string;
    password: string;
    nickname?: string;
}

export interface TestConfig {
    baseUrl: string;
    timeout: number;
    headless: boolean;
    viewport: {
        width: number;
        height: number;
    };
}

export type SortOption = 'relevance' | 'date' | 'rating';
export type TimeFilter = 'all' | 'day' | 'week' | 'month';
