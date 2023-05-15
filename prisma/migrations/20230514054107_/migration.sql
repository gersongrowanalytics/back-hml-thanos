-- AlterTable
ALTER TABLE `master_productos_so` ADD COLUMN `proid` INTEGER UNSIGNED NULL;

-- AddForeignKey
ALTER TABLE `master_productos_so` ADD CONSTRAINT `master_productos_id_foreign` FOREIGN KEY (`proid`) REFERENCES `master_productos`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;
