const sequelize = require('./db')
const {DataTypes} = require('sequelize')


const personal = sequelize.define('personal',
{
    number_phone:{
        type: DataTypes.CHAR(12),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    date_birth:{
        type: DataTypes.DATEONLY,
        
    },
    full_name:{
        type:DataTypes.CHAR(100),
        
    },
    post:{
        type: DataTypes.CHAR(100),
        
    },
    team:{
        type: DataTypes.CHAR(100),
        
    },
    access_level:{
        type: DataTypes.SMALLINT,
        
    },
    password:{
        type: DataTypes.CHAR(100),
        
    },
    active:{
        type: DataTypes.CHAR(1),
        
    },
    chat_id:{
        type: DataTypes.BIGINT,
        
    },
},

)
module.exports.personal = personal;

const reports = sequelize.define('reports',
{
    ID:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    tasks:{
        type: DataTypes.CHAR()
    },
    fact:{
        type: DataTypes.CHAR()
    },
    hours:{
        type: DataTypes.INTEGER
    },
    date:{
        type: DataTypes.DATEONLY
    },
    worked:{
        type: DataTypes.CHAR()
    },
    chat_id:{
        type: DataTypes.BIGINT,
        
    },

},
{freezeTableName: true},
)
module.exports.reports = reports;