namespace FuerzaCivil.Api.DTOs;

public record SolicitudDto(
    Guid Id,
    string Tipo,
    string Titulo,
    string? Descripcion,
    string? ProductoNombre,
    string? Categoria,
    int? CantidadSolicitada,
    string? Unidad,
    string? Solicitante,
    string? TelefonoSolicitante,
    string? Direccion,
    string Prioridad,
    string Estado,
    Guid? PuntoInteresId,
    string? PuntoNombre,
    string? PuntoTipo,
    Guid? InsumoId,
    string? NotasInternas,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record CreateSolicitudDto(
    string Tipo,
    string Titulo,
    string? Descripcion,
    string? ProductoNombre,
    string? Categoria,
    int? CantidadSolicitada,
    string? Unidad,
    string? Solicitante,
    string? TelefonoSolicitante,
    string? Direccion,
    string Prioridad,
    Guid? PuntoInteresId,
    Guid? InsumoId,
    string? NotasInternas
);

public record UpdateSolicitudDto(
    string? Titulo,
    string? Descripcion,
    string? ProductoNombre,
    string? Categoria,
    int? CantidadSolicitada,
    string? Unidad,
    string? Solicitante,
    string? TelefonoSolicitante,
    string? Direccion,
    string? Prioridad,
    string? Estado,
    Guid? PuntoInteresId,
    Guid? InsumoId,
    string? NotasInternas
);

public record InsumoBusquedaDto(
    Guid InsumoId,
    string ProductoNombre,
    string Categoria,
    int CantidadDisponible,
    int CantidadNecesaria,
    string? Unidad,
    Guid PuntoInteresId,
    string PuntoNombre,
    string PuntoTipo,
    string? PuntoDireccion,
    string? PuntoCiudad
);
