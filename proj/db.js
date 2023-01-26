/*const {Pool,Client} = require('pg')
const connectionString = 'postgressql://postgres:123@localhost:5432/testdb'

const client = new Client({

    connectionString:connectionString
})

client.connect()

client.query('SELECT * from personal', (err,res)=>{
    console.log(err,res)
    client.end
})*/


const {Sequelize} = require('sequelize');

module.exports = new Sequelize(
    'testdb',
    'postgres',
    '123',
    {
        host:'localhost',
        port: '5432',
        dialect: 'postgres',
        define: {
            timestamps: false
          }
    }
)