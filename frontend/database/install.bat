@echo off
REM =====================================================
REM TheButler Database Installation Script (Windows)
REM =====================================================

setlocal enabledelayedexpansion

REM Default values
set DB_NAME=thebutler
set DB_USER=postgres
set DB_HOST=localhost
set DB_PORT=5432

REM Parse command line arguments
:parse_args
if "%~1"=="" goto end_parse
if "%~1"=="--db-name" (
    set DB_NAME=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="--db-user" (
    set DB_USER=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="--db-host" (
    set DB_HOST=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="--db-port" (
    set DB_PORT=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="--help" (
    echo Usage: install.bat [options]
    echo.
    echo Options:
    echo   --db-name NAME    Database name ^(default: thebutler^)
    echo   --db-user USER    Database user ^(default: postgres^)
    echo   --db-host HOST    Database host ^(default: localhost^)
    echo   --db-port PORT    Database port ^(default: 5432^)
    echo   --help            Show this help message
    exit /b 0
)
shift
goto parse_args

:end_parse

echo ========================================================
echo       TheButler Database Installation Script
echo ========================================================
echo.
echo Configuration:
echo   Database: %DB_NAME%
echo   User: %DB_USER%
echo   Host: %DB_HOST%
echo   Port: %DB_PORT%
echo.

REM Check if psql is available
where psql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: psql command not found. Please install PostgreSQL client.
    exit /b 1
)

REM Set PGPASSWORD if needed (user can set this as environment variable)
REM set PGPASSWORD=yourpassword

set PSQL_CMD=psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER%

echo Step 1/5: Checking if database exists...
%PSQL_CMD% -tAc "SELECT 1 FROM pg_database WHERE datname='%DB_NAME%'" > temp_check.txt 2>&1
set /p DB_EXISTS=<temp_check.txt
del temp_check.txt

if "%DB_EXISTS%"=="1" (
    echo WARNING: Database '%DB_NAME%' already exists.
    set /p CONFIRM="Do you want to DROP and recreate it? This will delete all data! (yes/no): "
    if /i "!CONFIRM!"=="yes" (
        echo Dropping existing database...
        %PSQL_CMD% -c "DROP DATABASE IF EXISTS %DB_NAME%;"
        echo [OK] Database dropped
        set DB_EXISTS=0
    ) else (
        echo Using existing database...
    )
)

if "%DB_EXISTS%" NEQ "1" (
    echo Creating database '%DB_NAME%'...
    %PSQL_CMD% -c "CREATE DATABASE %DB_NAME%;"
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to create database
        exit /b 1
    )
    echo [OK] Database created
)

echo.
echo Step 2/4: Installing TheButler application tables (using Supabase Auth)...
%PSQL_CMD% -d %DB_NAME% -f schema.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install application tables
    exit /b 1
)
echo [OK] Application tables installed (32 tables)

echo.
echo Step 3/4: Loading seed data...
%PSQL_CMD% -d %DB_NAME% -f seed-data.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to load seed data
    exit /b 1
)
echo [OK] Seed data loaded

echo.
echo Step 4/4: Verifying installation...
%PSQL_CMD% -d %DB_NAME% -tAc "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public';" > temp_count.txt
set /p TABLE_COUNT=<temp_count.txt
del temp_count.txt
echo   Application tables: %TABLE_COUNT%

echo.
echo ========================================================
echo            Installation completed!
echo ========================================================
echo.
echo Connection string for .NET:
echo Host=%DB_HOST%;Database=%DB_NAME%;Username=%DB_USER%;Password=YOUR_PASSWORD
echo.
echo Next steps:
echo 1. Configure your .NET application with the connection string above
echo 2. Review SUPABASE-GUIDE.md for Supabase Auth setup
echo 3. Review DOTNET-INTEGRATION.md for API development
echo 4. Disable RLS on tables (see SUPABASE-GUIDE.md)
echo.
echo To connect to the database:
echo   psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME%
echo.

endlocal

