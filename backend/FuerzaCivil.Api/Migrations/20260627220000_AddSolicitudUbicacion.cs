using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;

#nullable disable

namespace FuerzaCivil.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSolicitudUbicacion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Point>(
                name: "Ubicacion",
                table: "solicitudes",
                type: "geography(Point, 4326)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_solicitudes_Ubicacion",
                table: "solicitudes",
                column: "Ubicacion")
                .Annotation("Npgsql:IndexMethod", "GIST");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_solicitudes_Ubicacion",
                table: "solicitudes");

            migrationBuilder.DropColumn(
                name: "Ubicacion",
                table: "solicitudes");
        }
    }
}
