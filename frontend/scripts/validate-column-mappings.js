#!/usr/bin/env node

/**
 * Validates column mappings between TypeScript services and database schema
 * 
 * This script:
 * 1. Parses the database schema to extract table columns
 * 2. Scans service files for insert/update operations
 * 3. Reports mismatches between code and schema
 * 
 * Usage: node scripts/validate-column-mappings.js
 */

const fs = require('fs');
const path = require('path');

// Parse schema.sql to extract table definitions
function parseSchema(schemaPath) {
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  const tables = {};
  
  // Match CREATE TABLE statements
  const tableRegex = /CREATE TABLE (\w+) \(([\s\S]*?)\);/g;
  let match;
  
  while ((match = tableRegex.exec(schemaContent)) !== null) {
    const tableName = match[1];
    const columns = {};
    
    // Parse columns
    const columnLines = match[2].split('\n').map(line => line.trim()).filter(line => line);
    
    columnLines.forEach(line => {
      // Skip comments and constraints
      if (line.startsWith('--') || line.startsWith('PRIMARY KEY') || 
          line.startsWith('FOREIGN KEY') || line.startsWith('UNIQUE') ||
          line.startsWith('CHECK') || line.startsWith('CREATE INDEX') ||
          line.startsWith('COMMENT')) {
        return;
      }
      
      // Extract column name and properties
      const columnMatch = line.match(/^(\w+)\s+/);
      if (columnMatch) {
        const columnName = columnMatch[1];
        const isNotNull = line.includes('NOT NULL') && !line.includes('DEFAULT');
        const isNullable = !line.includes('NOT NULL') || line.includes('DEFAULT');
        
        columns[columnName] = {
          name: columnName,
          required: isNotNull,
          nullable: isNullable,
          definition: line
        };
      }
    });
    
    tables[tableName] = columns;
  }
  
  return tables;
}

// Extract insert/update operations from service files
function extractOperations(servicePath) {
  const content = fs.readFileSync(servicePath, 'utf8');
  const operations = [];
  
  // Find insert operations
  const insertRegex = /\.insert\(([\s\S]*?)\)/g;
  let match;
  
  while ((match = insertRegex.exec(content)) !== null) {
    const insertCode = match[1];
    const tableMatch = content.substring(0, match.index).match(/\.from\(['"]([\w_]+)['"]\)/);
    if (tableMatch) {
      operations.push({
        type: 'insert',
        table: tableMatch[1],
        code: insertCode,
        line: content.substring(0, match.index).split('\n').length
      });
    }
  }
  
  // Find update operations
  const updateRegex = /\.update\(([\s\S]*?)\)/g;
  while ((match = updateRegex.exec(content)) !== null) {
    const updateCode = match[1];
    const tableMatch = content.substring(0, match.index).match(/\.from\(['"]([\w_]+)['"]\)/);
    if (tableMatch) {
      operations.push({
        type: 'update',
        table: tableMatch[1],
        code: updateCode,
        line: content.substring(0, match.index).split('\n').length
      });
    }
  }
  
  return operations;
}

// Extract column names from code
function extractColumnsFromCode(code) {
  const columns = new Set();
  
  // Match property assignments: column_name: value
  const propertyRegex = /(\w+):\s*[^,}\n]+/g;
  let match;
  
  while ((match = propertyRegex.exec(code)) !== null) {
    columns.add(match[1]);
  }
  
  return Array.from(columns);
}

// Main validation function
function validateMappings() {
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  const servicesPath = path.join(__dirname, '..', 'src', 'app', 'services');
  
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Schema file not found:', schemaPath);
    process.exit(1);
  }
  
  console.log('📋 Parsing database schema...');
  const tables = parseSchema(schemaPath);
  console.log(`✅ Found ${Object.keys(tables).length} tables\n`);
  
  console.log('🔍 Scanning service files...');
  const serviceFiles = fs.readdirSync(servicesPath)
    .filter(file => file.endsWith('.service.ts') && file !== 'base-api.service.ts')
    .map(file => path.join(servicesPath, file));
  
  const issues = [];
  
  serviceFiles.forEach(serviceFile => {
    const fileName = path.basename(serviceFile);
    const operations = extractOperations(serviceFile);
    
    operations.forEach(op => {
      const table = tables[op.table];
      if (!table) {
        issues.push({
          file: fileName,
          line: op.line,
          type: op.type,
          table: op.table,
          issue: `Table '${op.table}' not found in schema`,
          severity: 'error'
        });
        return;
      }
      
      const codeColumns = extractColumnsFromCode(op.code);
      const schemaColumns = Object.keys(table);
      
      // Check for columns in code that don't exist in schema
      codeColumns.forEach(col => {
        if (!schemaColumns.includes(col)) {
          issues.push({
            file: fileName,
            line: op.line,
            type: op.type,
            table: op.table,
            column: col,
            issue: `Column '${col}' does not exist in table '${op.table}'`,
            severity: 'error',
            suggestion: `Check if it should be a different column name (e.g., snake_case vs camelCase)`
          });
        }
      });
      
      // Check for required columns missing from insert
      if (op.type === 'insert') {
        schemaColumns.forEach(col => {
          const columnDef = table[col];
          if (columnDef.required && !codeColumns.includes(col)) {
            // Skip auto-generated columns
            if (col === 'id' || col === 'created_at' || col === 'updated_at') {
              return;
            }
            
            issues.push({
              file: fileName,
              line: op.line,
              type: op.type,
              table: op.table,
              column: col,
              issue: `Required column '${col}' is missing from insert operation`,
              severity: 'error',
              suggestion: `Add '${col}' to the insert data object`
            });
          }
        });
      }
    });
  });
  
  // Report results
  console.log(`\n📊 Validation Results:\n`);
  
  if (issues.length === 0) {
    console.log('✅ No issues found! All column mappings are correct.\n');
    return;
  }
  
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  
  console.log(`❌ Errors: ${errors.length}`);
  console.log(`⚠️  Warnings: ${warnings.length}\n`);
  
  // Group by file
  const byFile = {};
  issues.forEach(issue => {
    if (!byFile[issue.file]) {
      byFile[issue.file] = [];
    }
    byFile[issue.file].push(issue);
  });
  
  Object.keys(byFile).forEach(file => {
    console.log(`\n📄 ${file}:`);
    byFile[file].forEach(issue => {
      const icon = issue.severity === 'error' ? '❌' : '⚠️';
      console.log(`  ${icon} Line ${issue.line} (${issue.type}): ${issue.issue}`);
      if (issue.column) {
        console.log(`     Column: ${issue.column}`);
      }
      if (issue.suggestion) {
        console.log(`     💡 ${issue.suggestion}`);
      }
    });
  });
  
  console.log(`\n📝 Summary: ${errors.length} error(s), ${warnings.length} warning(s)\n`);
  
  if (errors.length > 0) {
    process.exit(1);
  }
}

// Run validation
try {
  validateMappings();
} catch (error) {
  console.error('❌ Validation failed:', error);
  process.exit(1);
}

