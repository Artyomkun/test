export class TestHelpers {
    static async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static generateRandomEmail(): string {
        const timestamp = Date.now();
        return `test_${timestamp}@test.com`;
    }

    static generateRandomUsername(): string {
        const adjectives = ['cool', 'fast', 'smart', 'happy', 'brave'];
        const nouns = ['tester', 'developer', 'user', 'qa', 'engineer'];
        const randomNum = Math.floor(Math.random() * 1000);
        
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        
        return `${adjective}_${noun}_${randomNum}`;
    }

    static async isExternalLink(link: string): Promise<boolean> {
        return !link.includes('habr.com');
    }

    static formatDate(date: Date): string {
            return date.toISOString().split('T')[0];
        }
    }

    // Генератор тестовых данных
    export const TestData = {
    validUser: {
        username: 'test_user',
        email: 'test@example.com',
        password: 'TestPassword123!',
    },
    
    invalidUsers: {
        shortPassword: {
            email: 'test@example.com',
            password: '123',
        },
        invalidEmail: {
            email: 'invalid-email',
            password: 'TestPassword123!',
        },
        emptyFields: {
            email: '',
            password: '',
        },
    },
    
    searchQueries: [
        'JavaScript',
        'Python',
        'DevOps',
        'Machine Learning',
        'Web Development',
    ],
};