import 'package:test/test.dart';
import 'solution.dart';

void main() {
  
  group('Func function comprehensive tests', () {

    test('C1=true C2=true by a>2', () => expect(func(5, 5, 3), equals((3 * 5 + 5) + 1)));
    test('C1=true C2=true by x>6', () => expect(func(1, 5, 10), equals((10 * 1 + 5) + 1)));
    test('C1=true C2=false', () => expect(func(1, 5, 0), equals(0 * 1 + 5)));
    test('C1=false C2=true by a>2', () => expect(func(5, 1, 1), equals(1 + 1)));
    test('C1=false C2=true by x>6',() => expect(func(1, 1, 10), equals(10 + 1)));
    test('C1=false C2=false', () => expect(func(1, 1, 1), equals(1)));
    test('a=8 b=5', () => expect(func(8, 5, 2), equals((2 * 8 + 5) + 1)));
    test('a=9 b=5', () => expect(func(9, 5, 2), equals(2 + 1))); 
    test('a=2 b=5', () => expect(func(2, 5, 3), equals((3 * 2 + 5) + 1))); 
    test('a=3 b=5',() => expect(func(3, 5, 2), equals((2 * 3 + 5) + 1)));
    test('x=5 a>2', () => expect(func(5, 1, 5), equals(5 + 1)));
    test('x=6 a>2', () => expect(func(5, 1, 6), equals(6 + 1)));
    test('x=7 a>2', () => expect(func(5, 1, 7), equals(7 + 1)));
    test('x=5 a<=2', () => expect(func(1, 1, 5), equals(5)));
    test('x=6 a<=2', () => expect(func(1, 1, 6), equals(6)));
    test('x=7 a<=2', () => expect(func(1, 1, 7), equals(7 + 1)));
    test('a=8 b=5 x=6', () => expect(func(8, 5, 6), equals((6 * 8 + 5) + 1)));
    test('a=9 b=1 x=6', () => expect(func(9, 1, 6), equals(6 + 1)));
    test('a=2 b=5 x=7',() => expect(func(2, 5, 7), equals((7 * 2 + 5) + 1)));
    test('a=0 b=5', () => expect(func(0, 5, 2), equals(2 * 0 + 5)));
    test('x=0 a>2', () => expect(func(5, 1, 0), equals(0 + 1))); 
    test('a=-1 b=5', () => expect(func(-1, 5, 3), equals(2)));
    test('x=-10 a>2', () => expect(func(5, 1, -10), equals(-10 + 1)));
    test('large a small x', () => expect(func(100, 5, 1), equals(1 + 1)));
    test('small a large x', () => expect(func(1, 1, 100), equals(100 + 1)));
    test('all large', () => expect(func(100, 100, 100), equals(100 + 1)));
    test('x=1 a=4 b=5',() => expect(func(4, 5, 1), equals((1 * 4 + 5) + 1)));
    test('x=2 a=3 b=5',() => expect(func(3, 5, 2), equals((2 * 3 + 5) + 1)));
    test('x=10 a=8 b=5',() => expect(func(8, 5, 10), equals((10 * 8 + 5) + 1)));
    test('a=7 b=5 x=4', () => expect(func(7, 5, 4), equals((4 * 7 + 5) + 1)));
    test('a=6 b=5 x=3',() => expect(func(6, 5, 3), equals((3 * 6 + 5) + 1)));
    test('a=4 b=5 x=2',() => expect(func(4, 5, 2), equals((2 * 4 + 5) + 1)));
    test('a=10 b=1 x=8', () => expect(func(10, 1, 8), equals(8 + 1)));

  });
}
