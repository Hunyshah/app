/**
 * Test script to test the message endpoint with business data
 * 
 * Usage:
 * 1. Make sure your Next.js server is running (npm run dev)
 * 2. Get your auth token (from login or stored in your app)
 * 3. Update the variables below with your actual values
 * 4. Run: node scripts/testMessageEndpoint.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_ENDPOINT = `${BASE_URL}/api/conversation/message`;

// TODO: Update these with your actual values
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'YOUR_AUTH_TOKEN_HERE';
const BUSINESS_DATA_ID = process.env.BUSINESS_DATA_ID || '690ccb52c9658c7a2f9cd726';
const CONVERSATION_ID = process.env.CONVERSATION_ID || '690ccb6ec9658c7a2f9cd767';

// Test payload
const testPayload = {
  message: "can you tell me about my pdf ??and why you dont read it ??and tell me what kindly of pdf you read",
  type: "user",
  conversationId: CONVERSATION_ID,
  businessDataId: BUSINESS_DATA_ID
};

async function testMessageEndpoint() {
  console.log('=== TESTING MESSAGE ENDPOINT ===');
  console.log('Endpoint:', API_ENDPOINT);
  console.log('Business Data ID:', BUSINESS_DATA_ID);
  console.log('Conversation ID:', CONVERSATION_ID);
  console.log('Payload:', JSON.stringify(testPayload, null, 2));
  console.log('\n');

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify(testPayload)
    });

    console.log('Response Status:', response.status, response.statusText);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('\n');

    const data = await response.json();
    console.log('Response Data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Request successful!');
      if (data.messages && data.messages.length > 0) {
        console.log('\nAI Response:');
        const aiMessage = data.messages.find(m => m.type === 'ai');
        if (aiMessage) {
          console.log(aiMessage.message);
        }
      }
    } else {
      console.log('\n❌ Request failed!');
      console.log('Error:', data.message || data.error);
    }
  } catch (error) {
    console.error('\n❌ Error making request:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }
}

// Run the test
testMessageEndpoint();

