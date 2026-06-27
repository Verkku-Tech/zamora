using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using FuerzaCivil.Api.Data;
using FuerzaCivil.Api.DTOs;
using FuerzaCivil.Api.Models;

namespace FuerzaCivil.Api.Services;

public class AuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<LoginResponseDto?> Login(LoginDto dto)
    {
        var user = await _db.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == dto.Email && u.Activo);

        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return null;

        var role = user.Role!;
        var permisos = JsonSerializer.Deserialize<Dictionary<string, string[]>>(role.Permisos) ?? [];

        var expiresAt = DateTime.UtcNow.AddHours(12);
        var token = GenerateToken(user, role, permisos, expiresAt);

        return new LoginResponseDto(token, user.Email, user.Nombre, role.Nombre, permisos, role.AccesoGlobal, expiresAt);
    }

    private string GenerateToken(User user, Role role, Dictionary<string, string[]> permisos, DateTime expiresAt)
    {
        var secret = _config["Jwt:Secret"]!;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new("nombre", user.Nombre),
            new("role", role.Nombre),
            new("permisos", JsonSerializer.Serialize(permisos)),
            new("acceso_global", role.AccesoGlobal.ToString().ToLowerInvariant()),
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "fuerzacivil",
            audience: _config["Jwt:Audience"] ?? "fuerzacivil-web",
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }
}
