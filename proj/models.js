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
    chat_id:{
        type: DataTypes.CHAR(20),
        
    },
    active:{
        type: DataTypes.CHAR(1),
        
    },
}
)
module.exports = personal;