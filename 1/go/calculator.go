package main

import "fmt"

func myFunc(a int, b int, x int) int {
    if a < 9 && b == 5 {
        x = x * a + b
    }
    if a > 2 || x > 6 {
        x = x + 1
    }
    return x
}

func calculate(x int, y int) int {
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

func main() {
    // Тестируем calculate с 2 аргументами
    fmt.Println(calculate(5, 3))
    fmt.Println(calculate(5, -3))
    fmt.Println(calculate(-5, 3))
    fmt.Println(calculate(-5, -3))
    
    // Тестируем myFunc с 3 аргументами
    fmt.Println(myFunc(8, 5, 1))
    fmt.Println(myFunc(5, 3, 2))
    fmt.Println(myFunc(5, -3, 4))
    fmt.Println(myFunc(-5, 3, 6))
}