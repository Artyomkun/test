-- Подключаем основную функцию
dofile("calculator.lua")

print("=== Testing Calculator ===")

-- Тесты для calculate
local result1 = calculate(5, 3)
print("Test 1 - calculate(5, 3) = " .. result1 .. " (expected: 8)")
assert(result1 == 8, "Test 1 failed")

local result2 = calculate(5, -3)
print("Test 2 - calculate(5, -3) = " .. result2 .. " (expected: 8)")
assert(result2 == 8, "Test 2 failed")

local result3 = calculate(-5, 3)
print("Test 3 - calculate(-5, 3) = " .. result3 .. " (expected: 8)")
assert(result3 == 8, "Test 3 failed")

local result4 = calculate(-5, -3)
print("Test 4 - calculate(-5, -3) = " .. result4 .. " (expected: 8)")
assert(result4 == 8, "Test 4 failed")

print("✅ All calculate tests passed!")

print("\n=== Testing Func (White Box) ===")

-- Тесты для func по методике белого ящика

-- 1. Оба условия TRUE (a<9&b=5 и a>2)
local result11 = func(8, 5, 1)
print("Test 11 - func(8, 5, 1) = " .. result11 .. " (expected: 14)")
assert(result11 == 14, "Test 11 failed")

-- 2. Оба условия TRUE (a<9&b=5 и x>6)
local result12 = func(1, 5, 10)
print("Test 12 - func(1, 5, 10) = " .. result12 .. " (expected: 16)")
assert(result12 == 16, "Test 12 failed")

-- 3. Первое TRUE, второе FALSE
local result13 = func(1, 5, 0)
print("Test 13 - func(1, 5, 0) = " .. result13 .. " (expected: 5)")
assert(result13 == 5, "Test 13 failed")

-- 4. Первое FALSE, второе TRUE по a>2
local result14 = func(5, 1, 1)
print("Test 14 - func(5, 1, 1) = " .. result14 .. " (expected: 2)")
assert(result14 == 2, "Test 14 failed")

-- 5. Первое FALSE, второе TRUE по x>6
local result15 = func(1, 1, 10)
print("Test 15 - func(1, 1, 10) = " .. result15 .. " (expected: 11)")
assert(result15 == 11, "Test 15 failed")

-- 6. Оба условия FALSE
local result16 = func(1, 1, 1)
print("Test 16 - func(1, 1, 1) = " .. result16 .. " (expected: 1)")
assert(result16 == 1, "Test 16 failed")

-- 7. Граничное значение a=9
local result17 = func(9, 5, 2)
print("Test 17 - func(9, 5, 2) = " .. result17 .. " (expected: 3)")
assert(result17 == 3, "Test 17 failed")

-- 8. Граничное значение a=2
local result18 = func(2, 5, 3)
print("Test 18 - func(2, 5, 3) = " .. result18 .. " (expected: 12)")
assert(result18 == 12, "Test 18 failed")

-- 9. Граничное значение x=6
local result19 = func(1, 1, 6)
print("Test 19 - func(1, 1, 6) = " .. result19 .. " (expected: 6)")
assert(result19 == 6, "Test 19 failed")

-- 10. Граничное значение x=7
local result20 = func(1, 1, 7)
print("Test 20 - func(1, 1, 7) = " .. result20 .. " (expected: 8)")
assert(result20 == 8, "Test 20 failed")

print("✅ All func tests passed!")
print("🎉 All white box tests completed successfully!")