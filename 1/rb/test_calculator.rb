require_relative 'calculator'

puts "=== Testing Ruby Calculator ==="

tests_calculate = [
  [5, 3, 8],
  [5, -3, 8],
  [-5, 3, 8],
  [-5, -3, 8],
  [0, 5, 5],
  [5, 0, 5],
  [0, 0, 0]
]

all_passed_calc = true

tests_calculate.each_with_index do |test, i|
  x, y, expected = test
  result = calculate(x, y)
  
  if result == expected
    puts "✅ PASS: calculate(#{x}, #{y}) = #{result} (expected: #{expected})"
  else
    puts "❌ FAIL: calculate(#{x}, #{y}) = #{result} (expected: #{expected})"
    all_passed_calc = false
  end
end

puts "\n✅ All calculate tests passed!" if all_passed_calc

puts "\n=== Testing Func (White Box) ==="

tests_func = [
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
]

all_passed_func = true

tests_func.each_with_index do |test, i|
  a, b, x, expected = test
  result = func(a, b, x)
  
  if result == expected
    puts "✅ PASS: func(#{a}, #{b}, #{x}) = #{result} (expected: #{expected})"
  else
    puts "❌ FAIL: func(#{a}, #{b}, #{x}) = #{result} (expected: #{expected})"
    all_passed_func = false
  end
end

puts "\n=== Summary ==="
if all_passed_calc && all_passed_func
  puts "🎉 All tests passed! (#{tests_calculate.size} calculate + #{tests_func.size} func)"
else
  puts "💥 Some tests failed!"
  puts "💥 calculate tests failed!" unless all_passed_calc
  puts "💥 func tests failed!" unless all_passed_func
end