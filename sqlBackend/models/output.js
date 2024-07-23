module.exports = (sequelize, DataTypes) => {
    const SqlQuestion = sequelize.define('SqlQuestion', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        question: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'question',
            key: 'id'
          }
        },
        sample_output: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        output: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        status: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1
        }
      }, {
        tableName: 'sql_questions',
        timestamps: false,
        charset: 'utf8mb4',
        collate: 'utf8mb4_0900_ai_ci'
      });
      return SqlQuestion

}