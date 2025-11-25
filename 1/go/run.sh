#!/bin/bash
echo "=== Testing Go ==="
go run calculator.go
echo ""
echo "Running tests..."
go test -v