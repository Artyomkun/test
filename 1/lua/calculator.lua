function calculate(x, y)
    if x > 0 and y > 0 then
        return x + y
    elseif x > 0 and y <= 0 then
        return x - y
    elseif x <= 0 and y > 0 then
        return -x + y
    else
        return -x - y
    end
end

function func(a, b, x)
    if a < 9 and b == 5 then
        x = x * a + b
    end
    if a > 2 or x > 6 then
        x = x + 1
    end
    return x
end

print("=== Lua Calculator ===")
print("calculate(5, 3) = " .. calculate(5, 3))
print("calculate(5, -3) = " .. calculate(5, -3))
print("calculate(-5, 3) = " .. calculate(-5, 3))
print("calculate(-5, -3) = " .. calculate(-5, -3))