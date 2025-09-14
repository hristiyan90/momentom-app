#!/usr/bin/env tsx

/**
 * Status Check Tool
 * 
 * Runs update-status in dry-run mode and checks if any files would be changed.
 * Exits with code 1 if changes would be made (for CI).
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const STATUS_FILE = 'docs/process/STATUS.md';
const MARKER_BEGIN = '<!--STATUS:BEGIN-->';
const MARKER_END = '<!--STATUS:END-->';

function readStatusContent(): string {
  try {
    return readFileSync(STATUS_FILE, 'utf-8');
  } catch (error) {
    console.error(`❌ Failed to read ${STATUS_FILE}:`, error);
    process.exit(1);
  }
}

function findMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  
  try {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and .git
        if (!['node_modules', '.git', '.next', 'out'].includes(entry)) {
          files.push(...findMarkdownFiles(fullPath));
        }
      } else if (extname(entry) === '.md') {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
  
  return files;
}

function checkFileContent(filePath: string, statusContent: string): boolean {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    const beginIndex = content.indexOf(MARKER_BEGIN);
    const endIndex = content.indexOf(MARKER_END);
    
    if (beginIndex === -1 || endIndex === -1) {
      return false; // No markers, no update needed
    }
    
    if (beginIndex >= endIndex) {
      console.warn(`⚠️  Invalid markers in ${filePath}`);
      return false;
    }
    
    const before = content.substring(0, beginIndex + MARKER_BEGIN.length);
    const after = content.substring(endIndex);
    
    const newContent = before + '\n' + statusContent + '\n' + after;
    
    return content !== newContent;
  } catch (error) {
    console.error(`❌ Failed to read ${filePath}:`, error);
    return false;
  }
}

function main() {
  console.log('🔍 Status Check Tool (Dry Run)');
  console.log(`📖 Reading status from ${STATUS_FILE}`);
  
  const statusContent = readStatusContent();
  console.log(`✅ Status content loaded (${statusContent.length} chars)`);
  
  // Find all markdown files
  const markdownFiles = [
    'README.md',
    ...findMarkdownFiles('docs')
  ];
  
  console.log(`🔍 Checking ${markdownFiles.length} markdown files`);
  
  const filesNeedingUpdate: string[] = [];
  
  for (const filePath of markdownFiles) {
    const needsUpdate = checkFileContent(filePath, statusContent);
    
    if (needsUpdate) {
      filesNeedingUpdate.push(filePath);
      console.log(`❌ ${filePath} needs update`);
    } else {
      console.log(`✅ ${filePath} is up to date`);
    }
  }
  
  if (filesNeedingUpdate.length === 0) {
    console.log('\n🎉 All status blocks are up to date!');
    process.exit(0);
  } else {
    console.log(`\n❌ ${filesNeedingUpdate.length} files need status updates:`);
    filesNeedingUpdate.forEach(file => console.log(`  - ${file}`));
    console.log('\n💡 Run `npm run status:update` to fix these files');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
