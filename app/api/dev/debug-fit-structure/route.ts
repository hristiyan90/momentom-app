import { NextRequest, NextResponse } from 'next/server';
import { Decoder, Stream } from '@/lib/fit-parser/src/index.js';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Debugging FIT file structure...');
    
    // Test with the Activity.fit file
    const testFilePath = path.join(process.cwd(), 'lib/fit-parser/test/data/Activity.fit');
    
    if (!fs.existsSync(testFilePath)) {
      return NextResponse.json(
        { error: 'Test FIT file not found', path: testFilePath },
        { status: 404 }
      );
    }
    
    // Read the test file
    const fileBuffer = fs.readFileSync(testFilePath);
    const arrayBuffer = fileBuffer.buffer.slice(
      fileBuffer.byteOffset, 
      fileBuffer.byteOffset + fileBuffer.byteLength
    );
    
    console.log(`📁 File size: ${arrayBuffer.byteLength} bytes`);
    
    // Create stream and verify it's a FIT file
    const stream = Stream.fromArrayBuffer(arrayBuffer);
    
    if (!Decoder.isFIT(stream)) {
      return NextResponse.json(
        { error: 'Not a valid FIT file' },
        { status: 400 }
      );
    }
    
    // Create decoder and decode
    const decoder = new Decoder(stream);
    const { messages } = decoder.read();
    
    console.log('📋 Available message types:', Object.keys(messages));
    
    // Log details of each message type
    const messageStructure: any = {};
    
    Object.keys(messages).forEach(messageType => {
      const messageArray = messages[messageType];
      messageStructure[messageType] = {
        count: messageArray ? messageArray.length : 0,
        sample: messageArray && messageArray.length > 0 ? messageArray[0] : null
      };
      
      if (messageArray && messageArray.length > 0) {
        console.log(`📄 ${messageType}: ${messageArray.length} messages`);
        console.log(`   Sample:`, JSON.stringify(messageArray[0], null, 2));
      }
    });
    
    return NextResponse.json({
      status: 'success',
      file_info: {
        path: testFilePath,
        size_bytes: arrayBuffer.byteLength
      },
      available_message_types: Object.keys(messages),
      message_structure: messageStructure,
      has_session_messages: !!(messages.sessionMesgs && messages.sessionMesgs.length > 0),
      has_activity_messages: !!(messages.activityMesgs && messages.activityMesgs.length > 0),
      has_record_messages: !!(messages.recordMesgs && messages.recordMesgs.length > 0),
      has_lap_messages: !!(messages.lapMesgs && messages.lapMesgs.length > 0)
    });
    
  } catch (error) {
    console.error('❌ FIT structure debug failed:', error);
    
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
