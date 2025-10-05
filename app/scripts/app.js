init();

async function init() {
  try {
    console.log('Initializing app...');
    const client = await app.initialized();
    console.log('App client initialized successfully');

    window.client = client;
    initializeTicketSidebar();

    client.events.on('app.activated', () => {
      console.log('App activated event triggered');
      loadOrderHistory(client);
    });

    setTimeout(() => {
      console.log('Timeout triggered, loading order history...');
      loadOrderHistory(client);
    }, 1000);

  } catch (error) {
    console.error('Failed to initialize app:', error);
    showError('Failed to initialize app: ' + error.message);
  }
}

function initializeTicketSidebar() {
  const style = document.createElement('style');
  style.textContent = `
    .hidden { display: none !important; }
    .summary-stats {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .stat {
      flex: 1;
      min-width: 80px;
      text-align: center;
      padding: 8px;
      background: #f8fafc;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }
    .stat-value {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 2px;
    }
    .stat-label {
      font-size: 10px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .order-item {
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 10px;
      margin-bottom: 8px;
      background: white;
    }
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .order-id {
      font-weight: 600;
      color: #374151;
      font-size: 13px;
    }
    .order-status {
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: 500;
      text-transform: uppercase;
      color: white;
    }
    .status-delivered { background: #059669; }
    .status-shipped { background: #2563eb; }
    .status-pending-payment { background: #d97706; }
    .status-pending-shipment { background: #d97706; }
    .status-cancelled { background: #dc2626; }
    .status-returned { background: #7c3aed; }
    .status-processing-return { background: #d97706; }
    .order-details {
      color: #6b7280;
      font-size: 12px;
      margin-bottom: 6px;
      line-height: 1.3;
    }
    .order-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .order-amount {
      font-weight: 600;
      color: #059669;
      font-size: 13px;
    }
    .order-date {
      font-size: 11px;
      color: #9ca3af;
    }
    .orders-container {
      margin-top: 16px;
    }
  `;
  document.head.appendChild(style);
}

async function loadOrderHistory(client) {
  try {
    showLoading();
    console.log('Client object keys:', Object.keys(client));

    const contact = await getCustomerContact(client);
    console.log('Customer contact:', contact);
    displayCustomerInfo(contact);

    const orders = await getOrdersData(client, contact.email);
    console.log('Orders found:', orders.length, 'for email:', contact.email);

    if (orders && orders.length > 0) {
      displayOrders(orders);
    } else {
      showNoOrders();
    }
  } catch (error) {
    console.error('Failed to load order history:', error);
    showError(getErrorMessage(error));
  }
}

function getErrorMessage(error) {
  const message = error.message;
  if (message.includes('Unable to retrieve customer contact')) {
    return 'Unable to identify customer. Please ensure this app is opened from a ticket.';
  }
  if (message.includes('API URL not configured')) {
    return 'API URL not configured. Please contact your administrator.';
  }
  if (message.includes('Failed to fetch order data')) {
    return 'Failed to fetch order data. Please check your API configuration and network connection.';
  }
  if (message.includes('Invalid API response')) {
    return 'Invalid response from order API. Please check the API endpoint.';
  }
  return message;
}

async function getCustomerContact(client) {
  const contact = await tryGetContact(client);
  if (!contact) {
    throw new Error('Unable to retrieve customer contact information. Please ensure the app is loaded in a ticket context.');
  }
  return contact;
}

async function tryGetContact(client) {
  const methods = ['contact', 'requester'];

  for (const methodName of methods) {
    const contact = await tryContactMethod(client, methodName);
    if (contact) return contact;
  }

  return null;
}

async function tryContactMethod(client, methodName) {
  try {
    console.log(`Trying method: ${methodName}`);
    const result = await client.data.get(methodName);
    const contact = result[methodName];
    console.log(`Method ${methodName} returned:`, contact);

    if (contact && contact.email) {
      console.log(`✅ Successfully got contact from ${methodName}:`, contact.email);
      return formatContactInfo(contact);
    }
  } catch (error) {
    console.log(`Method ${methodName} failed:`, error.message);
  }
  return null;
}

