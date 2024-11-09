using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace NotificationDemo.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WeatherForecastController : ControllerBase
    {
        private static readonly string[] Summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        private readonly ILogger<WeatherForecastController> _logger;
        private readonly IHubContext<NotificationHub> _notificationHub;

        public WeatherForecastController(ILogger<WeatherForecastController> logger, IHubContext<NotificationHub> notificationHub)
        {
            _logger = logger;
            _notificationHub = notificationHub;
        }

        [HttpGet(Name = "GetWeatherForecast")]
        public IEnumerable<WeatherForecast> Get()
        {
            return Enumerable.Range(1, 5).Select(index => new WeatherForecast
            {
                Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                TemperatureC = Random.Shared.Next(-20, 55),
                Summary = Summaries[Random.Shared.Next(Summaries.Length)]
            })
            .ToArray();
        }

        [HttpPost(Name = "PlaceOrder")]
        public async Task<IActionResult> PlaceOrder()
        {
            // Logic for placing the order would go here

            // Send notification to clients about the new order
            await _notificationHub.Clients.All.SendAsync("ReceiveNotification", "A new order has been placed!");

            return Ok();
        }
    }
}
