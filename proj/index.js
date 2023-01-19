const TelegramBot = require('node-telegram-bot-api')
const helpers = require('./helpers')
const { getChatId } = require('./helpers')

const token = '5703563310:AAE0tmQJfBQ1zFJxlRy_u9fpo65Dne9dhrM'
const debug = require('./helpers')
const keyboard =require('./keyboard')
const kb = require('./keyboard_button')
console.log('bot has been started')



const bot = new TelegramBot(token, {
    polling: true})

bot.on('message', msg => {
    switch(msg.text){
        case kb.sendTel.phone:
            bot.sendMessage(helpers.getChatId(msg), 'sdsa')
            
            break
    } 
})
 

bot.onText(/\/start/, msg => {
const text = 'Привет '+ msg.from.first_name + ', Отправь номер для регистрации'
    bot.sendMessage(helpers.getChatId(msg), text, {
        reply_markup:{
           keyboard: keyboard.sendTel
        }
    })

})