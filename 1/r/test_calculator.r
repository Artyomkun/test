project_path <- Sys.getenv("PROJECT_PATH", "r/")
source(paste0(project_path, "calculator.r"))

cat("=== Testing R Calculator ===\n")

tests_calculate <- list(
  c(5, 3, 8),
  c(5, -3, 8),
  c(-5, 3, 8),
  c(-5, -3, 8),
  c(0, 5, 5),
  c(5, 0, 5),
  c(0, 0, 0)
)

all_passed_calc <- TRUE

for (i in seq_along(tests_calculate)) {
  test <- tests_calculate[[i]]
  x <- test[1]
  y <- test[2]
  expected <- test[3]
  result <- calculate(x, y)
  
  if (result == expected) {
    cat("✅ PASS: calculate(", x, ", ", y, ") = ", result, " (expected: ", expected, ")\n", sep = "")
  } else {
    cat("❌ FAIL: calculate(", x, ", ", y, ") = ", result, " (expected: ", expected, ")\n", sep = "")
    all_passed_calc <- FALSE
  }
}

cat("\n=== Testing Func (White Box) ===\n")

tests_func <- list(
  c(8, 5, 1, 14),
  c(1, 5, 10, 16),
  c(1, 5, 0, 5),
  c(5, 1, 1, 2),
  c(1, 1, 10, 11),
  c(1, 1, 1, 1),
  c(9, 5, 2, 3),
  c(2, 5, 3, 12),
  c(1, 1, 6, 6),
  c(1, 1, 7, 8)
)

all_passed_func <- TRUE

for (i in seq_along(tests_func)) {
  test <- tests_func[[i]]
  a <- test[1]
  b <- test[2]
  x <- test[3]
  expected <- test[4]
  result <- func(a, b, x)
  
  if (result == expected) {
    cat("✅ PASS: func(", a, ", ", b, ", ", x, ") = ", result, " (expected: ", expected, ")\n", sep = "")
  } else {
    cat("❌ FAIL: func(", a, ", ", b, ", ", x, ") = ", result, " (expected: ", expected, ")\n", sep = "")
    all_passed_func <- FALSE
  }
}

cat("\n=== Summary ===\n")
if (all_passed_calc && all_passed_func) {
  cat("🎉 All tests passed!\n")
} else {
  cat("💥 Some tests failed!\n")
}