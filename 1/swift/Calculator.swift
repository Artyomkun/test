func calculate(x: Int, y: Int) -> Int {
    if x > 0 && y > 0 {
        return x + y
    } else if x > 0 && y <= 0 {
        return x - y
    } else if x <= 0 && y > 0 {
        return -x + y
    } else {
        return -x - y
    }
}

func func(a: Int, b: Int, x: Int) -> Int {
    var result = x
    if a < 9 && b == 5 {
        result = x * a + b
    }
    if a > 2 || result > 6 {
        result += 1
    }
    return result
}

print("=== Swift Calculator ===")
print("calculate(5, 3) = \(calculate(x: 5, y: 3))")
print("calculate(5, -3) = \(calculate(x: 5, y: -3))")
print("calculate(-5, 3) = \(calculate(x: -5, y: 3))")
print("calculate(-5, -3) = \(calculate(x: -5, y: -3))")

print("\n=== Swift Func Tests ===")
print("func(8, 5, 1) = \(func(a: 8, b: 5, x: 1))")
print("func(1, 5, 1) = \(func(a: 1, b: 5, x: 1))")
print("func(10, 1, 1) = \(func(a: 10, b: 1, x: 1))")
print("func(1, 1, 10) = \(func(a: 1, b: 1, x: 10))")