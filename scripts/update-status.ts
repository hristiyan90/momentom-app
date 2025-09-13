#!/usr/bin/env tsx

/**
 * Status Sync Tool
 * 
 * Reads docs/process/STATUS.md and syncs it to all files containing
 * <!--STATUS:BEGIN--> and <!--STATUS:END--> markers.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const STATUS_FILE = 'docs/process/STATUS.md';
const MARKER_BEGIN = '<!--STATUS:BEGIN-->';
const MARKER_END = '<!--STATUS:END-->';

interface FileUpdate {
  path: string;
  content: string;
  updated: boolean;
}

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

function updateFileContent(filePath: string, statusContent: string): FileUpdate {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    const beginIndex = content.indexOf(MARKER_BEGIN);
    const endIndex = content.indexOf(MARKER_END);
    
    if (beginIndex === -1 || endIndex === -1) {
      return { path: filePath, content, updated: false };
    }
    
    if (beginIndex >= endIndex) {
      console.warn(`⚠️  Invalid markers in ${filePath}`);
      return { path: filePath, content, updated: false };
    }
    
    const before = content.substring(0, beginIndex + MARKER_BEGIN.length);
    const after = content.substring(endIndex);
    
    const newContent = before + '\n' + statusContent + '\n' + after;
    
    return {
      path: filePath,
      content: newContent,
      updated: content !== newContent
    };
  } catch (error) {
    console.error(`❌ Failed to read ${filePath}:`, error);
    return { path: filePath, content: '', updated: false };
  }
}

function main() {
  console.log('🔄 Status Sync Tool');
  console.log(`📖 Reading status from ${STATUS_FILE}`);
  
  const statusContent = readStatusContent();
  console.log(`✅ Status content loaded (${statusContent.length} chars)`);
  
  // Find all markdown files
  const markdownFiles = [
    'README.md',
    ...findMarkdownFiles('docs')
  ];
  
  console.log(`🔍 Found ${markdownFiles.length} markdown files to check`);
  
  const updates: FileUpdate[] = [];
  
  for (const filePath of markdownFiles) {
    const update = updateFileContent(filePath, statusContent);
    updates.push(update);
    
    if (update.updated) {
      console.log(`📝 Would update ${filePath}`);
    }
  }
  
  const filesToUpdate = updates.filter(u => u.updated);
  
  if (filesToUpdate.length === 0) {
    console.log('✅ All files are already up to date');
    return;
  }
  
  console.log(`\n📝 Updating ${filesToUpdate.length} files:`);
  
  for (const update of filesToUpdate) {
    writeFileSync(update.path, update.content, 'utf-8');
    console.log(`✅ Updated ${update.path}`);
  }
  
  console.log('\n🎉 Status sync complete!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
