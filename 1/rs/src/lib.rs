pub fn calculate(x: i32, y: i32) -> i32 {
    match (x > 0, y > 0) {
        (true, true) => x + y,
        (true, false) => x - y,
        (false, true) => -x + y,
        (false, false) => -x - y,
    }
}

pub fn func(a: i32, b: i32, mut x: i32) -> i32 {
    if a < 9 && b == 5 {
        x = x * a + b;
    }
    if a > 2 || x > 6 {
        x += 1;
    }
    x
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate() {
        assert_eq!(calculate(5, 3), 8);
        assert_eq!(calculate(5, -3), 8);
        assert_eq!(calculate(-5, 3), 8);
        assert_eq!(calculate(-5, -3), 8);
        assert_eq!(calculate(0, 5), 5);
        assert_eq!(calculate(5, 0), 5);
        assert_eq!(calculate(0, 0), 0);
    }

    #[test]
    fn test_func_white_box() {
        // Оба условия TRUE
        assert_eq!(func(8, 5, 1), 14);
        assert_eq!(func(1, 5, 10), 16);
        
        // Первое условие TRUE, второе FALSE
        assert_eq!(func(1, 5, 0), 5);
        
        // Первое условие FALSE, второе TRUE
        assert_eq!(func(5, 1, 1), 2);
        assert_eq!(func(1, 1, 10), 11);
        
        // Оба условия FALSE
        assert_eq!(func(1, 1, 1), 1);
        
        // Граничные значения
        assert_eq!(func(9, 5, 2), 3);
        assert_eq!(func(2, 5, 3), 12);
        assert_eq!(func(1, 1, 6), 6);
        assert_eq!(func(1, 1, 7), 8);
    }
}