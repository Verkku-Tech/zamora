using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FuerzaCivil.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSolicitudes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "solicitudes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Tipo = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Titulo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ProductoNombre = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Categoria = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    CantidadSolicitada = table.Column<int>(type: "integer", nullable: true),
                    Unidad = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Solicitante = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    TelefonoSolicitante = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Direccion = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    Prioridad = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    PuntoInteresId = table.Column<Guid>(type: "uuid", nullable: true),
                    InsumoId = table.Column<Guid>(type: "uuid", nullable: true),
                    NotasInternas = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_solicitudes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_solicitudes_insumos_InsumoId",
                        column: x => x.InsumoId,
                        principalTable: "insumos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_solicitudes_puntos_interes_PuntoInteresId",
                        column: x => x.PuntoInteresId,
                        principalTable: "puntos_interes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_solicitudes_CreatedAt",
                table: "solicitudes",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_solicitudes_Estado",
                table: "solicitudes",
                column: "Estado");

            migrationBuilder.CreateIndex(
                name: "IX_solicitudes_InsumoId",
                table: "solicitudes",
                column: "InsumoId");

            migrationBuilder.CreateIndex(
                name: "IX_solicitudes_PuntoInteresId",
                table: "solicitudes",
                column: "PuntoInteresId");

            migrationBuilder.CreateIndex(
                name: "IX_solicitudes_Tipo",
                table: "solicitudes",
                column: "Tipo");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "solicitudes");
        }
    }
}
