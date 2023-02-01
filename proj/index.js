const TelegramBot = require('node-telegram-bot-api')
const { Query } = require('pg')
const { json } = require('stream/consumers')
const { getChatId } = require('./helpers')
const token = '5703563310:AAE0tmQJfBQ1zFJxlRy_u9fpo65Dne9dhrM'

//const debug = require('./helpers')
//const keyboard =require('./keyboard')
//const kb = require('./keyboard_button')
//const { tel } = require('./keyboard')
//const helpers = require('./helpers')

const sequelize = require('./db')
const personalModel = require('./models')
const personal = require('./models')
const { Op } = require('sequelize')
const cron = require('node-cron')


console.log('bot has been started . . .')
const bot = new TelegramBot(token, { polling: true})



bot.onText(/\/start/, msg => {
   
const text = 'Привет '+ msg.from.first_name + ', Отправь номер для регистрации'
const reqPhone = {
    reply_markup: {
        one_time_keyboard: true,
        keyboard: [
            [{
                text: "Отправить мой номер",
                request_contact: true,
                one_time_keyboard: true,
                
            }],
            ["Отмена"]
        ]
    }
}
bot.sendMessage(getChatId(msg), text, reqPhone)
   
try{
sequelize.authenticate( 
sequelize.sync(),
console.log('db  in')
)

} catch (e) { console.log('db  errors')}
})
 
bot.once('contact',  msg=>{

function check(){

    const telUser = msg.contact.phone_number  
    
const isIdUnique = number_phone =>
  personalModel.findOne({ where: { number_phone} , attributes: ['personal_id'] })
    .then(token => token !== null)
    .then(isUnique => isUnique);

    const isIdUniqueAccess = access_level =>
  personalModel.findOne({ where: { [Op.and]: [{access_level},{number_phone:telUser}] } , attributes: ['personal_id'] })  
    .then(isIdUniqueAccess => isIdUniqueAccess);
    
    isIdUnique(telUser).then(isUnique => {
        if (isUnique) {
            bot.sendMessage(getChatId(msg), 'Вы можете начать работать с ботом')

            isIdUniqueAccess(1).then(isIdUniqueAccess => {
                    if (isIdUniqueAccess) {
                        bot.sendMessage(getChatId(msg), '1')
                    }
                    else{
                        bot.sendMessage(getChatId(msg), 'Введите пароль:')

                       bot.once('message', (msg) =>{
                            const pass = msg.text
                            
                        sequelize.query("UPDATE personals SET password = $2 WHERE number_phone = $1", {
                            bind:[telUser,pass],
                            model: personal,
                            mapToModel: true,
                            type: Op.SELECT,
                          })
                        
                        })
                        
                        bot.once('message', (msg) =>{
                         bot.sendMessage(getChatId(msg),' Пароль установлен ')   
                        }) 
                        
                    }
                })
        }
        else{
            bot.sendMessage(getChatId(msg), 'Вас нет в списке, обратьтесь к администратору')
        }
    })
}
check()
})






   
  