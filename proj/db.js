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
    'postgres://grimksi:4QbYXDPrdy9k@ep-wispy-heart-761564.eu-central-1.aws.neon.tech/neondb?ssl=true',
    {
        host:'ep-wispy-heart-761564.eu-central-1.aws.neon.tech',
        port: '5432',
        dialect: 'postgres',
        define: {
            timestamps: false
          }
    }
)