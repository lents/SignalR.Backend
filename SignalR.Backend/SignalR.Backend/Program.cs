
using SignalR.Backend.Hubs;

namespace SignalR.Backend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp",
                    policy =>
                    {
                        policy.WithOrigins("http://localhost:3000") // React app URL
                              .AllowAnyHeader()
                              .AllowAnyMethod()
                              .AllowCredentials();
                    });
            });
            builder.Services.AddControllers();
            // Add SignalR
            builder.Services.AddSignalR();

            var app = builder.Build();

            // Use CORS policy
            app.UseCors("AllowReactApp");
            app.UseRouting();
            app.MapHub<ChatHub>("/chatHub");
            
            app.Run();
        }
    }
}
