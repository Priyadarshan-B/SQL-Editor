
module.exports = (sequelize, DataTypes) => {
    const Question = sequelize.define('Question', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        question: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('0', '1'),
            defaultValue: '1',
            allowNull: false
        }
    }, {
        tableName: 'question',
        timestamps: false,
    });

    return Question;
};
