/*
  Warnings:

  - You are about to drop the column `cantidad` on the `master_productos_so` table. All the data in the column will be lost.
  - You are about to drop the column `codigo_cliente` on the `master_productos_so` table. All the data in the column will be lost.
  - You are about to drop the column `codigo_distribuidor` on the `master_productos_so` table. All the data in the column will be lost.
  - You are about to drop the column `codigo_vendedor_distribuidor` on the `master_productos_so` table. All the data in the column will be lost.
  - You are about to drop the column `descripcion_producto` on the `master_productos_so` table. All the data in the column will be lost.
  - You are about to drop the column `dni_vendedor_distribuidor` on the `master_productos_so` table. All the data in the column will be lost.
  - You are about to drop the column `fecha` on the `master_productos_so` table. All the data in the column will be lost.
  - You are about to drop the column `mercado_categoria_tipo` on the `master_productos_so` table. All the data in the column will be lost.
  - You are about to drop the column `nombre_vendedor_distribuidor` on the `master_productos_so` table. All the data in the column will be lost.
  - You are about to drop the column `nro_factura` on the `master_productos_so` table. All the data in the column will be lost.
  - You are about to drop the column `precio_total_sin_igv` on the `master_productos_so` table. All the data in the column will be lost.
  - You are about to drop the column `precio_unitario` on the `master_productos_so` table. All the data in the column will be lost.
  - You are about to drop the column `razon_social` on the `master_productos_so` table. All the data in the column will be lost.
  - You are about to drop the column `ruc` on the `master_productos_so` table. All the data in the column will be lost.
  - You are about to drop the column `unidad_medida` on the `master_productos_so` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `master_productos_so` DROP FOREIGN KEY `master_productos_id_foreign`;

-- AlterTable
ALTER TABLE `master_productos_so` DROP COLUMN `cantidad`,
    DROP COLUMN `codigo_cliente`,
    DROP COLUMN `codigo_distribuidor`,
    DROP COLUMN `codigo_vendedor_distribuidor`,
    DROP COLUMN `descripcion_producto`,
    DROP COLUMN `dni_vendedor_distribuidor`,
    DROP COLUMN `fecha`,
    DROP COLUMN `mercado_categoria_tipo`,
    DROP COLUMN `nombre_vendedor_distribuidor`,
    DROP COLUMN `nro_factura`,
    DROP COLUMN `precio_total_sin_igv`,
    DROP COLUMN `precio_unitario`,
    DROP COLUMN `razon_social`,
    DROP COLUMN `ruc`,
    DROP COLUMN `unidad_medida`;

-- CreateTable
CREATE TABLE `ventas_so` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `pro_so_id` INTEGER UNSIGNED NULL,
    `codigo_distribuidor` VARCHAR(255) NULL,
    `fecha` VARCHAR(255) NULL,
    `nro_factura` VARCHAR(255) NULL,
    `codigo_cliente` VARCHAR(255) NULL,
    `ruc` VARCHAR(255) NULL,
    `razon_social` VARCHAR(255) NULL,
    `mercado_categoria_tipo` VARCHAR(255) NULL,
    `codigo_vendedor_distribuidor` VARCHAR(255) NULL,
    `dni_vendedor_distribuidor` VARCHAR(255) NULL,
    `nombre_vendedor_distribuidor` VARCHAR(255) NULL,
    `codigo_producto` VARCHAR(255) NULL,
    `descripcion_producto` VARCHAR(255) NULL,
    `cantidad` VARCHAR(255) NULL,
    `unidad_medida` VARCHAR(255) NULL,
    `precio_unitario` VARCHAR(255) NULL,
    `precio_total_sin_igv` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `master_productos_so` ADD CONSTRAINT `master_productos_so_id_foreign` FOREIGN KEY (`proid`) REFERENCES `master_productos`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ventas_so` ADD CONSTRAINT `ventas_so_id_foreign` FOREIGN KEY (`pro_so_id`) REFERENCES `master_productos_so`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;
