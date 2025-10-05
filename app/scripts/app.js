init();

async function init() {
  try {
    console.log('Initializing app...');
    const client = await app.initialized();
    console.log('App client initialized successfully');

    // Store client globally for debugging
    window.client = client;

    // Initialize the ticket sidebar UI
    initializeTicketSidebar();

    // Load order history when app is activated
    client.events.on('app.activated', () => {
      console.log('App activated event triggered');
      loadOrderHistory(client);
    });

    // Load order history immediately
    console.log('Setting timeout to load order history...');
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
  // The HTML structure already exists, just add the CSS for styling
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

    // Debug: Check what client methods are available
    console.log('Client object keys:', Object.keys(client));
    console.log('Client iparams available:', typeof client.iparams);

    // Get customer contact information
    const contact = await getCustomerContact(client);
    console.log('Customer contact:', contact);

    // Display customer info
    displayCustomerInfo(contact);

    // Get orders data
    const orders = await getOrdersData(client, contact.email);
    console.log('Orders found:', orders.length, 'for email:', contact.email);

    if (orders && orders.length > 0) {
      displayOrders(orders);
    } else {
      showNoOrders();
    }

  } catch (error) {
    console.error('Failed to load order history:', error);

    // Provide more specific error messages
    let errorMessage = error.message;
    if (error.message.includes('Unable to retrieve customer contact')) {
      errorMessage = 'Unable to identify customer. Please ensure this app is opened from a ticket.';
    } else if (error.message.includes('API URL not configured')) {
      errorMessage = 'API URL not configured. Please contact your administrator.';
    } else if (error.message.includes('Failed to fetch order data')) {
      errorMessage = 'Failed to fetch order data. Please check your API configuration and network connection.';
    } else if (error.message.includes('Invalid API response')) {
      errorMessage = 'Invalid response from order API. Please check the API endpoint.';
    }

    showError(errorMessage);
  }
}

async function getCustomerContact(client) {
  // Try different methods to get customer contact information
  const methods = [
    {
      name: 'contact',
      fn: () => client.data.get('contact').then(data => data.contact)
    },
    {
      name: 'requester',
      fn: () => client.data.get('requester').then(data => data.requester)
    },
    {
      name: 'ticket.requester',
      fn: () => client.data.get('ticket').then(data => data.ticket?.requester)
    },
    {
      name: 'ticket.contact',
      fn: () => client.data.get('ticket').then(data => data.ticket?.contact)
    },
    {
      name: 'loggedInUser',
      fn: () => client.data.get('loggedInUser').then(data => data.loggedInUser)
    }
  ];

  for (const method of methods) {
    try {
      console.log(`Trying method: ${method.name}`);
      const contact = await method.fn();
      console.log(`Method ${method.name} returned:`, contact);

      if (contact && contact.email) {
        console.log(`✅ Successfully got contact from ${method.name}:`, contact.email);
        return {
          email: contact.email,
          name: contact.name || contact.first_name || contact.display_name || contact.email.split('@')[0],
          id: contact.id || contact.user_id
        };
      }
    } catch (error) {
      console.log(`Method ${method.name} failed:`, error.message);
      // Method failed, try next one
    }
  }

  // No fallback - throw error if no contact data available
  throw new Error('Unable to retrieve customer contact information. Please ensure the app is loaded in a ticket context.');
}

async function getOrdersData(client, email) {
  try {
    console.log('Getting orders for email:', email);

    // Get API URL from installation parameters
    console.log('Attempting to get iparams...');
    let apiUrl;

    try {
      const iparams = await client.iparams.get();
      console.log('iparams retrieved:', iparams);
      apiUrl = iparams.apiurl || iparams.apiUrl;
    } catch (iparamsError) {
      console.error('Failed to get iparams:', iparamsError);

      // Fallback: try to get from different methods
      try {
        const installationParams = await client.data.get('installationParams');
        console.log('Installation params:', installationParams);
        apiUrl = installationParams?.apiurl || installationParams?.apiUrl;
      } catch (fallbackError) {
        console.error('Fallback method also failed:', fallbackError);
      }
    }

    // If still no API URL, use the default from config
    if (!apiUrl) {
      console.log('No API URL found in iparams, using default from config');
      apiUrl = 'https://mocki.io/v1/45a7b766-fdb4-4aac-974a-10b3d5720030';
    }

    console.log('Final API URL to use:', apiUrl);

    // Make direct API call using client.request.get
    let response;
    try {
      response = await client.request.get(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
    } catch (requestError) {
      console.error('Direct API request failed, trying alternative method:', requestError);

      // Fallback: try using fetch if available
      if (typeof fetch !== 'undefined') {
        try {
          const fetchResponse = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });

          if (!fetchResponse.ok) {
            throw new Error(`Fetch failed with status: ${fetchResponse.status}`);
          }

          const data = await fetchResponse.json();
          response = {
            status: fetchResponse.status,
            response: data,
            headers: fetchResponse.headers
          };
        } catch (fetchError) {
          console.error('Fetch fallback also failed:', fetchError);
          throw new Error('All API request methods failed: ' + requestError.message);
        }
      } else {
        throw requestError;
      }
    }

    console.log('API response status:', response.status);
    console.log('API response headers:', response.headers);
    console.log('API response type:', typeof response.response);

    if (response.status !== 200) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    let orderData;
    try {
      // Parse the response data - handle different response formats
      if (typeof response.response === 'string') {
        orderData = JSON.parse(response.response);
      } else if (typeof response.response === 'object') {
        orderData = response.response;
      } else {
        throw new Error('Unexpected response format');
      }

      console.log('Parsed order data:', orderData);
    } catch (parseError) {
      console.error('Failed to parse API response:', parseError);
      console.error('Raw response:', response.response);
      throw new Error('Invalid API response format');
    }

    // Ensure orderData is an array
    if (!Array.isArray(orderData)) {
      console.error('API response is not an array:', typeof orderData);
      throw new Error('Invalid API response format - expected array');
    }

    // Filter orders by customer email
    const customerOrders = orderData.filter(order =>
      order.customer_email && order.customer_email.toLowerCase() === email.toLowerCase()
    );

    console.log(`Found ${customerOrders.length} orders for ${email}`);
    return customerOrders;

  } catch (apiError) {
    console.error('API request failed:', apiError);
    throw new Error('Failed to fetch order data: ' + (apiError.message || 'Unknown error'));
  }
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

  // Show the orders container
  ordersContainer.classList.remove('hidden');

  // Display summary
  const summary = generateOrderSummary(orders);
  summaryDiv.innerHTML = `
    <div class="summary-stats">
      <div class="stat">
        <div class="stat-value">${summary.totalOrders}</div>
        <div class="stat-label">Orders</div>
      </div>
      <div class="stat">
        <div class="stat-value">$${summary.totalSpent.toFixed(0)}</div>
        <div class="stat-label">Total</div>
      </div>
      <div class="stat">
        <div class="stat-value">${summary.recentOrders}</div>
        <div class="stat-label">Recent</div>
      </div>
    </div>
  `;

  // Display order list (most recent first)
  const sortedOrders = orders.sort((a, b) => new Date(b.date_placed) - new Date(a.date_placed));
  const recentOrders = sortedOrders.slice(0, 15); // Show last 15 orders

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
        <div class="order-amount">$${order.total_amount.toFixed(2)}</div>
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