function formatContactInfo(contact) {
  return {
    email: contact.email,
    name: contact.name || contact.first_name || contact.display_name || contact.email.split('@')[0],
    id: contact.id || contact.user_id
  };
}

async function getOrdersData(client, email) {
  try {
    console.log('Getting orders for email:', email);

    // Get the API URL from installation parameters, with fallback to default
    let apiUrl;
    try {
      const iparams = await client.iparams.get();
      apiUrl = iparams.apiurl;
      console.log('API URL from iparams:', apiUrl);
    } catch (iparamsError) {
      console.log('Could not get iparams, using default API URL:', iparamsError);
      apiUrl = 'https://mocki.io/v1/45a7b766-fdb4-4aac-974a-10b3d5720030';
    }

    if (!apiUrl) {
      // Fallback to default API URL for development
      apiUrl = 'https://mocki.io/v1/45a7b766-fdb4-4aac-974a-10b3d5720030';
      console.log('Using fallback API URL:', apiUrl);
    }

    const response = await fetchOrdersFromApi(apiUrl);
    const orderData = parseOrderResponse(response);

    return filterOrdersByEmail(orderData, email);
  } catch (apiError) {
    console.error('API request failed:', apiError);
    throw new Error('Failed to fetch order data: ' + (apiError.message || 'Unknown error'));
  }
}

async function fetchOrdersFromApi(apiUrl) {
  console.log('fetchOrdersFromApi called with URL:', apiUrl);

  try {
    console.log('Making direct API request to:', apiUrl);
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('API response status:', response.status);

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API response data:', data);

    return {
      status: response.status,
      content: data
    };
  } catch (error) {
    console.error('Error in fetchOrdersFromApi:', error);
    throw error;
  }
}

function parseOrderResponse(response) {
  console.log('API response type:', typeof response.content);

  const orderData = response.content;

  console.log('Parsed order data:', orderData);

  if (!Array.isArray(orderData)) {
    console.error('API response is not an array:', typeof orderData);
    throw new Error('Invalid API response format - expected array');
  }

  return orderData;
}

function filterOrdersByEmail(orderData, email) {
  const customerOrders = orderData.filter(order =>
    order.customer_email && order.customer_email.toLowerCase() === email.toLowerCase()
  );
  console.log(`Found ${customerOrders.length} orders for ${email}`);
  return customerOrders;
}

function displayCustomerInfo(contact) {
  const customerInfo = document.getElementById('customer-info');
  const customerName = contact.name || contact.email.split('@')[0];
  customerInfo.innerHTML = `
    <div style="font-weight: 600; color: #374151; margin-bottom: 2px;">${customerName}</div>
    <div style="color: #6b7280; font-size: 13px;">${contact.email}</div>
  `;
}

function displayOrders(orders) {
  hideLoading();

  const ordersContainer = document.getElementById('orders-container');
  const summaryDiv = document.getElementById('orders-summary');
  const listDiv = document.getElementById('orders-list');

  ordersContainer.classList.remove('hidden');

  const summary = generateOrderSummary(orders);
  summaryDiv.innerHTML = `
    <div class="summary-stats">
      <div class="stat">
        <div class="stat-value">${summary.totalOrders}</div>
        <div class="stat-label">Orders</div>
      </div>
      <div class="stat">
        <div class="stat-value">${summary.totalSpent.toFixed(0)}</div>
        <div class="stat-label">Total</div>
      </div>
      <div class="stat">
        <div class="stat-value">${summary.recentOrders}</div>
        <div class="stat-label">Recent</div>
      </div>
    </div>
  `;

  const sortedOrders = orders.sort((a, b) => new Date(b.date_placed) - new Date(a.date_placed));
  const recentOrders = sortedOrders.slice(0, 15);

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
        <div class="order-amount">${order.total_amount.toFixed(2)}</div>
        <div class="order-date">${formatDate(order.date_placed)}</div>
      </div>
    </div>
  `).join('');
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
    month: 'short',
    day: 'numeric',
    year: '2-digit'
  });
}

function showLoading() {
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('error').classList.add('hidden');
  document.getElementById('orders-summary').innerHTML = '';
  document.getElementById('orders-list').innerHTML = '';
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
