using Microsoft.EntityFrameworkCore;
using FuerzaCivil.Api.Models;

namespace FuerzaCivil.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<PuntoInteres> PuntosInteres => Set<PuntoInteres>();
    public DbSet<Insumo> Insumos => Set<Insumo>();
    public DbSet<Donacion> Donaciones => Set<Donacion>();
    public DbSet<Solicitud> Solicitudes => Set<Solicitud>();
    public DbSet<ZonaAfectada> ZonasAfectadas => Set<ZonaAfectada>();
    public DbSet<ConfigApp> ConfigApp => Set<ConfigApp>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserPuntoInteres> UserPuntosInteres => Set<UserPuntoInteres>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PuntoInteres>(entity =>
        {
            entity.ToTable("puntos_interes");
            entity.HasIndex(e => e.Ubicacion).HasMethod("GIST");
            entity.HasIndex(e => e.Tipo);
            entity.Property(e => e.Tipo).HasConversion<string>();
            entity.HasMany(e => e.Insumos)
                  .WithOne(i => i.PuntoInteres)
                  .HasForeignKey(i => i.PuntoInteresId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Insumo>(entity =>
        {
            entity.ToTable("insumos");
        });

        modelBuilder.Entity<Donacion>(entity =>
        {
            entity.ToTable("donaciones");
            entity.HasIndex(e => e.PuntoInteresId);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasOne(e => e.PuntoInteres)
                  .WithMany()
                  .HasForeignKey(e => e.PuntoInteresId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Insumo)
                  .WithMany()
                  .HasForeignKey(e => e.InsumoId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Solicitud>(entity =>
        {
            entity.ToTable("solicitudes");
            entity.HasIndex(e => e.Tipo);
            entity.HasIndex(e => e.Estado);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasOne(e => e.PuntoInteres)
                  .WithMany()
                  .HasForeignKey(e => e.PuntoInteresId)
                  .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.Insumo)
                  .WithMany()
                  .HasForeignKey(e => e.InsumoId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<ZonaAfectada>(entity =>
        {
            entity.ToTable("zonas_afectadas");
            entity.HasIndex(e => e.Ubicacion).HasMethod("GIST");
        });

        modelBuilder.Entity<ConfigApp>(entity =>
        {
            entity.ToTable("config_app");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasOne(e => e.Role)
                  .WithMany(r => r.Users)
                  .HasForeignKey(e => e.RoleId);
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("roles");
            entity.HasIndex(e => e.Nombre).IsUnique();
        });

        modelBuilder.Entity<UserPuntoInteres>(entity =>
        {
            entity.ToTable("user_pois");
            entity.HasKey(e => new { e.UserId, e.PuntoInteresId });
            entity.HasOne(e => e.User)
                  .WithMany(u => u.UserPuntosInteres)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.PuntoInteres)
                  .WithMany()
                  .HasForeignKey(e => e.PuntoInteresId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.HasPostgresExtension("postgis");
    }
}
