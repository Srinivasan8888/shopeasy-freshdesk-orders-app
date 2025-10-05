# Customer Order History App

A Freshdesk app that displays customer order history in the ticket sidebar. When agents view tickets, they can see a comprehensive summary of the customer's recent orders fetched directly from a configurable API endpoint.

## Features

- **Order History Display**: Shows customer's order history with order details, status, and amounts
- **Order Summary**: Displays total orders, total spent, and recent activity (last 30 days)
- **Direct API Integration**: Fetches order data directly from configurable external API endpoints
- **Responsive UI**: Clean, modern interface with custom styling
- **Status Indicators**: Color-coded order status badges for easy identification
- **Customer Auto-Detection**: Automatically identifies customer from ticket context
- **Debug Tools**: Built-in debugging tools for troubleshooting API connectivity

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

1. **Clone Repository**: `git clone <repository-url>`
2. **Install Dependencies**: Navigate to the project directory
3. **Configure API**: The app will prompt for API URL during installation, or use the default mock API
4. **Run Locally**: `fdk run`
5. **Access App**: Open your Freshdesk instance with `?dev=true` appended to the URL
6. **Install App**: Follow the installation prompts to configure the API URL

## Architecture

### Current Implementation (Client-Side)

The app now uses a **client-side architecture** that makes direct API calls:

- **No Server Dependency**: All API calls are made directly from the browser
- **Direct Integration**: Uses Freshworks `client.request.get()` for API calls
- **Fallback Support**: Falls back to native `fetch()` if client request fails
- **Real-time Data**: Fetches fresh data on each app load
- **Configurable Endpoints**: API URL is configurable through installation parameters

### Legacy Server Implementation

The `server/server.js` file contains the previous server-side implementation but is not used in the current version. This provides a reference for server-side integration if needed.

## How It Works

1. **App Initialization**: When the app loads in the ticket sidebar, it initializes the Freshworks client
2. **Customer Detection**: The app automatically detects the customer email from the ticket context using multiple fallback methods
3. **API Configuration**: Retrieves the API URL from installation parameters (iparams) with fallback to default URL
4. **Direct API Call**: Makes HTTP requests directly to the configured API endpoint using `client.request.get()` or fetch API
5. **Data Processing**: Filters orders by customer email and processes the response data
6. **Display**: Orders are displayed with summary statistics and detailed order list in a responsive interface

## Configuration

### API URL Setup

1. **During Installation**: Configure the API URL in the app installation parameters
2. **Default Fallback**: If no API URL is configured, the app uses the default mock API
3. **Runtime Configuration**: The API URL is retrieved from `iparams.apiurl` during app execution

### API Response Format

Your API endpoint should return an array of order objects with this structure:

```json
[
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
]
```

## Customization

### Modifying Order Display

Update the order item template in `app/scripts/app.js` in the `displayOrders()` function to show additional fields or change the layout.

### Styling Changes

Modify the CSS in the `initializeTicketSidebar()` function in `app/scripts/app.js` to customize colors, spacing, and layout.

### Adding Authentication

To add API authentication, modify the request headers in the `getOrdersData()` function:

```javascript
const response = await client.request.get(apiUrl, {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer YOUR_API_TOKEN'
  }
});
```

## File Structure

```
├── app/
│   ├── index.html              # Main UI template with debug tools
│   ├── scripts/
│   │   ├── app.js              # Main frontend logic with direct API integration
│   │   └── test-api.js         # Debug utilities for API testing
│   └── styles/
│       ├── style.css           # Custom styling
│       └── images/             # App icons and images
├── server/
│   ├── server.js               # Server-side logic (legacy, not used in current implementation)
│   ├── test_data/
│   │   └── onOrderData.json    # Sample order data for testing
│   └── lib/                    # Server dependencies
├── config/
│   ├── iparams.json            # Installation parameters configuration
│   └── assets/                 # Configuration assets
├── coverage/                   # Test coverage reports
├── log/                        # Application logs
└── manifest.json               # App manifest and configuration
```

## Testing & Debugging

### Sample Data

Create test tickets with these email addresses to see the order history in action.

### Debug Tools

The app includes built-in debugging tools accessible through the UI:

1. **Test API Directly**: Button to test API connectivity without going through the full app flow
2. **Log Client Object**: Button to inspect the Freshworks client object in browser console
3. **Console Logging**: Detailed console logs for troubleshooting customer detection and API calls

### Troubleshooting

1. **API URL Issues**: Check browser console for iparams retrieval errors
2. **Customer Detection**: The app tries multiple methods to detect customer email from ticket context
3. **Network Issues**: The app includes fallback from `client.request.get()` to native `fetch()` API
4. **Response Format**: Verify your API returns a JSON array of order objects

### Testing Steps

1. Open a ticket in Freshdesk with a test customer email
2. Open browser developer tools (F12) to view console logs
3. Load the app in the ticket sidebar
4. Use debug buttons to test individual components
5. Check console logs for detailed execution flow

## Current Status

### ✅ Implemented Features
- Direct API integration with configurable endpoints
- Customer auto-detection from ticket context
- Order filtering by customer email
- Responsive UI with order summary and detailed list
- Color-coded status indicators
- Debug tools and comprehensive logging
- Fallback mechanisms for API and customer detection

### 🔧 Debug Features
- **API Connectivity Test**: Direct API testing without app context
- **Client Object Inspection**: Debug Freshworks client object
- **Detailed Logging**: Step-by-step execution logging
- **Multiple Fallbacks**: Graceful handling of various failure scenarios

### 📝 Known Considerations
- App requires ticket context to identify customer
- API URL configuration through installation parameters
- Supports both Freshworks client requests and native fetch API

## Support & Documentation

- [Freshworks Developer Documentation](https://community.developers.freshworks.com/t/quick-start-guide/234)
- [Freshworks CLI Documentation](https://community.developers.freshworks.com/t/what-are-the-prerequisites-to-install-the-freshworks-cli/234)
- [App Development Best Practices](https://developers.freshworks.com/docs/app-sdk/)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly using the debug tools
5. Submit a pull request with detailed description