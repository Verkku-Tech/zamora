namespace FuerzaCivil.Api.DTOs;

public record LoginDto(string Email, string Password);

public record LoginResponseDto(
    string Token,
    string Email,
    string Nombre,
    string Role,
    Dictionary<string, string[]> Permisos,
    bool AccesoGlobal,
    DateTime ExpiresAt
);
