from typing import Any, Tuple, List, Union, Dict
from function import calculate, func
import pytest

class TestCalculateFunctionParametrized:
    """Параметризованные тесты для функции calculate"""

    @pytest.mark.parametrize("x, y, expected", [
        (5, 3, 8),
        (10, 7, 17),
        (1, 1, 2),
        (5, -3, 8),
        (10, 0, 10),
        (7, -2, 9),
        (-5, 3, 8),
        (0, 7, 7),
        (-2, 5, 7),
        (-5, -3, 8),
        (0, 0, 0),
        (-2, -4, 6),
    ])
    def test_all_conditions(self, x: int, y: int, expected: int) -> None:
        """Параметризованный тест всех условий"""
        result: int = calculate(x, y)
        assert result == expected, f"calculate({x}, {y}) = {result}, ожидалось {expected}"

    @pytest.mark.parametrize("x, y, expected", [
        (0, 5, 5),
        (0, -5, 5),
        (1, 0, 1),
        (-1, 0, 1),
        (0, 0, 0),
    ])
    def test_boundary_values(self, x: int, y: int, expected: int) -> None:
        """Тест граничных значений"""
        result: int = calculate(x, y)
        assert result == expected

    @pytest.mark.parametrize("x, y, expected, condition", [
        (1, 1, 2),
        (1, -1, 2),
        (-1, 1, 2),
        (-1, -1, 2),
    ])
    def test_decision_coverage_with_expected(self, x: int, y: int, expected: int, condition: str) -> None:
        """Тест покрытия всех решений с проверкой ожидаемого результата"""
        result: int = calculate(x, y)
        assert result == expected, f"Для {condition}: calculate({x}, {y}) = {result}, ожидалось {expected}"
        assert isinstance(
            result, int), f"Результат должен быть целым числом для {condition}"

    @pytest.mark.parametrize("x, y", [
        (100, 50),
        (-100, -50),
        (999, -999),
    ])
    def test_large_numbers(self, x: int, y: int) -> None:
        """Тест с большими числами"""
        result: int = calculate(x, y)
        expected: int = self._calculate_expected(x, y)
        assert result == expected, f"calculate({x}, {y}) = {result}, ожидалось {expected}"

    def _calculate_expected(self, x: int, y: int) -> int:
        """Вспомогательный метод для расчета ожидаемого результата"""
        if x > 0 and y > 0:
            return x + y
        elif x > 0 and y <= 0:
            return x - y
        elif x <= 0 and y > 0:
            return -x + y
        else:
            return -x - y

    @pytest.mark.parametrize("test_data", [
        {"x": 5, "y": 3, "expected": 8},
        {"x": -2, "y": -4, "expected": 6},
    ])
    def test_with_dict_data(self, test_data: Dict[str, Any]) -> None:
        """Тест с данными в словаре (используем Any для гибкости)"""
        result: int = calculate(test_data["x"], test_data["y"])
        assert result == test_data["expected"]

    def test_with_tuple_list(self) -> None:
        """Тест с использованием типизированных коллекций"""
        test_cases: List[Tuple[int, int, int]] = [
            (2, 3, 5),
            (-1, -1, 2),
            (0, 5, 5),
        ]

        for x, y, expected in test_cases:
            result: int = calculate(x, y)
            assert result == expected

    def test_return_type(self) -> None:
        """Тест типа возвращаемого значения"""
        result: Union[int, float] = calculate(1, 2)
        assert isinstance(result, (int, float))


class TestFuncWhiteBoxParametrized:
    """Параметризованные тесты белого ящика для функции func"""

    @pytest.mark.parametrize("a, b, x, expected, test_type", [
        (8, 5, 2, 22),
        (10, 3, 1, 2),
        (1, 4, 1, 1),
        (8, 5, 1, 14),
        (8, 4, 1, 2),
        (3, 4, 1, 2),
        (1, 4, 10, 11),
        (1, 4, 1, 1),
        (8, 5, 1, 14),
        (9, 5, 1, 2),
        (8, 5, 1, 14),
        (8, 4, 1, 2),
        (3, 4, 1, 2),
        (2, 4, 1, 1),
        (1, 4, 7, 8),
        (1, 4, 6, 6),
        (8, 5, 2, 22),
        (10, 3, 1, 2),
        (1, 5, 2, 8),
        (1, 4, 1, 1),
    ])
    def test_func_comprehensive(self, a: int, b: int, x: int, expected: int, test_type: str) -> None:
        """Комплексные параметризованные тесты белого ящика"""
        result: int = func(a, b, x)
        assert result == expected, f"func({a}, {b}, {x}) = {result}, ожидалось {expected} (тип теста: {test_type})"

    @pytest.mark.parametrize("a, b, x, expected_path", [
        (8, 5, 2, "блок1→блок2"),
        (10, 3, 1, "блок2"),
        (1, 5, 2, "блок1→блок2 (x>6)"),
        (1, 4, 1, "нет блоков"),
    ])
    def test_path_coverage_parametrized(self, a: int, b: int, x: int, expected_path: str) -> None:
        """Параметризованное покрытие путей выполнения"""
        original_x = x
        result: int = func(a, b, x)

        if expected_path == "блок1→блок2":
            assert result == x * a + b + 1
        elif expected_path == "блок2":
            assert result == original_x + 1
        elif expected_path == "блок1→блок2 (x>6)":
            assert result == x * a + b + 1
        elif expected_path == "нет блоков":
            assert result == original_x

    @pytest.mark.parametrize("test_scenario", [
        {
            "a": 8, "b": 5, "x": 2,
            "expected": 22,
        },
        {
            "a": 1, "b": 5, "x": 10,
            "expected": 16,
        },
    ])
    def test_scenario_based(self, test_scenario: Dict[str, Any]) -> None:
        """Сценарные тесты с комплексными данными"""
        a_val: int = test_scenario["a"]
        b_val: int = test_scenario["b"]
        x_val: int = test_scenario["x"]
        expected_val: int = test_scenario["expected"]

        result: int = func(a_val, b_val, x_val)
        assert result == expected_val, \
            f"Сценарий '{test_scenario['description']}': func({a_val}, {b_val}, {x_val}) = {result}, ожидалось {expected_val}"
