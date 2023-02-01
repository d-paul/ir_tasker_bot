const sequelize = require('./db')
const {DataTypes} = require('sequelize')


const personal = sequelize.define('personal',
{
    personal_id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    tg_id:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    number_phone:{
        type: DataTypes.CHAR(12),
        allowNull: false
    },
    date_birth:{
        type: DataTypes.DATE,
        allowNull: false
    },
    full_name:{
        type:DataTypes.CHAR(100),
        allowNull: false
    },
    post:{
        type: DataTypes.CHAR(100),
        allowNull: false
    },
    team:{
        type: DataTypes.CHAR(100),
        allowNull: false
    },
    access_level:{
        type: DataTypes.SMALLINT,
        
    },
    password:{
        type: DataTypes.CHAR(50),
        
    },
    tasks:{
        type: DataTypes.CHAR(1000)
    }
}
)
module.exports = personal;