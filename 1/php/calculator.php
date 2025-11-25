<?php
function calculate($x, $y): mixed {
    if ($x > 0 && $y > 0) {
        return $x + $y;
    } elseif ($x > 0 && $y <= 0) {
        return $x - $y;
    } elseif ($x <= 0 && $y > 0) {
        return -$x + $y;
    } else {
        return -$x - $y;
    }
}

function func($a, $b, $x): mixed {
    if ($a < 9 && $b == 5) {
        $x = $x * $a + $b;
    }
    if ($a > 2 || $x > 6) {
        $x = $x + 1;
    }
    return $x;
}

if (basename(path: __FILE__) == basename(path: $_SERVER["PHP_SELF"])) {
    echo "=== PHP Calculator ===\n";
    echo "calculate(5, 3) = " . calculate(x: 5, y: 3) . "\n";
    echo "calculate(5, -3) = " . calculate(x: 5, y: -3) . "\n";
    echo "calculate(-5, 3) = " . calculate(x: -5, y: 3) . "\n";
    echo "calculate(-5, -3) = " . calculate(x: -5, y: -3) . "\n";

    echo "\n=== PHP Func Tests ===\n";
    echo "func(8, 5, 1) = " . func(a: 8, b: 5, x: 1) . "\n";
    echo "func(1, 5, 1) = " . func(a: 1, b: 5, x: 1) . "\n";
    echo "func(10, 1, 1) = " . func(a: 10, b: 1, x: 1) . "\n";
    echo "func(1, 1, 10) = " . func(a: 1, b: 1, x: 10) . "\n";
}
?>