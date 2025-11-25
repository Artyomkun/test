sub calculate {
    my ($x, $y) = @_;
    
    if ($x > 0 && $y > 0) {
        return $x + $y;
    } elsif ($x > 0 && $y <= 0) {
        return $x - $y;
    } elsif ($x <= 0 && $y > 0) {
        return -$x + $y;
    } else {
        return -$x - $y;
    }
}

sub func {
    my ($a, $b, $x) = @_;
    
    if ($a < 9 && $b == 5) {
        $x = $x * $a + $b;
    }
    if ($a > 2 || $x > 6) {
        $x = $x + 1;
    }
    return $x;
}

print "=== Perl Calculator ===\n";
print "calculate(5, 3) = " . calculate(5, 3) . "\n";
print "calculate(5, -3) = " . calculate(5, -3) . "\n";
print "calculate(-5, 3) = " . calculate(-5, 3) . "\n";
print "calculate(-5, -3) = " . calculate(-5, -3) . "\n";

print "\n=== Perl Func ===\n";
print "func(8, 5, 1) = " . func(8, 5, 1) . "\n";
print "func(1, 5, 1) = " . func(1, 5, 1) . "\n";
print "func(10, 1, 1) = " . func(10, 1, 1) . "\n";
print "func(1, 1, 10) = " . func(1, 1, 10) . "\n";