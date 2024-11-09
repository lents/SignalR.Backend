using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AuthorizationDemo.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public AuthController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginModel model)
        {
            // Validate the user (you can validate from DB or other method)
            if (model.Username == "test" && model.Password == "password") // Example
            {
                var token = GenerateToken();
                return Ok(new { Token = token });
            }

            return Unauthorized();
        }

        private string GenerateToken()
        {
            var claims = new[]
            {
            new Claim(ClaimTypes.Name, "test"), // Add claims as needed
        };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("OTUSSignalRDemoFirstKeyOTUSSignalRDemoFirstKey"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: "yourIssuer",
                audience: "yourAudience",
                claims: claims,
                expires: DateTime.Now.AddMinutes(30),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

}
