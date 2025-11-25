<?php
require_once 'calculator.php';

function test_calculate(): bool {
    $tests = [
        [5, 3, 8],
        [5, -3, 8],
        [-5, 3, 8],
        [-5, -3, 8],
        [0, 5, 5],
        [5, 0, 5],
        [0, 0, 0]
    ];
    
    echo "=== PHP Calculate Tests ===\n";
    $all_passed = true;
    
    foreach ($tests as $test) {
        list($x, $y, $expected) = $test;
        $result = calculate($x, $y);
        $status = $result === $expected ? "✅" : "❌";
        echo "$status calculate($x, $y) = $result (expected: $expected)\n";
        
        if ($result !== $expected) {
            $all_passed = false;
        }
    }
    
    if ($all_passed) {
        echo "🎉 All calculate tests passed!\n";
    } else {
        echo "💥 Some calculate tests failed!\n";
    }
    return $all_passed;
}

function test_func_white_box(): bool {
    $tests = [
        [8, 5, 1, 14], 
        [1, 5, 10, 16],
        [1, 5, 0, 5],
        [5, 1, 1, 2],
        [1, 1, 10, 11],
        [1, 1, 1, 1],
        [9, 5, 2, 3],
        [2, 5, 3, 12],
        [1, 1, 6, 6],
        [1, 1, 7, 8]
    ];
    
    echo "\n=== PHP Func Tests (White Box) ===\n";
    $all_passed = true;
    
    foreach ($tests as $test) {
        list($a, $b, $x, $expected) = $test;
        $result = func($a, $b, $x);
        $status = $result === $expected ? "✅" : "❌";
        echo "$status func($a, $b, $x) = $result (expected: $expected)\n";
        
        if ($result !== $expected) {
            $all_passed = false;
        }
    }
    
    if ($all_passed) {
        echo "🎉 All func tests passed!\n";
    } else {
        echo "💥 Some func tests failed!\n";
    }
    return $all_passed;
}

$calculate_passed = test_calculate();
$func_passed = test_func_white_box();

echo "\n=== Summary ===\n";
if ($calculate_passed && $func_passed) {
    echo "🎉 All PHP tests passed! (7 calculate + 10 func)\n";
} else {
    echo "💥 Some PHP tests failed!\n";
}
?>