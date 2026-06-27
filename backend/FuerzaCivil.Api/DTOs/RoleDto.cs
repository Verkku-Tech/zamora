namespace FuerzaCivil.Api.DTOs;

public record RoleDto(
    Guid Id,
    string Nombre,
    bool AccesoGlobal,
    Dictionary<string, string[]> Permisos
);

public record UpdateRoleDto(
    string? Nombre,
    bool? AccesoGlobal,
    Dictionary<string, string[]>? Permisos
);

public record CreateRoleDto(
    string Nombre,
    bool AccesoGlobal,
    Dictionary<string, string[]> Permisos
);
