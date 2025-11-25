def func(a: int, b: int, x: int) -> int:
    if a < 9 and b == 5:
        x = x * a + b
    if a > 2 or x > 6:
        x = x + 1
    return x

def calculate(x: int, y: int) -> int:
    if x > 0 and y > 0:
        return x + y
    elif x > 0 and y <= 0:
        return x - y
    elif x <= 0 and y > 0:
        return -x + y
    else:
        return -x - y