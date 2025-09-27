#!/usr/bin/env node

/**
 * Test FIT file upload through the B2 ingest API
 * Tests the complete workflow: upload -> parse -> store
 */

const fs = require('fs');
const path = require('path');

async function testFitUpload() {
  try {
    console.log('🏃 Testing FIT file upload...');
    
    // Use the test FIT file
    const testFilePath = 'lib/fit-parser/test/data/Activity.fit';
    
    if (!fs.existsSync(testFilePath)) {
      console.error(`❌ Test file not found: ${testFilePath}`);
      return;
    }
    
    // Read the file
    const fileBuffer = fs.readFileSync(testFilePath);
    const fileStats = fs.statSync(testFilePath);
    
    console.log(`📁 Test file: ${testFilePath}`);
    console.log(`📊 File size: ${fileStats.size} bytes`);
    
    // Create FormData for upload
    const FormData = require('form-data');
    const form = new FormData();
    
    // Create a blob from the buffer
    form.append('file', fileBuffer, {
      filename: 'test-activity.fit',
      contentType: 'application/octet-stream'
    });
    
    console.log('📡 Uploading FIT file to /api/ingest/workout...');
    
    // Make the request
    const fetch = require('node-fetch');
    const response = await fetch('http://localhost:3000/api/ingest/workout', {
      method: 'POST',
      headers: {
        'X-Athlete-Id': '00000000-0000-0000-0000-000000000001',
        ...form.getHeaders()
      },
      body: form
    });
    
    const responseData = await response.json();
    
    if (response.ok) {
      console.log('✅ Upload successful!');
      console.log(`📋 Response:`, responseData);
      
      if (responseData.ingest_id) {
        console.log(`🔗 Ingest ID: ${responseData.ingest_id}`);
        console.log('📅 Check the calendar for the newly imported workout');
      }
    } else {
      console.error('❌ Upload failed');
      console.error(`Status: ${response.status}`);
      console.error('Response:', responseData);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Make sure the development server is running (npm run dev)');
  }
}

// Run the test
if (require.main === module) {
  testFitUpload();
}

module.exports = { testFitUpload };
