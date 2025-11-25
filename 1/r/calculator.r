calculate <- function(x, y) {
  if (x > 0 && y > 0) {
    return(x + y)
  } else if (x > 0 && y <= 0) {
    return(x - y)
  } else if (x <= 0 && y > 0) {
    return(-x + y)
  } else {
    return(-x - y)
  }
}

func <- function(a, b, x) {
  if (a < 9 && b == 5) {
    x <- x * a + b
  }
  if (a > 2 || x > 6) {
    x <- x + 1
  }
  return(x)
}

cat("=== R Calculator ===\n")
cat("func(8, 5, 1) =", func(8, 5, 1), "\n")
cat("func(1, 5, 1) =", func(1, 5, 1), "\n")
cat("func(10, 1, 1) =", func(10, 1, 1), "\n")
cat("func(1, 1, 10) =", func(1, 1, 10), "\n")