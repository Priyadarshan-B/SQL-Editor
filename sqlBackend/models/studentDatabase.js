module.exports = (sequelize, DataTypes) => {
    const StudentDatabase = sequelize.define('StudentDatabase', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        rollnumber: {
            type: DataTypes.STRING,
            allowNull: false
        },
        databaseName: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    });

    return StudentDatabase;
};
