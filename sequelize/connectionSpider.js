const Sequelize = require('sequelize');

const sequelizeSpider = new Sequelize('spider', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
})

module.exports = sequelizeSpider