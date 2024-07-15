const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sequelize, User, StudentDatabase } = require('./models');
const { QueryTypes, Sequelize } = require('sequelize');

const app = express();
app.use(bodyParser.json());
app.use(cors());

sequelize.sync().then(() => {
    console.log('Database & tables created!');
});

const sampleJson = [
    { rollnumber: '7376221CS269', name: 'PRIYADARSHAN' },
];

async function createStudentDatabase(rollnumber, username) {
    const databaseName = `db_${rollnumber}`;
    const password = 'yes';

    await sequelize.query(`CREATE DATABASE IF NOT EXISTS ${databaseName}`, { type: QueryTypes.RAW });
    console.log(`Database ${databaseName} created.`);

    await sequelize.query(`CREATE USER IF NOT EXISTS '${username}'@'localhost' IDENTIFIED BY '${password}'`, { type: QueryTypes.RAW });
    await sequelize.query(`GRANT ALL PRIVILEGES ON ${databaseName}.* TO '${username}'@'localhost'`, { type: QueryTypes.RAW });
    await sequelize.query(`FLUSH PRIVILEGES`, { type: QueryTypes.RAW });
    console.log(`User ${username} created/updated and privileges granted.`);

    const studentSequelize = new Sequelize(databaseName, username, password, {
        host: 'localhost',
        dialect: 'mysql',
    });

    await studentSequelize.query(`CREATE TABLE IF NOT EXISTS sample_table (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) UNIQUE)`, { type: QueryTypes.RAW });
    console.log(`Sample table created in database ${databaseName}.`);

    return databaseName;
}

async function dropStudentDatabase(databaseName, username) {
    await sequelize.query(`DROP DATABASE IF EXISTS ${databaseName}`, { type: QueryTypes.RAW });
    console.log(`Database ${databaseName} dropped.`);

    await sequelize.query(`DROP USER IF EXISTS '${username}'@'localhost'`, { type: QueryTypes.RAW });
    console.log(`User ${username} dropped.`);
}

app.post('/execute-query', async (req, res) => {
    const { rollnumber, query } = req.body;
    try {
        const userJson = sampleJson.find(user => user.rollnumber === rollnumber);
        if (!userJson) {
            return res.status(404).send('User not found.');
        }

        let user = await User.findOne({ where: { rollnumber } });
        if (!user) {
            user = await User.create({ rollnumber, name: userJson.name, password: 'yes' }); // Default password
            console.log(`User ${userJson.name} created.`);
        }

        const databaseName = await createStudentDatabase(rollnumber, user.name);
        await StudentDatabase.upsert({ rollnumber, databaseName });

        const studentSequelize = new Sequelize(databaseName, user.name, 'yes', {
            host: 'localhost',
            dialect: 'mysql',
        });

        const queries = query.split(';').map(q => q.trim()).filter(q => q);

        let results = [];
        for (const q of queries) {
            const [result] = await studentSequelize.query(q, { type: QueryTypes.RAW });
            results.push(result);
        }

        // Format the result as a table structure or separated by '|'
        const formattedResults = results.map(result => {
            if (result.length > 0) {
                const headers = Object.keys(result[0]).join(' | ');
                const rows = result.map(row => Object.values(row).join(' | ')).join('\n');
                return `${headers}`+ "\n"+ `${rows}`;
            } else {
                return 'No results';
            }
        }).join('\n\n');

        res.status(200).send({formattedResults});
        console.log(formattedResults)

        console.log(`Queries executed successfully in database ${databaseName}.`);

        await dropStudentDatabase(databaseName, user.name);
        await StudentDatabase.destroy({ where: { rollnumber } });

    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
