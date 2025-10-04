exports = {
  onTicketCreateHandler: async function (args) {
    try {
      const payload = {
        ticket_id: args.data.ticket.id,
        subject: args.data.ticket.subject,
        requester: {
          id: args.data.requester.id,
          name: args.data.requester.name,
          email: args.data.requester.email
        },
        created_at: args.data.ticket.created_at
      };

      const options = {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      };

      const response = await $request("https://freshdesk-orders.free.beeceptor.com/newOrder", options);

      console.log("✅ Sent to Beeceptor, status:", response.status);
      if (response.response) {
        console.log("Response data:", response.response);
      }
    } catch (err) {
      console.error("❌ Failed to send order data:", err.message || err);
      throw new Error("Webhook failed: " + (err.message || err));
    }
  }
};
