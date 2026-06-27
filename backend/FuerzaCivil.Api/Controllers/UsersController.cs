using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FuerzaCivil.Api.Data;
using FuerzaCivil.Api.DTOs;
using FuerzaCivil.Api.Services;

namespace FuerzaCivil.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly AuthService _authService;

    public UsersController(AppDbContext db, AuthService authService)
    {
        _db = db;
        _authService = authService;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> GetAll()
    {
        var users = await _db.Users
            .Include(u => u.Role)
            .Include(u => u.UserPuntosInteres)
            .OrderBy(u => u.Nombre)
            .Select(u => new UserDto(
                u.Id,
                u.Email,
                u.Nombre,
                u.RoleId,
                u.Role != null ? u.Role.Nombre : null,
                u.Activo,
                u.UserPuntosInteres.Select(up => up.PuntoInteresId).ToList(),
                u.CreatedAt
            ))
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserDto>> GetById(Guid id)
    {
        var user = await _db.Users
            .Include(u => u.Role)
            .Include(u => u.UserPuntosInteres)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user is null) return NotFound();

        return Ok(new UserDto(
            user.Id, user.Email, user.Nombre, user.RoleId,
            user.Role?.Nombre, user.Activo,
            user.UserPuntosInteres.Select(up => up.PuntoInteresId).ToList(),
            user.CreatedAt
        ));
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> Create(CreateUserDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            return Conflict(new { message = "El email ya está registrado" });

        var user = new Models.User
        {
            Email = dto.Email,
            Nombre = dto.Nombre,
            PasswordHash = _authService.HashPassword(dto.Password),
            RoleId = dto.RoleId,
        };

        _db.Users.Add(user);

        if (dto.PuntosInteresIds?.Count > 0)
        {
            foreach (var poiId in dto.PuntosInteresIds)
            {
                _db.UserPuntosInteres.Add(new Models.UserPuntoInteres
                {
                    UserId = user.Id,
                    PuntoInteresId = poiId
                });
            }
        }

        await _db.SaveChangesAsync();

        var role = await _db.Roles.FindAsync(user.RoleId);

        return CreatedAtAction(nameof(GetById), new { id = user.Id }, new UserDto(
            user.Id, user.Email, user.Nombre, user.RoleId,
            role?.Nombre, user.Activo,
            dto.PuntosInteresIds ?? [],
            user.CreatedAt
        ));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<UserDto>> Update(Guid id, UpdateUserDto dto)
    {
        var user = await _db.Users
            .Include(u => u.UserPuntosInteres)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user is null) return NotFound();

        if (dto.Nombre is not null) user.Nombre = dto.Nombre;
        if (dto.Password is not null) user.PasswordHash = _authService.HashPassword(dto.Password);
        if (dto.RoleId.HasValue) user.RoleId = dto.RoleId.Value;
        if (dto.Activo.HasValue) user.Activo = dto.Activo.Value;

        if (dto.PuntosInteresIds is not null)
        {
            var existing = _db.UserPuntosInteres.Where(up => up.UserId == id);
            _db.UserPuntosInteres.RemoveRange(existing);

            foreach (var poiId in dto.PuntosInteresIds)
            {
                _db.UserPuntosInteres.Add(new Models.UserPuntoInteres
                {
                    UserId = user.Id,
                    PuntoInteresId = poiId
                });
            }
        }

        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var role = await _db.Roles.FindAsync(user.RoleId);
        var pois = await _db.UserPuntosInteres
            .Where(up => up.UserId == user.Id)
            .Select(up => up.PuntoInteresId)
            .ToListAsync();

        return Ok(new UserDto(
            user.Id, user.Email, user.Nombre, user.RoleId,
            role?.Nombre, user.Activo, pois, user.CreatedAt
        ));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null) return NotFound();

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{id:guid}/pois")]
    public async Task<IActionResult> UpdatePois(Guid id, List<Guid> poiIds)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null) return NotFound();

        var existing = _db.UserPuntosInteres.Where(up => up.UserId == id);
        _db.UserPuntosInteres.RemoveRange(existing);

        foreach (var poiId in poiIds)
        {
            _db.UserPuntosInteres.Add(new Models.UserPuntoInteres
            {
                UserId = id,
                PuntoInteresId = poiId
            });
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }
}
