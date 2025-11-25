def calculate(x, y)
  case
  when x > 0 && y > 0 then x + y
  when x > 0 && y <= 0 then x - y
  when x <= 0 && y > 0 then -x + y
  else -x - y
  end
end

def func(a, b, x)
  if a < 9 && b == 5
    x = x * a + b
  end
  if a > 2 || x > 6
    x = x + 1
  end
  x
end

puts "=== Ruby Calculator ==="
puts "calculate(5, 3) = #{calculate(5, 3)}"
puts "calculate(5, -3) = #{calculate(5, -3)}"
puts "calculate(-5, 3) = #{calculate(-5, 3)}"
puts "calculate(-5, -3) = #{calculate(-5, -3)}"

puts "\n=== Ruby Func ==="
puts "func(8, 5, 1) = #{func(8, 5, 1)}"
puts "func(1, 5, 1) = #{func(1, 5, 1)}"
puts "func(10, 1, 1) = #{func(10, 1, 1)}"
puts "func(1, 1, 10) = #{func(1, 1, 10)}"