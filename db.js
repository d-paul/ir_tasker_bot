const {Pool,Client} = require('pg')
const connectionString = 'postgressql://postgres:123@localhost:5432/testdb'

const client = new Client({

    connectionString:connectionString
})

client.connect()

client.query('SELECT * from personal', (err,res)=>{
    console.log(err,res)
    client.end
})