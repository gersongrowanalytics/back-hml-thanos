/*
  Warnings:

  - You are about to alter the column `desde` on the `master_productos_so` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(50)`.

*/
-- AlterTable
ALTER TABLE `master_productos_so` ADD COLUMN `codigo_distribuidor` VARCHAR(255) NULL,
    ADD COLUMN `descripcion_producto` VARCHAR(255) NULL,
    ADD COLUMN `m_dt_id` INTEGER UNSIGNED NULL,
    ADD COLUMN `precio_unitario` VARCHAR(255) NULL,
    ADD COLUMN `ruc` VARCHAR(50) NULL,
    ADD COLUMN `s_mtd` VARCHAR(50) NULL,
    ADD COLUMN `s_ytd` VARCHAR(50) NULL,
    MODIFY `desde` VARCHAR(50) NULL;

-- AlterTable
ALTER TABLE `ventas_so` ADD COLUMN `m_dt_id` INTEGER UNSIGNED NULL;

-- AddForeignKey
ALTER TABLE `master_productos_so` ADD CONSTRAINT `master_distribuidoras_m_dt_id_foreign` FOREIGN KEY (`m_dt_id`) REFERENCES `master_distribuidoras`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ventas_so` ADD CONSTRAINT `master_distribuidoras_m_dt_id_ventas_so_foreign` FOREIGN KEY (`m_dt_id`) REFERENCES `master_distribuidoras`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;
