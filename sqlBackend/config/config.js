module.exports = {
    development: {
        username: 'root',
        password: 'root',
        database: 'dbms_test',
        host: '127.0.0.1',
        dialect: 'mysql',
        pool: {
            max: 10000,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
};
