export function calculate(a: number, b: number, x: number): number {
    if (a < 9 && b === 5) {
        x = x * a + b;
    }
    
    if (a > 2 || x > 6) {
        x = x + 1;
    }
    
    return x;
}

export function calculateLegacy(x: number, y: number): number {
    if (x > 0 && y > 0) {
        return x + y;
    } else if (x > 0 && y <= 0) {
        return x - y;
    } else if (x <= 0 && y > 0) {
        return -x + y;
    } else {
        const result = -x - y;
        return result === 0 ? 0 : result;
    }
}