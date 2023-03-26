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
    working:{
        type: DataTypes.CHAR(1),
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

const report_aprove = sequelize.define('report_aprove',
{
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    chat_id:{
        type: DataTypes.BIGINT
    },
    fact1:{
        type: DataTypes.CHAR()
    },
    hours1:{
        type: DataTypes.INTEGER
    },
    date1:{
        type: DataTypes.DATEONLY
    },
    worked1:{
        type: DataTypes.CHAR()
    },
    time_work1:{
        type: DataTypes.CHAR()
    },
    fact2:{
        type: DataTypes.CHAR()
    },
    hours2:{
        type: DataTypes.INTEGER
    },
    date2:{
        type: DataTypes.DATEONLY
    },
    worked2:{
        type: DataTypes.CHAR()
    },
    time_work2:{
        type: DataTypes.CHAR()
    },
    fact3:{
        type: DataTypes.CHAR()
    },
    hours3:{
        type: DataTypes.INTEGER
    },
    date3:{
        type: DataTypes.DATEONLY
    },
    worked3:{
        type: DataTypes.CHAR()
    },
    time_work3:{
        type: DataTypes.CHAR()
    },
    fact4:{
        type: DataTypes.CHAR()
    },
    hours4:{
        type: DataTypes.INTEGER
    },
    date4:{
        type: DataTypes.DATEONLY
    },
    worked4:{
        type: DataTypes.CHAR()
    },
    time_work4:{
        type: DataTypes.CHAR()
    },
    fact5:{
        type: DataTypes.CHAR()
    },
    hours5:{
        type: DataTypes.INTEGER
    },
    date5:{
        type: DataTypes.DATEONLY
    },
    worked5:{
        type: DataTypes.CHAR()
    },
    time_work5:{
        type: DataTypes.CHAR()
    }
},
{freezeTableName: true}
)
module.exports.report_aprove = report_aprove;

const vacation_aprove = sequelize.define('vacation_aprove',
{
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    chat_id:{
        type: DataTypes.BIGINT
    },
    start:{
        type: DataTypes.DATEONLY
    },
    end:{
        type: DataTypes.DATEONLY
    },
    status:{
        type: DataTypes.CHAR
    }
},
{freezeTableName: true}
)
module.exports.vacation_aprove = vacation_aprove;