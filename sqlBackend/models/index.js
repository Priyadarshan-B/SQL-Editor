const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config.js').development;

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    dialectOptions: {
        multipleStatements: true
      }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./user')(sequelize, DataTypes);
db.StudentDatabase = require('./studentDatabase')(sequelize, DataTypes);

db.User.hasMany(db.StudentDatabase, { foreignKey: 'rollnumber', sourceKey: 'rollnumber' });
db.StudentDatabase.belongsTo(db.User, { foreignKey: 'rollnumber', targetKey: 'rollnumber' });

module.exports = db;
