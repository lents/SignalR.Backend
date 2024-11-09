using System.Net.WebSockets;
using System.Text;

namespace WebSocketServer
{
    public class Program
    {
        public static void Main(string[] args)
        {           

            var builder = WebApplication.CreateBuilder(args);

            var app = builder.Build();

            app.UseWebSockets();

            app.Map("/ws", async context =>
            {
                if (context.WebSockets.IsWebSocketRequest)
                {
                    using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
                    await EchoMessages(webSocket);
                }
                else
                {
                    context.Response.StatusCode = 400;
                }
            });

            async Task EchoMessages(WebSocket webSocket)
            {
                var buffer = new byte[1024 * 4];
                WebSocketReceiveResult result;
                do
                {
                    result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                    var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    Console.WriteLine("Received: " + message);

                    var serverMessage = Encoding.UTF8.GetBytes("Echo: " + message);
                    await webSocket.SendAsync(new ArraySegment<byte>(serverMessage), result.MessageType, result.EndOfMessage, CancellationToken.None);
                } while (!result.CloseStatus.HasValue);

                await webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);
            }

            app.Run();

        }
    }
}
