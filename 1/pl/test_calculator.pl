use strict;
use warnings;
use Test::Simple tests => 17;

require 'calculator.pl';

print "=== Testing Perl Calculator ===\n";

ok(calculate(5, 3) == 8, 'calculate(5, 3) = 8');
ok(calculate(5, -3) == 8, 'calculate(5, -3) = 8');
ok(calculate(-5, 3) == 8, 'calculate(-5, 3) = 8');
ok(calculate(-5, -3) == 8, 'calculate(-5, -3) = 8');
ok(calculate(0, 5) == 5, 'calculate(0, 5) = 5');
ok(calculate(5, 0) == 5, 'calculate(5, 0) = 5');
ok(calculate(0, 0) == 0, 'calculate(0, 0) = 0');

print "\n=== Testing Func (White Box) ===\n";

ok(func(8, 5, 1) == 14, 'func(8, 5, 1) = 14 - оба условия TRUE');
ok(func(1, 5, 10) == 16, 'func(1, 5, 10) = 16 - оба условия TRUE');
ok(func(1, 5, 0) == 5, 'func(1, 5, 0) = 5 - первое TRUE, второе FALSE');
ok(func(5, 1, 1) == 2, 'func(5, 1, 1) = 2 - первое FALSE, второе TRUE');
ok(func(1, 1, 10) == 11, 'func(1, 1, 10) = 11 - первое FALSE, второе TRUE');
ok(func(1, 1, 1) == 1, 'func(1, 1, 1) = 1 - оба условия FALSE');
ok(func(9, 5, 2) == 3, 'func(9, 5, 2) = 3 - граничное a=9');
ok(func(2, 5, 3) == 12, 'func(2, 5, 3) = 12 - граничное a=2');
ok(func(1, 1, 6) == 6, 'func(1, 1, 6) = 6 - граничное x=6');
ok(func(1, 1, 7) == 8, 'func(1, 1, 7) = 8 - граничное x=7');

print "\n🎉 All Perl tests completed!\n";