<#
.SYNOPSIS
    Build and test C++ project
.DESCRIPTION
    Compiles C++ source files and runs unit tests
.PARAMETER Compiler
    Compiler to use (clang++, g++, cl)
.PARAMETER Standard  
    C++ standard version
.PARAMETER Output
    Output executable name
.PARAMETER Clean
    Clean build artifacts before compiling
#>

param(
    [string]$Compiler = "clang++",
    [string]$Standard = "c++17",
    [string]$Output = "test_simple.exe",
    [switch]$Clean
)

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Test-Compiler {
    <#
    .SYNOPSIS
        Tests if compiler is available
    #>
    try {
        $version = & $Compiler --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "Compiler $Compiler found" "Green"
            Write-Host "   $($version[0])" -ForegroundColor Gray
            return $true
        }
    }
    catch {
        return $false
    }
    return $false
}

function Invoke-ProjectBuild {
    <#
    .SYNOPSIS
        Builds the C++ project
    #>
    Write-ColorOutput "Compiling C++ project..." "Cyan"
    
    $sourceFiles = @("function.cpp", "test_simple.cpp")
    $missingFiles = @()
    
    foreach ($file in $sourceFiles) {
        if (-not (Test-Path $file)) {
            $missingFiles += $file
        }
    }
    
    if ($missingFiles.Count -gt 0) {
        Write-ColorOutput "Missing files: $($missingFiles -join ', ')" "Red"
        return $false
    }
    
    $compileCommand = "$Compiler -std=$Standard -O2 -Wall -Wextra $($sourceFiles -join ' ') -o $Output"
    Write-Host "Command: $compileCommand" -ForegroundColor Gray
    
    Invoke-Expression $compileCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "Compilation successful!" "Green"
        return $true
    }
    else {
        Write-ColorOutput "Compilation failed!" "Red"
        return $false
    }
}

function Invoke-TestRun {
    <#
    .SYNOPSIS
        Runs the test executable
    #>
    Write-ColorOutput "Running tests..." "Yellow"
    
    if (-not (Test-Path $Output)) {
        Write-ColorOutput "Executable not found: $Output" "Red"
        return $false
    }
    
    & ".\$Output"
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "All tests passed!" "Green"
        return $true
    }
    else {
        Write-ColorOutput "Some tests failed!" "Red"
        return $false
    }
}

function Clear-BuildArtifacts {
    <#
    .SYNOPSIS
        Cleans build artifacts
    #>
    Write-ColorOutput "Cleaning build artifacts..." "Magenta"
    
    $filesToRemove = @("*.exe", "*.o", "*.obj", "test_simple")
    foreach ($pattern in $filesToRemove) {
        Get-ChildItem -Path . -Filter $pattern -ErrorAction SilentlyContinue | Remove-Item -Force
    }
    
    Write-ColorOutput "Clean completed" "Green"
}

function Start-BuildProcess {
    <#
    .SYNOPSIS
        Main build and test process
    #>
    Write-ColorOutput "=== C++ Test Automation ===" "Cyan"
    Write-Host "Compiler: $Compiler" -ForegroundColor Gray
    Write-Host "C++ Standard: $Standard" -ForegroundColor Gray
    Write-Host "Output: $Output" -ForegroundColor Gray
    
    if ($Clean) {
        Clear-BuildArtifacts
        return
    }
    
    if (-not (Test-Compiler $Compiler)) {
        Write-ColorOutput "Compiler $Compiler not found!" "Red"
        Write-Host "Make sure compiler is installed and in PATH" -ForegroundColor Yellow
        return
    }
    
    if (Invoke-ProjectBuild) {
        Invoke-TestRun
    }
}

# Start the main process
Start-BuildProcess