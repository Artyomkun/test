fn calculate(x: i32, y: i32) -> i32 {
    match (x > 0, y > 0) {
        (true, true) => x + y,
        (true, false) => x - y,
        (false, true) => -x + y,
        (false, false) => -x - y,
    }
}

fn func(a: i32, b: i32, mut x: i32) -> i32 {
    if a < 9 && b == 5 {
        x = x * a + b;
    }
    if a > 2 || x > 6 {
        x += 1;
    }
    x
}

fn main() {
    println!("=== Rust Calculator ===");
    println!("calculate(5, 3) = {}", calculate(5, 3));
    println!("calculate(5, -3) = {}", calculate(5, -3));
    println!("calculate(-5, 3) = {}", calculate(-5, 3));
    println!("calculate(-5, -3) = {}", calculate(-5, -3));

    println!("\n=== Rust Func ===");
    println!("func(8, 5, 1) = {}", func(8, 5, 1));
    println!("func(1, 5, 1) = {}", func(1, 5, 1));
    println!("func(10, 1, 1) = {}", func(10, 1, 1));
    println!("func(1, 1, 10) = {}", func(1, 1, 10));
}