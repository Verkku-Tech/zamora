namespace FuerzaCivil.Api.DTOs;

public record DonacionDto(
    Guid Id,
    Guid PuntoInteresId,
    string PuntoNombre,
    string PuntoTipo,
    Guid InsumoId,
    string NombreProducto,
    string Categoria,
    int Cantidad,
    string? Unidad,
    string? Donante,
    string? Notas,
    int CantidadAnterior,
    int CantidadNueva,
    DateTime CreatedAt
);

public record CreateDonacionDto(
    Guid PuntoInteresId,
    Guid? InsumoId,
    string Nombre,
    string Categoria,
    int Cantidad,
    string Unidad,
    string? Donante,
    string? Notas
);

public record DonacionResultDto(
    DonacionDto Donacion,
    bool InsumoNuevo,
    int TotalActual
);
