// Sample order data - in production, this would come from your database or API
const orderData = [
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
    "order_id": "SE-100276",
    "customer_external_id": "user1",
    "customer_email": "srinivasan.2021@vitalum.ac.in",
    "date_placed": "2024-03-28",
    "status": "Pending Shipment",
    "total_amount": 1350.00,
    "currency": "USD",
    "summary_items": "1x UltraWide Monitor"
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
    "order_id": "SE-100288",
    "customer_external_id": "user1",
    "customer_email": "srinivasan.2021@vitalum.ac.in",
    "date_placed": "2024-04-02",
    "status": "Delivered",
    "total_amount": 59.90,
    "currency": "USD",
    "summary_items": "2x Bluetooth Speakers"
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
    "order_id": "SE-100399",
    "customer_external_id": "user1",
    "customer_email": "srinivasan.2021@vitalum.ac.in",
    "date_placed": "2024-05-12",
    "status": "Returned",
    "total_amount": 210.75,
    "currency": "USD",
    "summary_items": "1x Smartwatch, 1x Charging Dock"
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
    "order_id": "SE-100470",
    "customer_external_id": "user1",
    "customer_email": "srinivasan.2021@vitalum.ac.in",
    "date_placed": "2024-06-20",
    "status": "Delivered",
    "total_amount": 18.00,
    "currency": "USD",
    "summary_items": "3x Notebooks, 2x Gel Pens"
  },
  {
    "order_id": "SE-200550",
    "customer_external_id": "user2",
    "customer_email": "srinivasanabarnathlingam08@gmail.com",
    "date_placed": "2024-06-10",
    "status": "Cancelled",
    "total_amount": 45.00,
    "currency": "USD",
    "summary_items": "1x Portable Charger"
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
    "order_id": "SE-100577",
    "customer_external_id": "user1",
    "customer_email": "srinivasan.2021@vitalum.ac.in",
    "date_placed": "2024-06-30",
    "status": "Shipped",
    "total_amount": 249.50,
    "currency": "USD",
    "summary_items": "1x Office Chair, 1x Desk Lamp"
  },
  {
    "order_id": "SE-200599",
    "customer_external_id": "user2",
    "customer_email": "srinivasanabarnathlingam08@gmail.com",
    "date_placed": "2024-07-02",
    "status": "Shipped",
    "total_amount": 85.75,
    "currency": "USD",
    "summary_items": "1x Wireless Headphones"
  },
  {
    "order_id": "SE-100589",
    "customer_external_id": "user1",
    "customer_email": "srinivasan.2021@vitalum.ac.in",
    "date_placed": "2024-07-05",
    "status": "Pending Payment",
    "total_amount": 999.00,
    "currency": "USD",
    "summary_items": "1x Smartphone Pro Max"
  },
  {
    "order_id": "SE-200610",
    "customer_external_id": "user2",
    "customer_email": "srinivasanabarnathlingam08@gmail.com",
    "date_placed": "2024-07-08",
    "status": "Pending Shipment",
    "total_amount": 1450.00,
    "currency": "USD",
    "summary_items": "1x Gaming Laptop, 1x Cooling Pad"
  },
  {
    "order_id": "SE-100601",
    "customer_external_id": "user1",
    "customer_email": "srinivasan.2021@vitalum.ac.in",
    "date_placed": "2024-07-10",
    "status": "Delivered",
    "total_amount": 79.99,
    "currency": "USD",
    "summary_items": "1x Wireless Mouse, 1x Keyboard Cover"
  }
];

exports = {
  onTicketCreateHandler: function (args) {
    // Simple logging for ticket creation - no external API calls for now
    console.log("✅ Ticket created:", args.data.ticket.id);
    console.log("📧 Requester:", args.data.requester.email);
  },

  getOrderHistory: function (args) {
    console.log('🚀 getOrderHistory method called with args:', JSON.stringify(args));

    try {
      const { email } = args;

      if (!email) {
        console.error('❌ Email is required');
        return { error: 'Email is required' };
      }

      console.log(`🔍 Fetching order history for: ${email}`);

      // Filter orders by customer email
      const customerOrders = orderData.filter(order =>
        order.customer_email.toLowerCase() === email.toLowerCase()
      );

      console.log(`📦 Found ${customerOrders.length} orders for ${email}`);
      console.log('📋 Returning orders:', JSON.stringify(customerOrders.slice(0, 2))); // Log first 2 orders

      // Return the orders directly (Freshworks SMI expects direct return)
      return customerOrders;

    } catch (err) {
      console.error("❌ Failed to fetch order history:", err.message || err);
      return { error: err.message || 'Failed to fetch order history' };
    }
  },

  // Test method to verify SMI is working
  testMethod: function (args) {
    console.log('🧪 Test method called with:', args);
    return { message: 'Test successful', timestamp: new Date().toISOString() };
  }
};
