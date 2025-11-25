import { calculate, calculateLegacy } from '../src/calculator';

describe('Additional Coverage Tests', () => {
    test('calculate - edge case a=8, b=5 (boundary a<9)', () => {
        expect(calculate(8, 5, 1)).toBe(14);
    });

    test('calculate - edge case a=9, b=5 (boundary a=9)', () => {
        expect(calculate(9, 5, 1)).toBe(2);
    });

    test('calculate - edge case a=3, b=5 (boundary a>2)', () => {
        expect(calculate(3, 5, 1)).toBe(9);
    });

    test('calculate - edge case a=2, b=5 (boundary a=2)', () => {
        expect(calculate(2, 5, 7)).toBe(20);
    });

    test('calculate - edge case x=6 (boundary x>6)', () => {
        expect(calculate(1, 5, 6)).toBe(12);
    });

    test('calculate - edge case x=7 (boundary x>6)', () => {
        expect(calculate(1, 5, 7)).toBe(13);
    });

    test('calculateLegacy - zero cases', () => {
        expect(calculateLegacy(0, 0)).toBe(0);
        expect(calculateLegacy(0, 5)).toBe(5);
        expect(calculateLegacy(5, 0)).toBe(5);
    });

    test('calculateLegacy - negative numbers', () => {
        expect(calculateLegacy(-1, -1)).toBe(2);
        expect(calculateLegacy(-10, -5)).toBe(15);
    });
});