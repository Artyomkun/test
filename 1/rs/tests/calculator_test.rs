use my_calculator::calculate;

#[test]
fn test_both_positive() {
    assert_eq!(calculate(5, 3), 8);
}

#[test]
fn test_positive_negative() {
    assert_eq!(calculate(5, -3), 8);
}

#[test]
fn test_negative_positive() {
    assert_eq!(calculate(-5, 3), 8);
}

#[test]
fn test_both_negative() {
    assert_eq!(calculate(-5, -3), 8);
}

#[test]
fn test_zero_positive() {
    assert_eq!(calculate(0, 5), 5);
}

#[test]
fn test_positive_zero() {
    assert_eq!(calculate(5, 0), 5);
}

#[test]
fn test_both_zero() {
    assert_eq!(calculate(0, 0), 0);
}