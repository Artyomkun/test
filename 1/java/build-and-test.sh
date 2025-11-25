#!/bin/bash

echo "=== Java Test Automation ==="

# Compile and run
echo "Building and running Java project..."
mvn compile exec:java -Dexec.mainClass="Calculator"

echo "Running tests..."
mvn test