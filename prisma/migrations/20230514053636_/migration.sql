-- CreateTable
CREATE TABLE `master_productos_so` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
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
    `desde` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
