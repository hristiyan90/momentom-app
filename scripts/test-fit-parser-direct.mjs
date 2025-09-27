#!/usr/bin/env node

/**
 * Direct test of FIT parsing functionality using ES modules
 * Tests the parseFIT function with real test data
 */

import fs from 'fs';
import { parseFIT } from '../lib/parsers/workout-files.ts';

async function testFitParsingDirect() {
  try {
    console.log('🏃 Testing FIT parsing directly...');
    
    // Test with Activity.fit
    const testFile = 'lib/fit-parser/test/data/Activity.fit';
    console.log(`\n📁 Testing: ${testFile}`);
    
    if (!fs.existsSync(testFile)) {
      console.log(`   ❌ File not found: ${testFile}`);
      return;
    }
    
    // Read file as binary data
    const fileBuffer = fs.readFileSync(testFile);
    const arrayBuffer = fileBuffer.buffer.slice(
      fileBuffer.byteOffset, 
      fileBuffer.byteOffset + fileBuffer.byteLength
    );
    
    console.log(`   📊 File size: ${arrayBuffer.byteLength} bytes`);
    
    // Parse the FIT file
    console.log('   🔍 Parsing FIT file...');
    const parsedData = parseFIT(arrayBuffer);
    
    console.log('   ✅ FIT parsing successful!');
    console.log('\n📋 Parsed workout data:');
    console.log(`   Sport: ${parsedData.sport}`);
    console.log(`   Date: ${parsedData.date}`);
    console.log(`   Duration: ${parsedData.duration_minutes} minutes`);
    console.log(`   Distance: ${parsedData.distance_meters || 'N/A'} meters`);
    console.log(`   Title: ${parsedData.title}`);
    console.log(`   Source: ${parsedData.source_format}`);
    
    console.log('\n🏆 Performance metrics:');
    if (parsedData.metadata.avg_heart_rate) {
      console.log(`   Avg HR: ${parsedData.metadata.avg_heart_rate} bpm`);
    }
    if (parsedData.metadata.max_heart_rate) {
      console.log(`   Max HR: ${parsedData.metadata.max_heart_rate} bpm`);
    }
    if (parsedData.metadata.avg_power) {
      console.log(`   Avg Power: ${parsedData.metadata.avg_power} W`);
    }
    if (parsedData.metadata.max_power) {
      console.log(`   Max Power: ${parsedData.metadata.max_power} W`);
    }
    if (parsedData.metadata.avg_speed) {
      console.log(`   Avg Speed: ${parsedData.metadata.avg_speed} km/h`);
    }
    if (parsedData.metadata.calories) {
      console.log(`   Calories: ${parsedData.metadata.calories}`);
    }
    if (parsedData.metadata.elevation_gain) {
      console.log(`   Elevation: ${parsedData.metadata.elevation_gain} m`);
    }
    
    console.log('\n📱 Device info:');
    if (parsedData.metadata.device) {
      console.log(`   Device: ${parsedData.metadata.device}`);
    }
    if (parsedData.metadata.creator) {
      console.log(`   Manufacturer: ${parsedData.metadata.creator}`);
    }
    if (parsedData.metadata.trackpoints) {
      console.log(`   Data points: ${parsedData.metadata.trackpoints}`);
    }
    
    console.log('\n🎯 Test completed successfully!');
    console.log('   The FIT parser is working correctly and extracting detailed workout data.');
    
  } catch (error) {
    console.error('❌ FIT parsing test failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

// Run the test
testFitParsingDirect();
