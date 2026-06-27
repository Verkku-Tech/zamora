using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using FuerzaCivil.Api.Data;

namespace FuerzaCivil.Api.Services;

public class PermissionService
{
    private readonly AppDbContext _db;

    public PermissionService(AppDbContext db)
    {
        _db = db;
    }

    public bool TienePermiso(string permisosJson, string modulo, string accion)
    {
        var permisos = JsonSerializer.Deserialize<Dictionary<string, string[]>>(permisosJson);
        if (permisos is null) return false;
        return permisos.TryGetValue(modulo, out var acciones) && acciones.Contains(accion);
    }

    public async Task<List<Guid>> GetPuntosInteresAccesibles(Guid userId, bool accesoGlobal)
    {
        if (accesoGlobal)
        {
            return await _db.PuntosInteres.Select(p => p.Id).ToListAsync();
        }

        return await _db.UserPuntosInteres
            .Where(up => up.UserId == userId)
            .Select(up => up.PuntoInteresId)
            .ToListAsync();
    }

    public async Task<bool> PuedeAccederPoi(Guid userId, Guid poiId, bool accesoGlobal)
    {
        if (accesoGlobal) return true;

        return await _db.UserPuntosInteres
            .AnyAsync(up => up.UserId == userId && up.PuntoInteresId == poiId);
    }
}
