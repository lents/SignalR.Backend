using Microsoft.AspNetCore.SignalR;

namespace NotificationDemo
{
    public class NotificationHub : Hub
    {
        // Method to send notification to all connected clients
        public async Task SendNotification(string message)
        {
            // Sends the notification to all connected clients
            await Clients.All.SendAsync("ReceiveNotification", message);
        }
    }
}
