const { DataTypes } = require('sequelize');
const connection = require('./connectionSpider');

const Usuusuarios = connection.define('usuusuarios', {
    usuid : {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    tpuid : {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    perid : {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    estid : {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    usucumpleanios: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    usutelefono: {
        type: DataTypes.STRING,
        allowNull: true
    },
    usuimagen: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    usuusuario: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    usucorreo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    usucorreopersonal: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    usucontrasena: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    usutoken: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    usupaistodos: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.TIME,
        allowNull: true
    },
    updated_at: {
        type: DataTypes.TIME,
        allowNull: true,
    },
    usuaceptoterminos: {
        type: DataTypes.TIME,
        allowNull: true,
    },
    usucerrosesion: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    usufechalogin: {
        type: DataTypes.TIME,
        allowNull: true,
    },
    usucierreautomatico: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    usufechacaducidad: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    usupermisosespeciales: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
},{
    tableName: 'usuusuarios',
    timestamps: false
})

module.exports = Usuusuarios;