using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FuerzaCivil.Api.Models;

public class Role
{
    [Key]
    public Guid Id { get; set; } = Guid.CreateVersion7();

    [Required, MaxLength(50)]
    public string Nombre { get; set; } = string.Empty;

    public bool AccesoGlobal { get; set; }

    [Column(TypeName = "jsonb")]
    public string Permisos { get; set; } = "{}";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<User> Users { get; set; } = [];
}
