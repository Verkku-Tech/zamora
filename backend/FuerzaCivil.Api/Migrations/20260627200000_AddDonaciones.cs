using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FuerzaCivil.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDonaciones : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "donaciones",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PuntoInteresId = table.Column<Guid>(type: "uuid", nullable: false),
                    InsumoId = table.Column<Guid>(type: "uuid", nullable: false),
                    NombreProducto = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Categoria = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: false),
                    Unidad = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Donante = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Notas = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CantidadAnterior = table.Column<int>(type: "integer", nullable: false),
                    CantidadNueva = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_donaciones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_donaciones_insumos_InsumoId",
                        column: x => x.InsumoId,
                        principalTable: "insumos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_donaciones_puntos_interes_PuntoInteresId",
                        column: x => x.PuntoInteresId,
                        principalTable: "puntos_interes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_donaciones_CreatedAt",
                table: "donaciones",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_donaciones_InsumoId",
                table: "donaciones",
                column: "InsumoId");

            migrationBuilder.CreateIndex(
                name: "IX_donaciones_PuntoInteresId",
                table: "donaciones",
                column: "PuntoInteresId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "donaciones");
        }
    }
}
