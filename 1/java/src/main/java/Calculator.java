public class Calculator {
    public static int func(int a, int b, int x) {
        int result = x;

        if (a < 9 && b == 5) {
            result = x * a + b;
        }

        if (a > 2 || result > 6) {
            result = result + 1;
        }
        return result;
    }    

    public static int calculate(int x, int y) {
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
    
    public static void main(String[] args) {
        System.out.println("=== Calculator Function Examples ===");
        System.out.println("func(4, 5, 2) = " + func(4, 5, 2));      // 14
        System.out.println("func(10, 5, 3) = " + func(10, 5, 3));    // 4
        System.out.println("func(4, 3, 2) = " + func(4, 3, 2));      // 3
        
        System.out.println("\n=== Legacy Function ===");
        System.out.println("calculate(5, 3) = " + calculate(5, 3));
        System.out.println("calculate(5, -3) = " + calculate(5, -3));
        System.out.println("calculate(-5, 3) = " + calculate(-5, 3));
        System.out.println("calculate(-5, -3) = " + calculate(-5, -3));
    }
}