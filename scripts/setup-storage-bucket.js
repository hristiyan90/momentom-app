const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorageBucket() {
  try {
    console.log('🔄 Setting up workout-uploads storage bucket...');
    
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      return;
    }
    
    const existingBucket = buckets.find(bucket => bucket.name === 'workout-uploads');
    
    if (existingBucket) {
      console.log('✅ Bucket "workout-uploads" already exists');
      return;
    }
    
    // Create the bucket
    const { data, error } = await supabase.storage.createBucket('workout-uploads', {
      public: false,
      fileSizeLimit: 26214400, // 25MB in bytes
      allowedMimeTypes: ['application/xml', 'application/gpx+xml', 'text/xml'],
      allowedFileExtensions: ['.tcx', '.gpx']
    });
    
    if (error) {
      console.error('❌ Error creating bucket:', error.message);
      return;
    }
    
    console.log('✅ Successfully created workout-uploads bucket');
    console.log('📋 Bucket configuration:');
    console.log('   - Max file size: 25MB');
    console.log('   - Allowed types: .tcx, .gpx');
    console.log('   - MIME types: application/xml, application/gpx+xml, text/xml');
    console.log('   - Public: false (server-only access)');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

setupStorageBucket();
