import Foundation

func calculate(_ x: Int, _ y: Int) -> Int {
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

func funcTest(_ a: Int, _ b: Int, _ x: Int) -> Int {
    var result = x
    if a < 9 && b == 5 {
        result = x * a + b
    }
    if a > 2 || result > 6 {
        result += 1
    }
    return result
}

func testCalculate() {
    let testCases = [
        (5, 3, 8),
        (5, -3, 8),
        (-5, 3, 8),
        (-5, -3, 8),
        (0, 5, 5),
        (5, 0, 5),
        (0, 0, 0)
    ]
    
    print("=== Swift Calculate Tests ===")
    var allPassed = true
    
    for (x, y, expected) in testCases {
        let result = calculate(x, y)
        let status = result == expected ? "✅" : "❌"
        print("\(status) calculate(\(x), \(y)) = \(result) (expected: \(expected))")
        
        if result != expected {
            allPassed = false
        }
    }
    
    if allPassed {
        print("🎉 All calculate tests passed!")
    } else {
        print("💥 Some calculate tests failed!")
    }
}

func testFuncWhiteBox() {
    let testCases = [
        (8, 5, 1, 14),
        (1, 5, 10, 16),
        (1, 5, 0, 5),
        (5, 1, 1, 2),
        (1, 1, 10, 11),
        (1, 1, 1, 1),
        (9, 5, 2, 3),
        (2, 5, 3, 12),
        (1, 1, 6, 6),
        (1, 1, 7, 8)
    ]
    
    print("\n=== Swift Func Tests (White Box) ===")
    var allPassed = true
    
    for (a, b, x, expected) in testCases {
        let result = funcTest(a, b, x)
        let status = result == expected ? "✅" : "❌"
        print("\(status) func(\(a), \(b), \(x)) = \(result) (expected: \(expected))")
        
        if result != expected {
            allPassed = false
        }
    }
    
    if allPassed {
        print("🎉 All func tests passed!")
    } else {
        print("💥 Some func tests failed!")
    }
}

testCalculate()
testFuncWhiteBox()