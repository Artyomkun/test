from typing import List, Tuple, Dict, Any
from function import calculate, func
import pytest

class TestCalculateFunction:
    """Класс тестов для функции calculate"""

    @pytest.mark.parametrize("x,y,expected", [(5, 3, 8), (10, 7, 17)])
    def test_positive_positive(self, x: int, y: int, expected: int) -> None:
        """Тест 1: x > 0 и y > 0"""
        result: int = calculate(x, y)
        assert result == expected, f"calculate({x}, {y}) = {result}, ожидалось {expected}"

    @pytest.mark.parametrize("x,y,expected", [(5, -3, 8), (10, 0, 10), (7, -2, 9)])
    def test_positive_non_positive(self, x: int, y: int, expected: int) -> None:
        """Тест 2: x > 0 и y <= 0"""
        result: int = calculate(x, y)
        assert result == expected

    @pytest.mark.parametrize("x,y,expected", [(-5, 3, 8), (0, 7, 7), (-2, 5, 7)])
    def test_non_positive_positive(self, x: int, y: int, expected: int) -> None:
        """Тест 3: x <= 0 и y > 0"""
        result: int = calculate(x, y)
        assert result == expected

    @pytest.mark.parametrize("x,y,expected", [(-5, -3, 8), (0, 0, 0), (-2, -4, 6)])
    def test_non_positive_non_positive(self, x: int, y: int, expected: int) -> None:
        """Тест 4: x <= 0 и y <= 0"""
        result: int = calculate(x, y)
        assert result == expected

    @pytest.mark.parametrize("x,y,expected", [(0, 5, 5), (0, -5, 5), (1, 0, 1), (-1, 0, 1)])
    def test_boundary_values(self, x: int, y: int, expected: int) -> None:
        """Тест граничных значений"""
        result: int = calculate(x, y)
        assert result == expected

    def test_with_typed_collections(self) -> None:
        """Тест с типизированными коллекциями"""
        test_cases: List[Tuple[int, int, int]] = [
            (2, 3, 5),
            (-1, -2, 3),
            (0, 0, 0)
        ]
        for x, y, expected in test_cases:
            result: int = calculate(x, y)
            assert result == expected

    @pytest.mark.parametrize("test_data", [
        {"case": (1, 1, 2), "description": "simple positive"},
        {"case": (-1, -1, 2), "description": "simple negative"}
    ])

    def test_with_complex_data(self, test_data: Dict[str, Any]) -> None:
        """Тест со сложными структурами данных"""
        case: Tuple[int, int, int] = test_data["case"]
        x, y, expected = case
        result: int = calculate(x, y)
        assert result == expected

    @pytest.mark.slow
    def test_performance_with_large_lists(self) -> None:
        """Тест производительности с большими списками"""
        large_test_cases: List[Tuple[int, int, int]] = [
            (i, j, calculate(i, j)) for i in range(-10, 11) for j in range(-10, 11)
        ]
        for x, y, expected in large_test_cases:
            result: int = calculate(x, y)
            assert result == expected


class TestFuncWhiteBox:
    """Тестирование белого ящика для функции func(a, b, x)"""

    @pytest.mark.parametrize("a,b,x,expected", [
        (8, 5, 2, 22),
        (10, 3, 1, 2),
        (1, 4, 1, 1),
    ])
    def test_statement_coverage(self, a: int, b: int, x: int, expected: int) -> None:
        """Покрытие всех операторов функции func"""
        result: int = func(a, b, x)
        assert result == expected

    @pytest.mark.parametrize("a,b,x,expected", [
        (8, 5, 1, 14),
        (8, 4, 1, 2),
        (3, 4, 1, 2),
        (1, 4, 10, 11),
        (1, 4, 1, 1),
    ])
    def test_decision_coverage(self, a: int, b: int, x: int, expected: int) -> None:
        """Покрытие всех решений (ветвей)"""
        result: int = func(a, b, x)
        assert result == expected

    @pytest.mark.parametrize("a,b,x,expected", [
        (8, 5, 1, 14),
        (9, 5, 1, 2), 
        (8, 5, 1, 14),
        (8, 4, 1, 2),
        (3, 4, 1, 2),
        (2, 4, 1, 1),
        (1, 4, 7, 8),
        (1, 4, 6, 6),
    ])
    def test_boundary_values(self, a: int, b: int, x: int, expected: int) -> None:
        """Тестирование граничных значений"""
        result: int = func(a, b, x)
        assert result == expected

    @pytest.mark.parametrize("a,b,x,expected,description", [
        (8, 5, 2, 22),
        (10, 3, 1, 2),
        (1, 5, 2, 8),
        (1, 4, 1, 1),
    ])
    def test_combination_coverage(self, a: int, b: int, x: int, expected: int, description: str) -> None:
        """Комбинаторное покрытие основных сценариев"""
        result: int = func(a, b, x)
        assert result == expected, f"Ошибка для {description}: func({a}, {b}, {x}) = {result}, ожидалось {expected}"

    def test_path_coverage(self) -> None:
        """Покрытие различных путей выполнения"""
        assert func(8, 5, 2) == 22
        assert func(10, 3, 1) == 2
        assert func(1, 5, 2) == 8
        assert func(1, 4, 1) == 1
