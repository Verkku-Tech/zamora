using Microsoft.AspNetCore.Mvc;
using FuerzaCivil.Api.DTOs;
using FuerzaCivil.Api.Services;

namespace FuerzaCivil.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService) => _authService = authService;

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login(LoginDto dto)
    {
        var result = await _authService.Login(dto);
        if (result is null)
            return Unauthorized(new { message = "Credenciales inválidas" });

        return Ok(result);
    }
}
