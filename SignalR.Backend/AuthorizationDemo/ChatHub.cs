using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace AuthorizationDemo
{
    [Authorize]
    public class ChatHub : Hub
    {
        // Store messages with each user's identifier
        private static ConcurrentDictionary<string, List<string>> _userMessages = new ConcurrentDictionary<string, List<string>>();

        public async Task SendMessage(string message)
        {
            var userName = Context.User.Identity.Name;
            var formattedMessage = $"{userName}: {message}";

            // Add message to user-specific history
            _userMessages.AddOrUpdate(userName, new List<string> { formattedMessage },
                (key, oldValue) =>
                {
                    oldValue.Add(formattedMessage);
                    return oldValue;
                });

            // Broadcast message to all clients
            await Clients.All.SendAsync("ReceiveMessage", userName, message);
        }

        public override async Task OnConnectedAsync()
        {
            var userName = Context.User.Identity.Name;

            // Load user-specific chat history if exists
            if (_userMessages.TryGetValue(userName, out var messageHistory))
            {
                await Clients.Caller.SendAsync("LoadHistory", messageHistory);
            }
            else
            {
                await Clients.Caller.SendAsync("LoadHistory", new List<string> { "Welcome! Start chatting..." });
            }

            await base.OnConnectedAsync();
        }

        [Authorize(Roles = "Admin")]
        public async Task SendNotificationToAll(string message)
        {
            await Clients.All.SendAsync("ReceiveNotification", message);
        }       
    }
}
