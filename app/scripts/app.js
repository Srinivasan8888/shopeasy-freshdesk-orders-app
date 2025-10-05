console.log('🚀 Order History App Starting...');

init();

async function init() {
  try {
    console.log('📱 Initializing app...');
    const client = await app.initialized();
    console.log('✅ App initialized successfully');
    
    client.events.on('app.activated', () => {
      console.log('🎯 App activated event fired');
      loadOrderHistory(client);
    });
    
    // Also try to load immediately in case the event already fired
    setTimeout(() => {
      console.log('⏰ Timeout fallback - trying to load order history');
      loadOrderHistory(client);
    }, 1000);
    
  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
    showError('Failed to initialize app: ' + error.message);
  }
}

async function loadOrderHistory(client) {
  try {
    showLoading();
    const contact = await getCustomerContact(client);
    console.log('Customer identified:', contact);
    
    displayCustomerInfo(contact);
    const orders = await getOrdersData(client, contact.email);
    
    if (orders && orders.length > 0) {
      displayOrders(orders);
    } else {
      showNoOrders();
    }
    
  } catch (error) {
    console.error('Error loading order history:', error);
    showError('Failed to load order history: ' + error.message);
  }
}

async function getCustomerContact(client) {
  const methods = [
    () => client.data.get('contact').then(data => data.contact),
    () => client.data.get('requester').then(data => data.requester),
    () => client.data.get('loggedInUser').then(data => data.loggedInUser),
    () => client.data.get('ticket').then(data => data.ticket.requester)
  ];
  
  for (const method of methods) {
    try {
      const contact = await method();
      if (contact && contact.email) {
        console.log('Got contact data:', contact);
        return contact;
      }
    } catch (error) {
      console.log('Method failed:', error.message);
    }
  }
  
  // Fallback for testing
  return {
    name: 'Test Customer',
    email: 'srinivasan.2021@vitalum.ac.in'
  };
}

async function getOrdersData(client, email) {
  try {
    console.log('Testing SMI connection...');
    await client.request.invoke('testMethod', { test: 'hello' });
    
    const orders = await fetchOrderHistory(client, email);
    console.log('Successfully fetched orders from server:', orders?.length || 0);
    return orders;
  } catch (smiError) {
    console.error('SMI failed, using sample data:', smiError);
    const orders = getSampleOrders(email);
    console.log('Using sample data:', orders?.length || 0, 'orders');
    return orders;
  }
}

function displayCustomerInfo(contact) {
  const customerInfo = document.getElementById('customer-info');
  customerInfo.innerHTML = `
    <strong>${contact.name}</strong><br>
    <span>${contact.email}</span>
  `;
}

