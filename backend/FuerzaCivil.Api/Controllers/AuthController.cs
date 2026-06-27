using Microsoft.AspNetCore.Mvc;
using FuerzaCivil.Api.DTOs;
using FuerzaCivil.Api.Services;

namespace FuerzaCivil.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _auth;

    public AuthController(AuthService auth) => _auth = auth;

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login(LoginDto dto)
    {
        var result = await _auth.Login(dto);
        if (result is null)
            return Unauthorized(new { message = "Credenciales inválidas" });

        return Ok(result);
    }
}
