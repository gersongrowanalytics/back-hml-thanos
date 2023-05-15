-- CreateTable
CREATE TABLE `master_distribuidoras` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `codigo_dt` VARCHAR(255) NULL,
    `region` VARCHAR(100) NULL,
    `supervisor` VARCHAR(255) NULL,
    `localidad` VARCHAR(255) NULL,
    `nomb_dt` VARCHAR(255) NULL,
    `check_venta` VARCHAR(10) NULL,
    `nomb_cliente` VARCHAR(255) NULL,
    `latitud` VARCHAR(255) NULL,
    `longitud` VARCHAR(255) NULL,
    `oficina_two` VARCHAR(255) NULL,
    `subcanal` VARCHAR(255) NULL,
    `sap_solicitante` VARCHAR(255) NULL,
    `sap_destinatario` VARCHAR(255) NULL,
    `diferencial` VARCHAR(255) NULL,
    `canal_atencion` VARCHAR(255) NULL,
    `cod_solicitante` VARCHAR(255) NULL,
    `cod_destinatario` VARCHAR(255) NULL,
    `canal_trade` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `master_productos` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `cod_producto` VARCHAR(255) NULL,
    `nomb_producto` VARCHAR(255) NULL,
    `division` VARCHAR(255) NULL,
    `sector` VARCHAR(255) NULL,
    `categoria` VARCHAR(255) NULL,
    `subcategoria` VARCHAR(255) NULL,
    `segmento` VARCHAR(255) NULL,
    `presentacion` VARCHAR(255) NULL,
    `peso` VARCHAR(255) NULL,
    `paquetexbulto` VARCHAR(255) NULL,
    `unidadxpqte` VARCHAR(255) NULL,
    `metroxund` VARCHAR(255) NULL,
    `ean13` VARCHAR(255) NULL,
    `ean14` VARCHAR(255) NULL,
    `minund` VARCHAR(255) NULL,
    `estado` VARCHAR(255) NULL,
    `marco` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
