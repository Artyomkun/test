int func(int a, int b, int x) {
  if (a < 9 && b == 5) {
    x = x * a + b;
  }
  if (a > 2 || x > 6) {
    x = x + 1;
  }
  return x;
}

int calculate(int x, int y) {
  if (x > 0 && y > 0) {
    return x + y;
  } else if (x > 0 && y <= 0) {
    return x - y;
  } else if (x <= 0 && y > 0) {
    return -x + y;
  } else {
    return -x - y;
  }
}

void main() {
  print(calculate(5, 3));
  print(calculate(5, -3));
  print(calculate(-5, 3));
  print(calculate(-5, -3));
}