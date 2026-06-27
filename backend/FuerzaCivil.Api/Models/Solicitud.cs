using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NetTopologySuite.Geometries;

namespace FuerzaCivil.Api.Models;

public class Solicitud
{
    [Key]
    public Guid Id { get; set; } = Guid.CreateVersion7();

    /// <summary>insumo | inspeccion</summary>
    [Required, MaxLength(20)]
    public string Tipo { get; set; } = "insumo";

    [Required, MaxLength(200)]
    public string Titulo { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Descripcion { get; set; }

    /// <summary>Producto buscado (tipo insumo)</summary>
    [MaxLength(200)]
    public string? ProductoNombre { get; set; }

    [MaxLength(30)]
    public string? Categoria { get; set; }

    public int? CantidadSolicitada { get; set; }

    [MaxLength(50)]
    public string? Unidad { get; set; }

    [MaxLength(200)]
    public string? Solicitante { get; set; }

    [MaxLength(20)]
    public string? TelefonoSolicitante { get; set; }

    [MaxLength(300)]
    public string? Direccion { get; set; }

    /// <summary>Lugar donde se necesita el insumo o la inspección.</summary>
    [Column(TypeName = "geography(Point, 4326)")]
    public Point? Ubicacion { get; set; }

    [Required, MaxLength(20)]
    public string Prioridad { get; set; } = "media";

    /// <summary>pendiente | en_busqueda | ubicado | en_proceso | resuelta | cancelada</summary>
    [Required, MaxLength(20)]
    public string Estado { get; set; } = "pendiente";

    public Guid? PuntoInteresId { get; set; }

    [ForeignKey(nameof(PuntoInteresId))]
    public PuntoInteres? PuntoInteres { get; set; }

    public Guid? InsumoId { get; set; }

    [ForeignKey(nameof(InsumoId))]
    public Insumo? Insumo { get; set; }

    [MaxLength(500)]
    public string? NotasInternas { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
