echo "🔨 Компиляция тестовой программы..."
g++ -std=c++17 function.cpp test_simple.cpp -o test_simple

if [ $? -ne 0 ]; then
    echo "❌ Ошибка компиляции!"
    exit 1
fi

echo "✅ Компиляция успешна!"
echo ""
echo "🚀 Запуск тестов..."
echo ""

./test_simple