async function fetchOrderHistory(client, email) {
  try {
    console.log('Calling getOrderHistory with email:', email);
    const response = await client.request.invoke('getOrderHistory', { email });
    console.log('Server response:', response);
    
    // Check if response is an error object
    if (response && response.error) {
      throw new Error(response.error);
    }
    
    // Response should be the orders array directly
    return response;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

function displayOrders(orders) {
  hideLoading();
  
  const container = document.getElementById('orders-container');
  const summaryDiv = document.getElementById('orders-summary');
  const listDiv = document.getElementById('orders-list');
  
  // Display summary
  const summary = generateOrderSummary(orders);
  summaryDiv.innerHTML = `
    <div class="summary-stats">
      <div class="stat">
        <div class="stat-value">${summary.totalOrders}</div>
        <div class="stat-label">Total Orders</div>
      </div>
      <div class="stat">
        <div class="stat-value">$${summary.totalSpent.toFixed(2)}</div>
        <div class="stat-label">Total Spent</div>
      </div>
      <div class="stat">
        <div class="stat-value">${summary.recentOrders}</div>
        <div class="stat-label">Last 30 Days</div>
      </div>
    </div>
  `;
  
  // Display order list (most recent first)
  const sortedOrders = orders.sort((a, b) => new Date(b.date_placed) - new Date(a.date_placed));
  const recentOrders = sortedOrders.slice(0, 10); // Show last 10 orders
  
  listDiv.innerHTML = recentOrders.map(order => `
    <div class="order-item">
      <div class="order-header">
        <span class="order-id">${order.order_id}</span>
        <span class="order-status status-${order.status.toLowerCase().replace(/\s+/g, '-')}">${order.status}</span>
      </div>
      <div class="order-details">
        ${order.summary_items}
      </div>
      <div class="order-meta">
        <div class="order-amount">$${order.total_amount.toFixed(2)} ${order.currency}</div>
        <div class="order-date">${formatDate(order.date_placed)}</div>
      </div>
    </div>
  `).join('');
  
  container.classList.remove('hidden');
}

function generateOrderSummary(orders) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const recentOrders = orders.filter(order => new Date(order.date_placed) >= thirtyDaysAgo).length;
  
  return { totalOrders, totalSpent, recentOrders };
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function showLoading() {
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('error').classList.add('hidden');
  document.getElementById('orders-container').classList.add('hidden');
  document.getElementById('no-orders').classList.add('hidden');
}

function hideLoading() {
  document.getElementById('loading').classList.add('hidden');
}

function showError(message) {
  hideLoading();
  document.getElementById('error-message').textContent = message;
  document.getElementById('error').classList.remove('hidden');
}

function showNoOrders() {
  hideLoading();
  document.getElementById('no-orders').classList.remove('hidden');
}

function getSampleOrders(email) {
  // Sample data for testing when SMI fails - includes all orders for both test customers
  const sampleData = [
    {
      "order_id": "SE-200299",
      "customer_external_id": "user2",
      "customer_email": "srinivasanabarnathlingam08@gmail.com",
      "date_placed": "2024-02-25",
      "status": "Delivered",
      "total_amount": 75.00,
      "currency": "USD",
      "summary_items": "1x Backpack, 1x Laptop Sleeve"
    },
    {
      "order_id": "SE-200330",
      "customer_external_id": "user2",
      "customer_email": "srinivasanabarnathlingam08@gmail.com",
      "date_placed": "2024-03-20",
      "status": "Pending Payment",
      "total_amount": 670.00,
      "currency": "USD",
      "summary_items": "1x Tablet Pro 11-inch"
    },
    {
      "order_id": "SE-200375",
      "customer_external_id": "user2",
      "customer_email": "srinivasanabarnathlingam08@gmail.com",
      "date_placed": "2024-04-01",
      "status": "Delivered",
      "total_amount": 18.00,
      "currency": "USD",
      "summary_items": "3x USB-C Cables"
    },
    {
      "order_id": "SE-200412",
      "customer_external_id": "user2",
      "customer_email": "srinivasanabarnathlingam08@gmail.com",
      "date_placed": "2024-04-18",
      "status": "Returned",
      "total_amount": 499.99,
      "currency": "USD",
      "summary_items": "1x Robot Vacuum Cleaner"
    },
    {
      "order_id": "SE-200455",
      "customer_external_id": "user2",
      "customer_email": "srinivasanabarnathlingam08@gmail.com",
      "date_placed": "2024-05-12",
      "status": "Delivered",
      "total_amount": 22.50,
      "currency": "USD",
      "summary_items": "1x Stainless Steel Water Bottle"
    },
    {
      "order_id": "SE-200499",
      "customer_external_id": "user2",
      "customer_email": "srinivasanabarnathlingam08@gmail.com",
      "date_placed": "2024-05-30",
      "status": "Processing Return",
      "total_amount": 1250.00,
      "currency": "USD",
      "summary_items": "1x 55-inch 4K TV"
    },
    {
      "order_id": "SE-200578",
      "customer_external_id": "user2",
      "customer_email": "srinivasanabarnathlingam08@gmail.com",
      "date_placed": "2024-06-25",
      "status": "Delivered",
      "total_amount": 299.00,
      "currency": "USD",
      "summary_items": "1x Smartwatch, 2x Extra Bands"
    },
    {
      "order_id": "SE-100199",
      "customer_external_id": "user1",
      "customer_email": "srinivasan.2021@vitalum.ac.in",
      "date_placed": "2024-02-10",
      "status": "Processing Return",
      "total_amount": 780.00,
      "currency": "USD",
      "summary_items": "1x DSLR Camera"
    },
    {
      "order_id": "SE-100210",
      "customer_external_id": "user1",
      "customer_email": "srinivasan.2021@vitalum.ac.in",
      "date_placed": "2024-02-20",
      "status": "Delivered",
      "total_amount": 320.00,
      "currency": "USD",
      "summary_items": "1x Electric Kettle, 1x Espresso Machine"
    },
    {
      "order_id": "SE-100255",
      "customer_external_id": "user1",
      "customer_email": "srinivasan.2021@vitalum.ac.in",
      "date_placed": "2024-03-10",
      "status": "Cancelled",
      "total_amount": 24.99,
      "currency": "USD",
      "summary_items": "1x Phone Case, 1x Screen Protector"
    },
    {
      "order_id": "SE-100276",
      "customer_external_id": "user1",
      "customer_email": "srinivasan.2021@vitalum.ac.in",
      "date_placed": "2024-03-28",
      "status": "Pending Shipment",
      "total_amount": 1350.00,
      "currency": "USD",
      "summary_items": "1x UltraWide Monitor"
    }
  ];
  
  const filtered = sampleData.filter(order => 
    order.customer_email.toLowerCase() === email.toLowerCase()
  );
  
  console.log(`📋 Sample data: found ${filtered.length} orders for ${email}`);
  return filtered;
}
