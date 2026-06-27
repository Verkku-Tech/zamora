using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FuerzaCivil.Api.Data;
using FuerzaCivil.Api.DTOs;

namespace FuerzaCivil.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RolesController : ControllerBase
{
    private readonly AppDbContext _db;

    public RolesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<RoleDto>>> GetAll()
    {
        var roles = await _db.Roles
            .OrderBy(r => r.Nombre)
            .Select(r => new RoleDto(
                r.Id,
                r.Nombre,
                r.AccesoGlobal,
                JsonSerializer.Deserialize<Dictionary<string, string[]>>(r.Permisos) ?? new Dictionary<string, string[]>()
            ))
            .ToListAsync();

        return Ok(roles);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<RoleDto>> GetById(Guid id)
    {
        var role = await _db.Roles.FindAsync(id);
        if (role is null) return NotFound();

        return Ok(new RoleDto(
            role.Id,
            role.Nombre,
            role.AccesoGlobal,
            JsonSerializer.Deserialize<Dictionary<string, string[]>>(role.Permisos) ?? []
        ));
    }

    [HttpPost]
    public async Task<ActionResult<RoleDto>> Create(CreateRoleDto dto)
    {
        if (await _db.Roles.AnyAsync(r => r.Nombre == dto.Nombre))
            return Conflict(new { message = "El nombre del rol ya existe" });

        var role = new Models.Role
        {
            Nombre = dto.Nombre,
            AccesoGlobal = dto.AccesoGlobal,
            Permisos = JsonSerializer.Serialize(dto.Permisos)
        };

        _db.Roles.Add(role);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = role.Id }, new RoleDto(
            role.Id, role.Nombre, role.AccesoGlobal, dto.Permisos
        ));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<RoleDto>> Update(Guid id, UpdateRoleDto dto)
    {
        var role = await _db.Roles.FindAsync(id);
        if (role is null) return NotFound();

        if (dto.Nombre is not null) role.Nombre = dto.Nombre;
        if (dto.AccesoGlobal.HasValue) role.AccesoGlobal = dto.AccesoGlobal.Value;
        if (dto.Permisos is not null) role.Permisos = JsonSerializer.Serialize(dto.Permisos);

        role.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new RoleDto(
            role.Id,
            role.Nombre,
            role.AccesoGlobal,
            JsonSerializer.Deserialize<Dictionary<string, string[]>>(role.Permisos) ?? []
        ));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var role = await _db.Roles.FindAsync(id);
        if (role is null) return NotFound();

        var hasUsers = await _db.Users.AnyAsync(u => u.RoleId == id);
        if (hasUsers)
            return Conflict(new { message = "No se puede eliminar el rol porque tiene usuarios asignados" });

        _db.Roles.Remove(role);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
