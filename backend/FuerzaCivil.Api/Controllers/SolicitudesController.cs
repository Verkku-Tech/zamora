using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FuerzaCivil.Api.Data;
using FuerzaCivil.Api.DTOs;
using FuerzaCivil.Api.Models;

namespace FuerzaCivil.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SolicitudesController : ControllerBase
{
    private readonly AppDbContext _db;
    public SolicitudesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<SolicitudDto>>> GetAll(
        [FromQuery] string? tipo,
        [FromQuery] string? estado,
        [FromQuery] int? limit = 100)
    {
        var query = _db.Solicitudes
            .Include(s => s.PuntoInteres)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(tipo))
            query = query.Where(s => s.Tipo == tipo.Trim().ToLowerInvariant());

        if (!string.IsNullOrWhiteSpace(estado))
            query = query.Where(s => s.Estado == estado.Trim().ToLowerInvariant());

        var take = Math.Clamp(limit ?? 100, 1, 500);
        var items = await query
            .OrderByDescending(s => s.CreatedAt)
            .Take(take)
            .ToListAsync();

        return Ok(items.Select(MapToDto));
    }

    [HttpGet("buscar-insumos")]
    public async Task<ActionResult<List<InsumoBusquedaDto>>> BuscarInsumos([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Trim().Length < 2)
            return Ok(new List<InsumoBusquedaDto>());

        var term = q.Trim().ToLowerInvariant();
        var items = await _db.Insumos
            .Include(i => i.PuntoInteres)
            .Where(i =>
                i.Nombre.ToLower().Contains(term) ||
                i.Categoria.ToLower().Contains(term))
            .OrderByDescending(i => i.CantidadDisponible)
            .Take(50)
            .ToListAsync();

        return Ok(items.Select(i => new InsumoBusquedaDto(
            i.Id,
            i.Nombre,
            i.Categoria,
            i.CantidadDisponible,
            i.CantidadNecesaria,
            i.Unidad,
            i.PuntoInteresId,
            i.PuntoInteres?.Nombre ?? "",
            i.PuntoInteres?.Tipo.ToString() ?? "",
            i.PuntoInteres?.Direccion,
            i.PuntoInteres?.Ciudad
        )));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SolicitudDto>> GetById(Guid id)
    {
        var item = await _db.Solicitudes
            .Include(s => s.PuntoInteres)
            .FirstOrDefaultAsync(s => s.Id == id);
        return item is null ? NotFound() : Ok(MapToDto(item));
    }

    [HttpPost]
    public async Task<ActionResult<SolicitudDto>> Create(CreateSolicitudDto dto)
    {
        var tipo = dto.Tipo.Trim().ToLowerInvariant();
        if (tipo is not ("insumo" or "inspeccion"))
            return BadRequest("Tipo debe ser 'insumo' o 'inspeccion'");

        if (string.IsNullOrWhiteSpace(dto.Titulo))
            return BadRequest("El título es obligatorio");

        var estado = dto.PuntoInteresId.HasValue || dto.InsumoId.HasValue
            ? "ubicado"
            : "pendiente";

        var puntoId = dto.PuntoInteresId;
        var insumoId = dto.InsumoId;
        var productoNombre = dto.ProductoNombre?.Trim();
        var categoria = dto.Categoria?.Trim().ToLowerInvariant();
        var unidad = dto.Unidad?.Trim();

        if (dto.InsumoId.HasValue)
        {
            var insumo = await _db.Insumos
                .Include(i => i.PuntoInteres)
                .FirstOrDefaultAsync(i => i.Id == dto.InsumoId.Value);
            if (insumo is null) return BadRequest("Insumo no encontrado");
            puntoId = insumo.PuntoInteresId;
            insumoId = insumo.Id;
            productoNombre = insumo.Nombre;
            categoria = insumo.Categoria;
            unidad = insumo.Unidad;
        }

        var entity = new Solicitud
        {
            Tipo = tipo,
            Titulo = dto.Titulo.Trim(),
            Descripcion = dto.Descripcion?.Trim(),
            ProductoNombre = productoNombre,
            Categoria = categoria,
            CantidadSolicitada = dto.CantidadSolicitada,
            Unidad = unidad,
            Solicitante = dto.Solicitante?.Trim(),
            TelefonoSolicitante = dto.TelefonoSolicitante?.Trim(),
            Direccion = dto.Direccion?.Trim(),
            Prioridad = dto.Prioridad?.Trim().ToLowerInvariant() ?? "media",
            Estado = estado,
            PuntoInteresId = puntoId,
            InsumoId = insumoId,
            NotasInternas = dto.NotasInternas?.Trim(),
        };

        _db.Solicitudes.Add(entity);
        await _db.SaveChangesAsync();

        await _db.Entry(entity).Reference(s => s.PuntoInteres).LoadAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, MapToDto(entity));
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<ActionResult<SolicitudDto>> Update(Guid id, UpdateSolicitudDto dto)
    {
        var entity = await _db.Solicitudes
            .Include(s => s.PuntoInteres)
            .FirstOrDefaultAsync(s => s.Id == id);
        if (entity is null) return NotFound();

        if (dto.Titulo is not null) entity.Titulo = dto.Titulo.Trim();
        if (dto.Descripcion is not null) entity.Descripcion = dto.Descripcion.Trim();
        if (dto.ProductoNombre is not null) entity.ProductoNombre = dto.ProductoNombre.Trim();
        if (dto.Categoria is not null) entity.Categoria = dto.Categoria.Trim().ToLowerInvariant();
        if (dto.CantidadSolicitada.HasValue) entity.CantidadSolicitada = dto.CantidadSolicitada;
        if (dto.Unidad is not null) entity.Unidad = dto.Unidad.Trim();
        if (dto.Solicitante is not null) entity.Solicitante = dto.Solicitante.Trim();
        if (dto.TelefonoSolicitante is not null) entity.TelefonoSolicitante = dto.TelefonoSolicitante.Trim();
        if (dto.Direccion is not null) entity.Direccion = dto.Direccion.Trim();
        if (dto.Prioridad is not null) entity.Prioridad = dto.Prioridad.Trim().ToLowerInvariant();
        if (dto.Estado is not null) entity.Estado = dto.Estado.Trim().ToLowerInvariant();
        if (dto.PuntoInteresId.HasValue) entity.PuntoInteresId = dto.PuntoInteresId;
        if (dto.InsumoId.HasValue) entity.InsumoId = dto.InsumoId;
        if (dto.NotasInternas is not null) entity.NotasInternas = dto.NotasInternas.Trim();
        entity.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(MapToDto(entity));
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id)
    {
        var entity = await _db.Solicitudes.FindAsync(id);
        if (entity is null) return NotFound();
        _db.Solicitudes.Remove(entity);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static SolicitudDto MapToDto(Solicitud s) => new(
        s.Id,
        s.Tipo,
        s.Titulo,
        s.Descripcion,
        s.ProductoNombre,
        s.Categoria,
        s.CantidadSolicitada,
        s.Unidad,
        s.Solicitante,
        s.TelefonoSolicitante,
        s.Direccion,
        s.Prioridad,
        s.Estado,
        s.PuntoInteresId,
        s.PuntoInteres?.Nombre,
        s.PuntoInteres?.Tipo.ToString(),
        s.InsumoId,
        s.NotasInternas,
        s.CreatedAt,
        s.UpdatedAt
    );
}
