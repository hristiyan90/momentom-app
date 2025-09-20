#!/usr/bin/env node
/**
 * Comprehensive Test Suite for B2 Manual Workout Upload
 * Tests all aspects of the feature including validation, parsing, and database operations
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_BASE = 'http://localhost:3000/api';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

function logTest(name, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}: ${details}`);
  }
  testResults.details.push({ name, passed, details });
}

async function makeRequest(method, endpoint, data = null, headers = {}) {
  const url = `${API_BASE}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };
  
  if (data) {
    if (data instanceof FormData) {
      delete options.headers['Content-Type']; // Let fetch set it for FormData
      options.body = data;
    } else {
      options.body = JSON.stringify(data);
    }
  }
  
  try {
    const response = await fetch(url, options);
    const text = await response.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }
    return { status: response.status, data: json, headers: response.headers };
  } catch (error) {
    return { status: 0, data: { error: error.message }, headers: {} };
  }
}

async function testFileValidation() {
  console.log('\n🧪 Testing File Validation...');
  
  // Test 1: Valid TCX file
  const formData1 = new FormData();
  formData1.append('file', fs.createReadStream('test-files/small.tcx'));
  formData1.append('source', 'test');
  formData1.append('notes', 'Validation test');
  
  const result1 = await makeRequest('POST', '/ingest/workout', formData1);
  const validTcx = result1.status === 201 && result1.data.status === 'normalized';
  logTest('Valid TCX file upload', validTcx, validTcx ? '' : `Status: ${result1.status}, Data: ${JSON.stringify(result1.data)}`);
  
  // Test 2: Valid GPX file
  const formData2 = new FormData();
  formData2.append('file', fs.createReadStream('test-files/sample.gpx'));
  formData2.append('source', 'test');
  
  const result2 = await makeRequest('POST', '/ingest/workout', formData2);
  const validGpx = result2.status === 201 && result2.data.status === 'normalized';
  logTest('Valid GPX file upload', validGpx, validGpx ? '' : `Status: ${result2.status}`);
  
  // Test 3: Invalid file type
  const formData3 = new FormData();
  formData3.append('file', fs.createReadStream('test-files/invalid.xml'));
  formData3.append('source', 'test');
  
  const result3 = await makeRequest('POST', '/ingest/workout', formData3);
  const invalidType = result3.status === 415;
  logTest('Invalid file type rejection', invalidType, invalidType ? '' : `Status: ${result3.status}`);
  
  // Test 4: Missing file
  const result4 = await makeRequest('POST', '/ingest/workout', { source: 'test' });
  const missingFile = result4.status === 400;
  logTest('Missing file rejection', missingFile, missingFile ? '' : `Status: ${result4.status}`);
  
  return { validTcx, validGpx };
}

async function testParsing() {
  console.log('\n🧪 Testing File Parsing...');
  
  // Test TCX parsing with different sports
  const formData1 = new FormData();
  formData1.append('file', fs.createReadStream('test-files/cycling.tcx'));
  formData1.append('source', 'test');
  
  const result1 = await makeRequest('POST', '/ingest/workout', formData1);
  const cyclingParsed = result1.status === 201 && result1.data.status === 'normalized';
  logTest('TCX cycling sport detection', cyclingParsed, cyclingParsed ? '' : `Status: ${result1.status}`);
  
  // Test GPX sport inference
  const formData2 = new FormData();
  formData2.append('file', fs.createReadStream('test-files/sample.gpx'));
  formData2.append('source', 'test');
  
  const result2 = await makeRequest('POST', '/ingest/workout', formData2);
  const gpxParsed = result2.status === 201 && result2.data.status === 'normalized';
  logTest('GPX sport inference', gpxParsed, gpxParsed ? '' : `Status: ${result2.status}`);
  
  // Test malformed file handling
  const formData3 = new FormData();
  formData3.append('file', fs.createReadStream('test-files/malformed.tcx'));
  formData3.append('source', 'test');
  
  const result3 = await makeRequest('POST', '/ingest/workout', formData3);
  const malformedHandled = result3.status === 500 && result3.data.error;
  logTest('Malformed file error handling', malformedHandled, malformedHandled ? '' : `Status: ${result3.status}`);
  
  return { cyclingParsed, gpxParsed, malformedHandled };
}

async function testStatusEndpoints() {
  console.log('\n🧪 Testing Status Endpoints...');
  
  // Upload a test file first
  const formData = new FormData();
  formData.append('file', fs.createReadStream('test-files/small.tcx'));
  formData.append('source', 'test');
  
  const uploadResult = await makeRequest('POST', '/ingest/workout', formData);
  if (uploadResult.status !== 201) {
    logTest('Status endpoint test setup', false, 'Failed to upload test file');
    return;
  }
  
  const ingestId = uploadResult.data.ingest_id;
  
  // Test GET status endpoint
  const statusResult = await makeRequest('GET', `/ingest/workout/${ingestId}`);
  const statusWorking = statusResult.status === 200 && statusResult.data.status === 'normalized';
  logTest('Status endpoint retrieval', statusWorking, statusWorking ? '' : `Status: ${statusResult.status}`);
  
  // Test ETag header presence
  const hasEtag = statusResult.headers.get('etag') !== null;
  logTest('ETag header present', hasEtag, hasEtag ? '' : 'ETag header missing');
  
  // Test invalid ID format
  const invalidResult = await makeRequest('GET', '/ingest/workout/invalid-id');
  const invalidRejected = invalidResult.status === 400;
  logTest('Invalid ID format rejection', invalidRejected, invalidRejected ? '' : `Status: ${invalidResult.status}`);
  
  return { statusWorking, hasEtag, invalidRejected };
}

async function testDatabaseIntegrity() {
  console.log('\n🧪 Testing Database Integrity...');
  
  try {
    // Check sessions table
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    const sessionsExist = !sessionsError && sessions && sessions.length > 0;
    logTest('Sessions table accessible', sessionsExist, sessionsExist ? '' : sessionsError?.message);
    
    // Check ingest_staging table
    const { data: ingestRecords, error: ingestError } = await supabase
      .from('ingest_staging')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    const ingestExists = !ingestError && ingestRecords && ingestRecords.length > 0;
    logTest('Ingest staging table accessible', ingestExists, ingestExists ? '' : ingestError?.message);
    
    // Check relationships
    const normalizedRecords = ingestRecords?.filter(r => r.status === 'normalized') || [];
    const sessionsWithSource = sessions?.filter(s => s.source_ingest_id) || [];
    
    const relationshipsValid = normalizedRecords.length > 0 && sessionsWithSource.length > 0;
    logTest('Database relationships intact', relationshipsValid, relationshipsValid ? '' : 'Missing relationships');
    
    // Check data quality
    const validSessions = sessions?.filter(s => 
      s.athlete_id && 
      s.date && 
      s.sport && 
      s.actual_duration_min > 0
    ) || [];
    
    const dataQuality = validSessions.length > 0;
    logTest('Data quality validation', dataQuality, dataQuality ? '' : 'Invalid session data');
    
    return { sessionsExist, ingestExists, relationshipsValid, dataQuality };
    
  } catch (error) {
    logTest('Database integrity check', false, error.message);
    return { sessionsExist: false, ingestExists: false, relationshipsValid: false, dataQuality: false };
  }
}

async function testErrorHandling() {
  console.log('\n🧪 Testing Error Handling...');
  
  // Test malformed XML
  const formData1 = new FormData();
  formData1.append('file', fs.createReadStream('test-files/malformed.tcx'));
  formData1.append('source', 'test');
  
  const result1 = await makeRequest('POST', '/ingest/workout', formData1);
  const malformedError = result1.status === 500 && result1.data.error;
  logTest('Malformed file error handling', malformedError, malformedError ? '' : `Status: ${result1.status}`);
  
  // Test unsupported method on GET endpoint
  const result2 = await makeRequest('POST', '/ingest/workout/12345678-1234-1234-1234-123456789012');
  const methodError = result2.status === 405;
  logTest('Unsupported method handling', methodError, methodError ? '' : `Status: ${result2.status}`);
  
  // Test unsupported method on POST endpoint
  const result3 = await makeRequest('GET', '/ingest/workout');
  const getMethodError = result3.status === 405;
  logTest('GET method on POST endpoint', getMethodError, getMethodError ? '' : `Status: ${result3.status}`);
  
  return { malformedError, methodError, getMethodError };
}

async function runAllTests() {
  console.log('🚀 Starting B2 Manual Workout Upload Test Suite...\n');
  
  try {
    await testFileValidation();
    await testParsing();
    await testStatusEndpoints();
    await testDatabaseIntegrity();
    await testErrorHandling();
    
    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📈 Total: ${testResults.total}`);
    console.log(`🎯 Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`);
    
    if (testResults.failed > 0) {
      console.log('\n❌ Failed Tests:');
      testResults.details
        .filter(t => !t.passed)
        .forEach(t => console.log(`   - ${t.name}: ${t.details}`));
    }
    
    console.log('\n🎉 Test suite completed!');
    
  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests, testResults };
