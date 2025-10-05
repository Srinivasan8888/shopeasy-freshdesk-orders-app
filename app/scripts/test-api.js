// Simple test to verify API connectivity without iparams
async function testApiDirectly() {
  const testApiUrl = 'https://mocki.io/v1/45a7b766-fdb4-4aac-974a-10b3d5720030';
  const testEmail = 'srinivasan.2021@vitalum.ac.in';
  
  console.log('Testing API directly...');
  console.log('API URL:', testApiUrl);
  console.log('Test email:', testEmail);
  
  try {
    const response = await fetch(testApiUrl);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Raw API data:', data);
    console.log('Data type:', typeof data);
    console.log('Is array:', Array.isArray(data));
    
    if (Array.isArray(data)) {
      const filteredOrders = data.filter(order => 
        order.customer_email && order.customer_email.toLowerCase() === testEmail.toLowerCase()
      );
      console.log(`Found ${filteredOrders.length} orders for ${testEmail}`);
      console.log('Sample orders:', filteredOrders.slice(0, 2));
    }
    
    return data;
  } catch (error) {
    console.error('Direct API test failed:', error);
    throw error;
  }
}

// Add this to window so we can call it from console
window.testApiDirectly = testApiDirectly;