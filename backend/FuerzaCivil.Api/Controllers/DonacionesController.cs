using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FuerzaCivil.Api.Data;
using FuerzaCivil.Api.DTOs;
using FuerzaCivil.Api.Models;

namespace FuerzaCivil.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DonacionesController : ControllerBase
{
    private readonly AppDbContext _db;
    public DonacionesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<DonacionDto>>> GetAll(
        [FromQuery] Guid? puntoInteresId,
        [FromQuery] int? limit = 100)
    {
        var query = _db.Donaciones
            .Include(d => d.PuntoInteres)
            .AsQueryable();

        if (puntoInteresId.HasValue)
            query = query.Where(d => d.PuntoInteresId == puntoInteresId.Value);

        var take = Math.Clamp(limit ?? 100, 1, 500);
        var items = await query
            .OrderByDescending(d => d.CreatedAt)
            .Take(take)
            .ToListAsync();

        return Ok(items.Select(MapToDto));
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<DonacionResultDto>> Registrar(CreateDonacionDto dto)
    {
        if (dto.Cantidad <= 0)
            return BadRequest("La cantidad debe ser mayor a cero");

        var punto = await _db.PuntosInteres.FindAsync(dto.PuntoInteresId);
        if (punto is null)
            return BadRequest("Punto de interés no encontrado");

        var nombre = dto.Nombre.Trim();
        var categoria = dto.Categoria.Trim().ToLowerInvariant();
        var unidad = NormalizeUnidad(dto.Unidad);

        if (string.IsNullOrWhiteSpace(nombre))
            return BadRequest("El nombre del producto es obligatorio");

        Insumo? insumo = null;
        var insumoNuevo = false;

        if (dto.InsumoId.HasValue)
        {
            insumo = await _db.Insumos.FirstOrDefaultAsync(i =>
                i.Id == dto.InsumoId.Value && i.PuntoInteresId == dto.PuntoInteresId);
            if (insumo is null)
                return BadRequest("Insumo no encontrado en este punto");
        }
        else
        {
            var nombreNorm = nombre.ToLowerInvariant();
            var candidatos = await _db.Insumos
                .Where(i => i.PuntoInteresId == dto.PuntoInteresId && i.Categoria == categoria)
                .ToListAsync();

            insumo = candidatos.FirstOrDefault(i =>
                i.Nombre.Trim().ToLowerInvariant() == nombreNorm &&
                NormalizeUnidad(i.Unidad) == unidad);
        }

        if (insumo is null)
        {
            insumoNuevo = true;
            insumo = new Insumo
            {
                PuntoInteresId = dto.PuntoInteresId,
                Nombre = nombre,
                Categoria = categoria,
                Prioridad = "media",
                CantidadNecesaria = 0,
                CantidadDisponible = dto.Cantidad,
                Unidad = unidad,
            };
            _db.Insumos.Add(insumo);
        }
        else
        {
            var unidadExistente = NormalizeUnidad(insumo.Unidad);
            if (unidadExistente != unidad)
            {
                return BadRequest(
                    $"Este producto ya existe con unidad \"{unidadExistente}\". " +
                    $"Usa la misma unidad o selecciónalo del listado.");
            }
            insumo.CantidadDisponible += dto.Cantidad;
            insumo.UpdatedAt = DateTime.UtcNow;
        }

        var cantidadAnterior = insumoNuevo ? 0 : insumo.CantidadDisponible - dto.Cantidad;

        if (!punto.TiposDonacion.Contains(categoria))
            punto.TiposDonacion = [.. punto.TiposDonacion, categoria];

        punto.DonacionesRecibidas += 1;
        punto.UltimaActualizacion = DateTime.UtcNow;
        punto.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var donacion = new Donacion
        {
            PuntoInteresId = dto.PuntoInteresId,
            InsumoId = insumo.Id,
            NombreProducto = insumo.Nombre,
            Categoria = insumo.Categoria,
            Cantidad = dto.Cantidad,
            Unidad = insumo.Unidad,
            Donante = string.IsNullOrWhiteSpace(dto.Donante) ? null : dto.Donante.Trim(),
            Notas = string.IsNullOrWhiteSpace(dto.Notas) ? null : dto.Notas.Trim(),
            CantidadAnterior = cantidadAnterior,
            CantidadNueva = insumo.CantidadDisponible,
        };
        _db.Donaciones.Add(donacion);
        await _db.SaveChangesAsync();

        await _db.Entry(donacion).Reference(d => d.PuntoInteres).LoadAsync();

        return Ok(new DonacionResultDto(
            MapToDto(donacion),
            insumoNuevo,
            insumo.CantidadDisponible
        ));
    }

    private static DonacionDto MapToDto(Donacion d) => new(
        d.Id,
        d.PuntoInteresId,
        d.PuntoInteres?.Nombre ?? "",
        d.PuntoInteres?.Tipo.ToString() ?? "",
        d.InsumoId,
        d.NombreProducto,
        d.Categoria,
        d.Cantidad,
        d.Unidad,
        d.Donante,
        d.Notas,
        d.CantidadAnterior,
        d.CantidadNueva,
        d.CreatedAt
    );

    private static string NormalizeUnidad(string? unidad)
    {
        if (string.IsNullOrWhiteSpace(unidad)) return "unidades";
        var u = unidad.Trim();
        return u switch
        {
            "L" or "l" or "ltr" or "ltrs" or "litros" => "Ltrs",
            "ml" or "ML" => "mL",
            "kg" or "KG" => "Kg",
            _ => u,
        };
    }
}
