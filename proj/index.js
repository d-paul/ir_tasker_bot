const TelegramBot = require('node-telegram-bot-api')
const { Query } = require('pg')
const { json } = require('stream/consumers')
const helpers = require('./helpers')
const { getChatId } = require('./helpers')

const token = '5703563310:AAE0tmQJfBQ1zFJxlRy_u9fpo65Dne9dhrM'
const debug = require('./helpers')
const keyboard =require('./keyboard')
const kb = require('./keyboard_button')

const sequelize = require('./db')
const personalModel = require('./models')
const { tel } = require('./keyboard')
const personal = require('./models')



console.log('bot has been started')

const bot = new TelegramBot(token, { polling: true})




/*bot.on('message', msg => {
    switch(msg.text){
        case kb.sendTel.phone:
            break
    } 
})*/
 




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
bot.sendMessage(helpers.getChatId(msg), text, reqPhone)
   


try{
sequelize.authenticate(
sequelize.sync(),
console.log('db  in')
)


} catch (e) {
    console.log('db  errors')
}

})
 
bot.on('contact', (msg)=>{
    const telUser = msg.contact.phone_number  
    
    
   
    
    isIdUnique(telUser).then(isUnique => {
        if (isUnique) {
            bot.sendMessage(helpers.getChatId(msg), 'Вы можете начать работать с ботом')
        }
        else{
            bot.sendMessage(helpers.getChatId(msg), 'Вас нет в списке, обратьтесь к администратору')
        }
    })
     
})

const isIdUnique = number_phone =>
  personalModel.findOne({ where: { number_phone} , attributes: ['personal_id'] })
    .then(token => token !== null)
    .then(isUnique => isUnique);


  