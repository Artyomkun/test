import { calculate, calculateLegacy } from '../src/calculator';

const conditionMocks = {
    firstCondition: jest.fn(),
    secondCondition: jest.fn()
};

const calculateWithTracking = (a: number, b: number, x: number): number => {
    conditionMocks.firstCondition(a < 9 && b === 5);
    conditionMocks.secondCondition(a > 2 || x > 6);
    
    return calculate(a, b, x);
};

describe('calculate function with Condition Tracking - White Box Testing', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('path 1: both conditions true - verify condition values', () => {
        const result = calculateWithTracking(4, 5, 2);
        
        expect(conditionMocks.firstCondition).toHaveBeenCalledWith(true);
        expect(conditionMocks.secondCondition).toHaveBeenCalledWith(true);
        expect(result).toBe(14);
    });

    test('path 2: only first condition true - verify condition values', () => {
        const result = calculateWithTracking(1, 5, 1);
        
        expect(conditionMocks.firstCondition).toHaveBeenCalledWith(true);
        expect(conditionMocks.secondCondition).toHaveBeenCalledWith(false);
        expect(result).toBe(6);
    });

    test('path 3: only second condition true - verify condition values', () => {
        const result = calculateWithTracking(5, 3, 1);
        
        expect(conditionMocks.firstCondition).toHaveBeenCalledWith(false);
        expect(conditionMocks.secondCondition).toHaveBeenCalledWith(true);
        expect(result).toBe(2);
    });

    test('path 4: both conditions false - verify condition values', () => {
        const result = calculateWithTracking(1, 3, 2);
        
        expect(conditionMocks.firstCondition).toHaveBeenCalledWith(false);
        expect(conditionMocks.secondCondition).toHaveBeenCalledWith(false);
        expect(result).toBe(2);
    });
});

const legacyBranchMocks = {
    positivePositive: jest.fn(),
    positiveNonPositive: jest.fn(),
    nonPositivePositive: jest.fn(),
    defaultCase: jest.fn()
};

const calculateLegacyWithTracking = (x: number, y: number): number => {
    const result = calculateLegacy(x, y);
    
    if (x > 0 && y > 0) {
        legacyBranchMocks.positivePositive(result);
    } else if (x > 0 && y <= 0) {
        legacyBranchMocks.positiveNonPositive(result);
    } else if (x <= 0 && y > 0) {
        legacyBranchMocks.nonPositivePositive(result);
    } else {
        legacyBranchMocks.defaultCase(result);
    }
    
    return result;
};

describe('calculateLegacy function with Branch Tracking - White Box Testing', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('branch 1: x > 0 && y > 0 - verify branch execution', () => {
        const result = calculateLegacyWithTracking(5, 3);
        
        expect(legacyBranchMocks.positivePositive).toHaveBeenCalledWith(8);
        expect(legacyBranchMocks.positiveNonPositive).not.toHaveBeenCalled();
        expect(legacyBranchMocks.nonPositivePositive).not.toHaveBeenCalled();
        expect(legacyBranchMocks.defaultCase).not.toHaveBeenCalled();
        expect(result).toBe(8);
    });

    test('branch 2: x > 0 && y <= 0 - verify branch execution', () => {
        const result = calculateLegacyWithTracking(5, -3);
        
        expect(legacyBranchMocks.positivePositive).not.toHaveBeenCalled();
        expect(legacyBranchMocks.positiveNonPositive).toHaveBeenCalledWith(8);
        expect(legacyBranchMocks.nonPositivePositive).not.toHaveBeenCalled();
        expect(legacyBranchMocks.defaultCase).not.toHaveBeenCalled();
        expect(result).toBe(8);
    });

    test('branch 3: x <= 0 && y > 0 - verify branch execution', () => {
        const result = calculateLegacyWithTracking(-5, 3);
        
        expect(legacyBranchMocks.positivePositive).not.toHaveBeenCalled();
        expect(legacyBranchMocks.positiveNonPositive).not.toHaveBeenCalled();
        expect(legacyBranchMocks.nonPositivePositive).toHaveBeenCalledWith(8);
        expect(legacyBranchMocks.defaultCase).not.toHaveBeenCalled();
        expect(result).toBe(8);
    });

    test('branch 4: x <= 0 && y <= 0 - verify branch execution', () => {
        const result = calculateLegacyWithTracking(-5, -3);
        
        expect(legacyBranchMocks.positivePositive).not.toHaveBeenCalled();
        expect(legacyBranchMocks.positiveNonPositive).not.toHaveBeenCalled();
        expect(legacyBranchMocks.nonPositivePositive).not.toHaveBeenCalled();
        expect(legacyBranchMocks.defaultCase).toHaveBeenCalledWith(8);
        expect(result).toBe(8);
    });

    test('all execution paths covered', () => {
        const testCases = [
            { x: 1, y: 1, expectedBranch: 'positivePositive' },
            { x: 1, y: -1, expectedBranch: 'positiveNonPositive' },
            { x: -1, y: 1, expectedBranch: 'nonPositivePositive' },
            { x: -1, y: -1, expectedBranch: 'defaultCase' }
        ];

        testCases.forEach(({ x, y, expectedBranch }) => {
            jest.clearAllMocks();
            calculateLegacyWithTracking(x, y);
            expect(legacyBranchMocks[expectedBranch as keyof typeof legacyBranchMocks]).toHaveBeenCalled();
        });
    });
});