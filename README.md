# Customer Order History App

A Freshdesk app that displays customer order history in both the ticket sidebar and portal ticket sidebar. When agents or customers view tickets, they can see a comprehensive summary of the customer's recent orders.

## Features

- **Order History Display**: Shows customer's order history with order details, status, and amounts
- **Order Summary**: Displays total orders, total spent, and recent activity (last 30 days)
- **Real-time Data**: Fetches order data from local JSON file (can be extended to external APIs)
- **Responsive UI**: Clean, modern interface using Freshworks Crayons components
- **Status Indicators**: Color-coded order status badges for easy identification
- **Dual Location Support**: Works in both ticket sidebar and portal ticket sidebar

## Order Statuses Supported

- Delivered (Green)
- Shipped (Blue) 
- Pending Payment (Yellow)
- Pending Shipment (Yellow)
- Cancelled (Red)
- Returned (Purple)
- Processing Return (Yellow)

## Data Structure

The app reads order data from `server/test_data/onOrderData.json` with the following structure:

```json
{
  "order_id": "SE-100199",
  "customer_external_id": "user1", 
  "customer_email": "customer@example.com",
  "date_placed": "2024-02-10",
  "status": "Processing Return",
  "total_amount": 780.00,
  "currency": "USD",
  "summary_items": "1x DSLR Camera"
}
```

## Prerequisites

1. Freshdesk trial account - [Sign up here](https://freshworks.com/freshdesk/signup/)
2. [Freshworks CLI](https://community.developers.freshworks.com/t/what-are-the-prerequisites-to-install-the-freshworks-cli/234) installed

## Installation & Setup

1. Clone this repository
2. Fill the `config/iparams.json` with your API URL (if using external APIs)
3. Run the app locally: `fdk run`
4. Access your Freshdesk instance with `?dev=true` appended to the URL

## How It Works

1. **App Activation**: When the app loads in the ticket sidebar, it automatically fetches the customer's email
2. **Data Retrieval**: The app calls the server method `getOrderHistory` with the customer's email
3. **Order Filtering**: Server-side code filters orders from the JSON file based on customer email
4. **Display**: Orders are displayed with summary statistics and detailed order list
5. **Responsive Design**: UI adapts to both agent and customer portal views

## Customization

### Adding External API Integration

Replace the file-based data retrieval in `server/server.js`:

```javascript
// Instead of reading from file:
const orderData = JSON.parse(fs.readFileSync(orderDataPath, 'utf8'));

// Use external API:
const response = await $request('https://your-api.com/orders', {
  method: 'GET',
  headers: { 'Authorization': 'Bearer ' + apiKey },
  body: JSON.stringify({ email: email })
});
```

### Modifying Order Display

Update the order item template in `app/scripts/app.js` to show additional fields or change the layout.

### Styling Changes

Modify `app/styles/style.css` to customize colors, spacing, and layout to match your brand.

## File Structure

```
├── app/
│   ├── index.html          # Main UI template
│   ├── scripts/app.js      # Frontend logic
│   └── styles/style.css    # Styling
├── server/
│   ├── server.js           # Backend logic
│   └── test_data/
│       └── onOrderData.json # Sample order data
├── config/
│   └── iparams.json        # App configuration
└── manifest.json           # App manifest
```

## Testing

The app includes sample data for two customers:
- `srinivasan.2021@vitalum.ac.in` (user1) - 10 orders
- `srinivasanabarnathlingam08@gmail.com` (user2) - 10 orders

Create test tickets with these email addresses to see the order history in action.

## Support

For questions or issues, refer to the [Freshworks Developer Documentation](https://community.developers.freshworks.com/t/quick-start-guide/234).