-- CreateTable
CREATE TABLE `perpersonas` (
    `perid` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `pertipodocumento` VARCHAR(255) NULL,
    `pernumerodocumentoidentidad` VARCHAR(255) NULL,
    `pernombrecompleto` VARCHAR(255) NOT NULL,
    `pernombre` VARCHAR(255) NULL,
    `perapellidopaterno` VARCHAR(255) NULL,
    `perapellidomaterno` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`perid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estestados` (
    `estid` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `estnombre` VARCHAR(255) NOT NULL,
    `estdescripcion` TEXT NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`estid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tputiposusuarios` (
    `tpuid` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `estid` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `tpunombre` VARCHAR(255) NOT NULL,
    `tpuprivilegio` VARCHAR(255) NULL,
    `tpuid_padre` INTEGER UNSIGNED NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`tpuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paipaises` (
    `paiid` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `estid` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `painombre` VARCHAR(255) NOT NULL,
    `paiicono` VARCHAR(255) NOT NULL,
    `paiiconocircular` VARCHAR(255) NOT NULL,
    `paiiconomas` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`paiid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paupaisesusuarios` (
    `pauid` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `paiid` INTEGER UNSIGNED NOT NULL,
    `usuid` INTEGER UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`pauid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuusuarios` (
    `usuid` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `tpuid` INTEGER UNSIGNED NOT NULL,
    `perid` INTEGER UNSIGNED NOT NULL,
    `estid` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `usucumpleanios` VARCHAR(255) NULL,
    `usufechaincorporacion` TIMESTAMP(0) NULL,
    `usutelefono` VARCHAR(255) NULL,
    `usuimagen` VARCHAR(255) NULL,
    `usuusuario` VARCHAR(255) NULL,
    `usuarea` VARCHAR(255) NULL,
    `usucorreo` VARCHAR(255) NULL,
    `usucorreopersonal` VARCHAR(255) NULL,
    `usucontrasena` VARCHAR(255) NULL,
    `usutoken` VARCHAR(255) NOT NULL,
    `usupaistodos` BOOLEAN NOT NULL DEFAULT false,
    `usupermisosespeciales` BOOLEAN NOT NULL DEFAULT false,
    `usuaceptoterminos` TIMESTAMP(0) NULL,
    `usucerrosesion` BOOLEAN NOT NULL DEFAULT false,
    `usufechalogin` DATE NULL,
    `usucierreautomatico` BOOLEAN NOT NULL DEFAULT false,
    `usufechacaducidad` DATE NULL,
    `usuabreviacion` VARCHAR(5) NULL,
    `usubackground` VARCHAR(10) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`usuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pempermisos` (
    `pemid` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `tpeid` INTEGER UNSIGNED NOT NULL,
    `paiid` INTEGER UNSIGNED NOT NULL,
    `pemnombre` VARCHAR(255) NOT NULL,
    `pemslug` VARCHAR(255) NOT NULL,
    `pemruta` VARCHAR(255) NULL,
    `pemespecial` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`pemid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tpetipospermisos` (
    `tpeid` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `tpenombre` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`tpeid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tuptiposusuariospermisos` (
    `tupid` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `pemid` INTEGER UNSIGNED NULL,
    `tpuid` INTEGER UNSIGNED NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`tupid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tpatiposauditorias` (
    `tpaid` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `tpanombre` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`tpaid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audauditorias` (
    `audid` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `tpaid` INTEGER UNSIGNED NOT NULL,
    `usuid` INTEGER UNSIGNED NULL,
    `audip` VARCHAR(255) NULL,
    `audjsonentrada` TEXT NOT NULL,
    `audjsonsalida` TEXT NOT NULL,
    `auddescripcion` TEXT NOT NULL,
    `audaccion` VARCHAR(255) NOT NULL,
    `audruta` VARCHAR(255) NOT NULL,
    `audlog` TEXT NULL,
    `audpk` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`audid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tputiposusuarios` ADD CONSTRAINT `tputiposusuarios_estid_foreign` FOREIGN KEY (`estid`) REFERENCES `estestados`(`estid`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `paipaises` ADD CONSTRAINT `paipaises_estid_foreign` FOREIGN KEY (`estid`) REFERENCES `estestados`(`estid`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `paupaisesusuarios` ADD CONSTRAINT `paupaisesusuarios_paiid_foreign` FOREIGN KEY (`paiid`) REFERENCES `paipaises`(`paiid`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `paupaisesusuarios` ADD CONSTRAINT `paupaisesusuarios_usuid_foreign` FOREIGN KEY (`usuid`) REFERENCES `usuusuarios`(`usuid`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `usuusuarios` ADD CONSTRAINT `usuusuarios_estid_foreign` FOREIGN KEY (`estid`) REFERENCES `estestados`(`estid`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `usuusuarios` ADD CONSTRAINT `usuusuarios_perid_foreign` FOREIGN KEY (`perid`) REFERENCES `perpersonas`(`perid`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `usuusuarios` ADD CONSTRAINT `usuusuarios_tpuid_foreign` FOREIGN KEY (`tpuid`) REFERENCES `tputiposusuarios`(`tpuid`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pempermisos` ADD CONSTRAINT `pempermisos_paiid_foreign` FOREIGN KEY (`paiid`) REFERENCES `paipaises`(`paiid`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pempermisos` ADD CONSTRAINT `pempermisos_tpeid_foreign` FOREIGN KEY (`tpeid`) REFERENCES `tpetipospermisos`(`tpeid`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tuptiposusuariospermisos` ADD CONSTRAINT `tuptiposusuariospermisos_pemid_foreign` FOREIGN KEY (`pemid`) REFERENCES `pempermisos`(`pemid`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tuptiposusuariospermisos` ADD CONSTRAINT `tuptiposusuariospermisos_tpuid_foreign` FOREIGN KEY (`tpuid`) REFERENCES `tputiposusuarios`(`tpuid`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `audauditorias` ADD CONSTRAINT `audauditorias_tpaid_foreign` FOREIGN KEY (`tpaid`) REFERENCES `tpatiposauditorias`(`tpaid`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `audauditorias` ADD CONSTRAINT `audauditorias_usuid_foreign` FOREIGN KEY (`usuid`) REFERENCES `usuusuarios`(`usuid`) ON DELETE SET NULL ON UPDATE RESTRICT;
