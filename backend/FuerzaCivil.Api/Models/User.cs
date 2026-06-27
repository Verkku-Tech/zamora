using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FuerzaCivil.Api.Models;

public class User
{
    [Key]
    public Guid Id { get; set; } = Guid.CreateVersion7();

    [Required, MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Nombre { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    public string PasswordHash { get; set; } = string.Empty;

    public Guid RoleId { get; set; }

    [ForeignKey(nameof(RoleId))]
    public Role? Role { get; set; }

    public bool Activo { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<UserPuntoInteres> UserPuntosInteres { get; set; } = [];
}
