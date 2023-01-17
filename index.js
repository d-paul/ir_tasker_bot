const TelegramBot = require('node-telegram-bot-api')

const token = '5703563310:AAE0tmQJfBQ1zFJxlRy_u9fpo65Dne9dhrM'
const debug = require('./helpers')
console.log('bot has been started')

const bot = new TelegramBot(token, {polling: {
    interval: 300,
    autoStart: true,
    params: {timeout: 10}
}})

bot.on('callback_query', query => {

const {chat, message_id, text} = query.message

switch (query.data){
    case 'Yes':
       
        bot.sendMessage(chat.id, 'Какие на сегодня задачи?')
//        bot.forwardMessage(chat.id, куда, message_id)
        break
    case 'No':
 
        bot.sendMessage(chat.       id, 'А почему?')
//        bot.forwardMessage(chat.id, куда, message_id)  
        break     
}

bot.answerCallbackQuery({
    callback_query_id: query.id
})

})

const inline_keyboard = [
    [
        {
            text: 'Давай',
            callback_data: 'Yes'
        },
        {
            text: 'Сегодня не смогу',
            callback_data: 'No'
        }
    ]
]

bot.onText(/\/start/, (msg, [source, match]) =>{
    const chatid = msg.chat.id

    bot.sendMessage(chatid, 'Привет, поработаем сегодня?', {
        reply_markup: {
            inline_keyboard
        } 
    })
})
