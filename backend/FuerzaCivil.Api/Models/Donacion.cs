using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FuerzaCivil.Api.Models;

public class Donacion
{
    [Key]
    public Guid Id { get; set; } = Guid.CreateVersion7();

    public Guid PuntoInteresId { get; set; }

    [ForeignKey(nameof(PuntoInteresId))]
    public PuntoInteres? PuntoInteres { get; set; }

    public Guid InsumoId { get; set; }

    [ForeignKey(nameof(InsumoId))]
    public Insumo? Insumo { get; set; }

    [Required, MaxLength(200)]
    public string NombreProducto { get; set; } = string.Empty;

    [Required, MaxLength(30)]
    public string Categoria { get; set; } = string.Empty;

    public int Cantidad { get; set; }

    [MaxLength(50)]
    public string? Unidad { get; set; }

    [MaxLength(200)]
    public string? Donante { get; set; }

    [MaxLength(500)]
    public string? Notas { get; set; }

    public int CantidadAnterior { get; set; }
    public int CantidadNueva { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
