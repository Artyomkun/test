package main

import "testing"

func Test(t *testing.T) {
    tests := []struct {
        name           string
        a, b, x        int
        expected       int
    }{
        {8, 5, 1, 14},
        {1, 5, 10, 16},
        {1, 5, 0, 5},
        {5, 1, 1, 2},
        {1, 1, 10, 11},
        {1, 1, 1, 1}, 
        {8, 5, 2, 22},
        {9, 5, 2, 3},
        {2, 5, 3, 12},
        {3, 5, 2, 12},
        {5, 1, 5, 6},
        {5, 1, 6, 7},
        {5, 1, 7, 8},
        {1, 1, 5, 5},
        {1, 1, 6, 6},
        {1, 1, 7, 8},
        {8, 5, 6, 54},
        {9, 1, 6, 7},
        {2, 5, 7, 20},
        {0, 5, 2, 5},
        {5, 1, 0, 1},
        {-1, 5, 3, 2},
        {5, 1, -10, -9},
    }

    for _, test := range tests {
        t.Run(test.name, func(t *testing.T) {
            result := myFunc(test.a, test.b, test.x)
            if result != test.expected {
                t.Errorf("myFunc(%d, %d, %d) = %d, expected %d", 
                    test.a, test.b, test.x, result, test.expected)
            }
        })
    }
}