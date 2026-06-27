using NetTopologySuite.Geometries;
using FuerzaCivil.Api.Models;

namespace FuerzaCivil.Api.Data;

public static class SeedData
{
    public static void Initialize(AppDbContext db)
    {
        var changed = false;

        if (!db.PuntosInteres.Any())
        {
            db.PuntosInteres.AddRange(
                new PuntoInteres { Id = Guid.Parse("10000000-0000-0000-0000-000000000001"), Tipo = TipoPuntoInteres.centro_acopio, Nombre = "Centro Comunitario Guatire", Ubicacion = new Point(-66.5485, 10.4709) { SRID = 4326 }, Direccion = "Avenida Principal, Guatire", Ciudad = "Guatire", Municipio = "Zamora", Estado = "Miranda", Responsable = "Juan Garcia", Telefono = "0424-1234567", Capacidad = 500, DonacionesRecibidas = 350, Beneficiarios = 420, EstadoOperativo = "activo", TiposDonacion = new[] { "alimentos", "medicinas", "ropa" } },
                new PuntoInteres { Id = Guid.Parse("10000000-0000-0000-0000-000000000002"), Tipo = TipoPuntoInteres.centro_acopio, Nombre = "Iglesia San Jose", Ubicacion = new Point(-66.545, 10.480) { SRID = 4326 }, Direccion = "Calle 5, Guatire Centro", Ciudad = "Guatire", Municipio = "Zamora", Estado = "Miranda", Responsable = "Maria Lopez", Telefono = "0416-9876543", Capacidad = 300, DonacionesRecibidas = 280, Beneficiarios = 350, EstadoOperativo = "activo", TiposDonacion = new[] { "alimentos", "agua", "higiene" } },
                new PuntoInteres { Id = Guid.Parse("10000000-0000-0000-0000-000000000003"), Tipo = TipoPuntoInteres.centro_medico, Nombre = "Ambulatorio Dr. Francisco Risquez", Ubicacion = new Point(-66.552, 10.468) { SRID = 4326 }, Direccion = "Sector Los Pinos, Guatire", Ciudad = "Guatire", Municipio = "Zamora", Estado = "Miranda", Responsable = "Dr. Carlos Ruiz", Telefono = "0412-5555555", Capacidad = 200, DonacionesRecibidas = 150, Beneficiarios = 180, EstadoOperativo = "parcial", TiposDonacion = new[] { "medicinas", "suministros medicos" } },
                new PuntoInteres { Id = Guid.Parse("10000000-0000-0000-0000-000000000004"), Tipo = TipoPuntoInteres.institucion, Nombre = "Escuela Primaria Bolivar", Ubicacion = new Point(-66.542, 10.475) { SRID = 4326 }, Direccion = "Carrera 2, Sector Este", Ciudad = "Guatire", Municipio = "Zamora", Estado = "Miranda", Responsable = "Prof. Andrea Martin", Telefono = "0414-7777777", Capacidad = 400, DonacionesRecibidas = 320, Beneficiarios = 500, EstadoOperativo = "activo", TiposDonacion = new[] { "alimentos", "ropa", "libros" } },
                new PuntoInteres { Id = Guid.Parse("10000000-0000-0000-0000-000000000005"), Tipo = TipoPuntoInteres.centro_medico, Nombre = "CDI Valle Verde", Ubicacion = new Point(-66.540, 10.482) { SRID = 4326 }, Direccion = "Calle Principal, Sector Valle Verde", Ciudad = "Guatire", Municipio = "Zamora", Estado = "Miranda", Responsable = "Dra. Elena Martinez", Telefono = "0424-1112233", Capacidad = 150, DonacionesRecibidas = 90, Beneficiarios = 200, EstadoOperativo = "activo", TiposDonacion = new[] { "medicinas", "higiene" } },
                new PuntoInteres { Id = Guid.Parse("10000000-0000-0000-0000-000000000006"), Tipo = TipoPuntoInteres.albergue, Nombre = "Refugio Municipal Zamora", Ubicacion = new Point(-66.545, 10.465) { SRID = 4326 }, Direccion = "Calle Bolivar, Sector Centro", Ciudad = "Guatire", Municipio = "Zamora", Estado = "Miranda", Responsable = "Luis Fernandez", Telefono = "0416-9988776", Capacidad = 300, DonacionesRecibidas = 180, Beneficiarios = 250, EstadoOperativo = "activo", TiposDonacion = new[] { "alimentos", "agua", "ropa", "higiene" } },
                new PuntoInteres { Id = Guid.Parse("10000000-0000-0000-0000-000000000007"), Tipo = TipoPuntoInteres.institucion, Nombre = "Alcaldia de Zamora", Ubicacion = new Point(-66.550, 10.472) { SRID = 4326 }, Direccion = "Plaza Bolivar, Guatire Centro", Ciudad = "Guatire", Municipio = "Zamora", Estado = "Miranda", Responsable = "Oficina de Atencion Ciudadana", Telefono = "0212-3000000", Capacidad = 0, EstadoOperativo = "activo" },
                new PuntoInteres { Id = Guid.Parse("10000000-0000-0000-0000-000000000008"), Tipo = TipoPuntoInteres.zona_segura, Nombre = "Zona Segura Parque Guatire", Ubicacion = new Point(-66.535, 10.478) { SRID = 4326 }, Direccion = "Parque Central, Av. Intercomunal", Ciudad = "Guatire", Municipio = "Zamora", Estado = "Miranda", Responsable = "Proteccion Civil Zamora", Telefono = "0424-5551122", Capacidad = 1000, EstadoOperativo = "activo" },
                new PuntoInteres { Id = Guid.Parse("10000000-0000-0000-0000-000000000009"), Tipo = TipoPuntoInteres.punto_agua, Nombre = "Punto de Agua Comunidad El Rodeo", Ubicacion = new Point(-66.550, 10.464) { SRID = 4326 }, Direccion = "Sector El Rodeo, via principal", Ciudad = "Guatire", Municipio = "Zamora", Estado = "Miranda", Responsable = "Comite de Agua El Rodeo", Telefono = "0412-3344556", Capacidad = 5000, DonacionesRecibidas = 2000, Beneficiarios = 800, EstadoOperativo = "activo", TiposDonacion = new[] { "agua" } },
                new PuntoInteres { Id = Guid.Parse("10000000-0000-0000-0000-000000000010"), Tipo = TipoPuntoInteres.punto_distribucion, Nombre = "Punto de Distribucion Mercal Guatire", Ubicacion = new Point(-66.538, 10.473) { SRID = 4326 }, Direccion = "Av. Principal, frente a la plaza", Ciudad = "Guatire", Municipio = "Zamora", Estado = "Miranda", Responsable = "Coordinacion CLAP Zamora", Telefono = "0426-7788990", Capacidad = 2000, DonacionesRecibidas = 1200, Beneficiarios = 1500, EstadoOperativo = "activo", TiposDonacion = new[] { "alimentos", "higiene" } }
            );

            db.Insumos.AddRange(
                new Insumo { Id = Guid.Parse("20000000-0000-0000-0000-000000000001"), PuntoInteresId = Guid.Parse("10000000-0000-0000-0000-000000000001"), Nombre = "Arroz blanco", Categoria = "alimentos", Prioridad = "critica", CantidadNecesaria = 500, CantidadDisponible = 120, Unidad = "kg" },
                new Insumo { Id = Guid.Parse("20000000-0000-0000-0000-000000000002"), PuntoInteresId = Guid.Parse("10000000-0000-0000-0000-000000000001"), Nombre = "Agua potable", Categoria = "agua", Prioridad = "critica", CantidadNecesaria = 1000, CantidadDisponible = 300, Unidad = "L" },
                new Insumo { Id = Guid.Parse("20000000-0000-0000-0000-000000000003"), PuntoInteresId = Guid.Parse("10000000-0000-0000-0000-000000000001"), Nombre = "Paracetamol", Categoria = "medicinas", Prioridad = "alta", CantidadNecesaria = 100, CantidadDisponible = 45, Unidad = "cajas" },
                new Insumo { Id = Guid.Parse("20000000-0000-0000-0000-000000000004"), PuntoInteresId = Guid.Parse("10000000-0000-0000-0000-000000000002"), Nombre = "Harina de maiz", Categoria = "alimentos", Prioridad = "critica", CantidadNecesaria = 300, CantidadDisponible = 200, Unidad = "kg" },
                new Insumo { Id = Guid.Parse("20000000-0000-0000-0000-000000000005"), PuntoInteresId = Guid.Parse("10000000-0000-0000-0000-000000000002"), Nombre = "Botellas de agua", Categoria = "agua", Prioridad = "critica", CantidadNecesaria = 500, CantidadDisponible = 100, Unidad = "botellas" },
                new Insumo { Id = Guid.Parse("20000000-0000-0000-0000-000000000006"), PuntoInteresId = Guid.Parse("10000000-0000-0000-0000-000000000003"), Nombre = "Gasas esteriles", Categoria = "medicinas", Prioridad = "critica", CantidadNecesaria = 500, CantidadDisponible = 100, Unidad = "paquetes" },
                new Insumo { Id = Guid.Parse("20000000-0000-0000-0000-000000000007"), PuntoInteresId = Guid.Parse("10000000-0000-0000-0000-000000000006"), Nombre = "Colchonetas", Categoria = "ropa", Prioridad = "critica", CantidadNecesaria = 150, CantidadDisponible = 40, Unidad = "unidades" },
                new Insumo { Id = Guid.Parse("20000000-0000-0000-0000-000000000008"), PuntoInteresId = Guid.Parse("10000000-0000-0000-0000-000000000006"), Nombre = "Agua embotellada", Categoria = "agua", Prioridad = "critica", CantidadNecesaria = 800, CantidadDisponible = 200, Unidad = "L" }
            );

            if (!db.ZonasAfectadas.Any())
            {
                db.ZonasAfectadas.AddRange(
                    new ZonaAfectada { Ubicacion = new Point(-66.5485, 10.4709) { SRID = 4326 }, Intensidad = 0.9, RadioKm = 0.8, Descripcion = "Zona centro - alta densidad de afectados" },
                    new ZonaAfectada { Ubicacion = new Point(-66.545, 10.480) { SRID = 4326 }, Intensidad = 0.7, RadioKm = 0.5, Descripcion = "Casco historico - danos moderados" },
                    new ZonaAfectada { Ubicacion = new Point(-66.552, 10.468) { SRID = 4326 }, Intensidad = 1.0, RadioKm = 0.6, Descripcion = "Los Pinos - zona severamente afectada" },
                    new ZonaAfectada { Ubicacion = new Point(-66.542, 10.475) { SRID = 4326 }, Intensidad = 0.5, RadioKm = 0.4, Descripcion = "Sector Este - afectacion leve" },
                    new ZonaAfectada { Ubicacion = new Point(-66.540, 10.482) { SRID = 4326 }, Intensidad = 0.6, RadioKm = 0.5, Descripcion = "Valle Verde - afectacion moderada" },
                    new ZonaAfectada { Ubicacion = new Point(-66.545, 10.465) { SRID = 4326 }, Intensidad = 0.8, RadioKm = 0.7, Descripcion = "Zona sur - alta afectacion" },
                    new ZonaAfectada { Ubicacion = new Point(-66.550, 10.472) { SRID = 4326 }, Intensidad = 0.4, RadioKm = 0.3, Descripcion = "Plaza Bolivar - danos leves" },
                    new ZonaAfectada { Ubicacion = new Point(-66.550, 10.464) { SRID = 4326 }, Intensidad = 0.95, RadioKm = 0.9, Descripcion = "El Rodeo - zona critica" },
                    new ZonaAfectada { Ubicacion = new Point(-66.535, 10.478) { SRID = 4326 }, Intensidad = 0.3, RadioKm = 0.4, Descripcion = "Parque Central - zona de concentracion" },
                    new ZonaAfectada { Ubicacion = new Point(-66.538, 10.473) { SRID = 4326 }, Intensidad = 0.75, RadioKm = 0.5, Descripcion = "Zona comercial - afectacion considerable" }
                );
            }

            changed = true;
        }

        if (!db.ConfigApp.Any())
        {
            db.ConfigApp.Add(new ConfigApp
            {
                Id = 1,
                LatitudDefault = 10.4709,
                LongitudDefault = -66.5485,
                ZoomDefault = 13,
                Municipio = "Zamora",
                Estado = "Miranda",
                Pais = "Venezuela",
            });
            changed = true;
        }

        if (changed)
            db.SaveChanges();
    }
}
