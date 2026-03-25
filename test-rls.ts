import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env['SUPABASE_URL'];
const supabaseKey = process.env['SUPABASE_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRLS() {
  console.log('--- Testing RLS Security ---');
  
  // 1. Try to INSERT
  console.log('\n1. Attempting to INSERT a row with anon key...');
  const { data: insertData, error: insertError } = await supabase
    .from('sensor_data')
    .insert([{ temperature: 999, status: 'HACK_ATTEMPT' }]);
  
  if (insertError) {
    console.log('✅ INSERT Blocked (Expected):', insertError.message);
  } else {
    console.log('❌ ALERT: INSERT allowed! RLS is not properly configured for INSERT.');
  }

  // 2. Try to DELETE (Attempting to delete ID 1 for test)
  console.log('\n2. Attempting to DELETE a row with anon key...');
  const { data: deleteData, error: deleteError } = await supabase
    .from('sensor_data')
    .delete()
    .eq('id', 1);

  if (deleteError) {
    console.log('✅ DELETE Blocked (Expected):', deleteError.message);
  } else {
    // Note: delete often returns success even if 0 rows matched, as long as the query is valid.
    // However, if RLS is on and no policy allows it, it should either error or affect 0 rows.
    console.log('✅ DELETE Request finished. Check Supabase Dashboard to ensure ID 1 (if existed) remains.');
  }

  // 3. Try to SELECT (Should be allowed)
  console.log('\n3. Attempting to SELECT rows with anon key...');
  const { data: selectData, error: selectError } = await supabase
    .from('sensor_data')
    .select('*')
    .limit(1);

  if (selectError) {
    console.log('❌ SELECT Failed:', selectError.message);
  } else {
    console.log('✅ SELECT Succeeded (Expected): Found', selectData?.length, 'rows.');
  }

  console.log('\n--- Test Finished ---');
}

testRLS();
