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

async function createStudentDatabase(rollnumber, username, structureQuery) {
    const databaseName = `db_${rollnumber}`;
    const password = 'yes';

    try {
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

        const structureQueries = structureQuery.split(';').map(q => q.trim()).filter(q => q);

        for (const query of structureQueries) {
            await studentSequelize.query(query, { type: QueryTypes.RAW });
        }
        console.log(`Structure queries executed in database ${databaseName}.`);

        return databaseName;
    } catch (error) {
        console.error(`Error in creating database or executing structure queries: ${error.message}`);
        await dropStudentDatabase(databaseName, username);
        throw error;
    }
}

async function dropStudentDatabase(databaseName, username) {
    try {
        await sequelize.query(`DROP DATABASE IF EXISTS ${databaseName}`, { type: QueryTypes.RAW });
        console.log(`Database ${databaseName} dropped.`);
    } catch (error) {
        console.error(`Error dropping database ${databaseName}: ${error.message}`);
    }

    try {
        await sequelize.query(`DROP USER IF EXISTS '${username}'@'localhost'`, { type: QueryTypes.RAW });
        console.log(`User ${username} dropped.`);
    } catch (error) {
        console.error(`Error dropping user ${username}: ${error.message}`);
    }
}

app.post('/execute-query', async (req, res) => {
    const { rollnumber, structureQuery, answerQuery } = req.body;
    let databaseName;
    let username;

    try {
        let user = await User.findOne({ where: { rollnumber } });
        if (!user) {
            const name = `user_${rollnumber}`; // Example username format
            user = await User.create({ rollnumber, name, password: 'yes' });
            console.log(`User ${name} created.`);
        }

        username = user.name;
        databaseName = await createStudentDatabase(rollnumber, username, structureQuery);
        await StudentDatabase.upsert({ rollnumber, databaseName });

        const studentSequelize = new Sequelize(databaseName, username, 'yes', {
            host: 'localhost',
            dialect: 'mysql',
        });

        const answerQueries = answerQuery.split(';').map(q => q.trim()).filter(q => q);

        let results = [];
        for (const query of answerQueries) {
            const [result] = await studentSequelize.query(query, { type: QueryTypes.RAW });
            results.push(result);
        }

        const formattedResults = results.map(result => {
            if (result.length > 0) {
                const headers = Object.keys(result[0]).join(' | ');
                const rows = result.map(row => Object.values(row).join(' | ')).join('\n');
                return `${headers}\n${rows}`;
            } else {
                return 'No results';
            }
        }).join('\n\n');

        res.status(200).send({ formattedResults });
        console.log(formattedResults);

        console.log(`Queries executed successfully in database ${databaseName}.`);

        await dropStudentDatabase(databaseName, username);
        await StudentDatabase.destroy({ where: { rollnumber } });

    } catch (error) {
        console.error(error);
        if (databaseName && username) {
            await dropStudentDatabase(databaseName, username);
        }
        await StudentDatabase.destroy({ where: { rollnumber } });
        res.status(500).send(error.message);
    }
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
