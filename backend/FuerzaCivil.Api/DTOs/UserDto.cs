namespace FuerzaCivil.Api.DTOs;

public record UserDto(
    Guid Id,
    string Email,
    string Nombre,
    Guid RoleId,
    string? RoleNombre,
    bool Activo,
    List<Guid> PuntosInteresIds,
    DateTime CreatedAt
);

public record CreateUserDto(
    string Email,
    string Nombre,
    string Password,
    Guid RoleId,
    List<Guid>? PuntosInteresIds
);

public record UpdateUserDto(
    string? Nombre,
    string? Password,
    Guid? RoleId,
    bool? Activo,
    List<Guid>? PuntosInteresIds
);
