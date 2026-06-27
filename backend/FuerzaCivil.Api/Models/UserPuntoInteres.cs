using System.ComponentModel.DataAnnotations.Schema;

namespace FuerzaCivil.Api.Models;

public class UserPuntoInteres
{
    public Guid UserId { get; set; }
    public Guid PuntoInteresId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    [ForeignKey(nameof(PuntoInteresId))]
    public PuntoInteres? PuntoInteres { get; set; }
}
