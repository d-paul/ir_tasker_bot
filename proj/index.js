const TelegramBot = require('node-telegram-bot-api')
const { Query } = require('pg')
const { json } = require('stream/consumers')
const { getChatId } = require('./helpers')
const token = '5703563310:AAE0tmQJfBQ1zFJxlRy_u9fpo65Dne9dhrM'

//const debug = require('./helpers')
//const helpers = require('./helpers')

const sequelize = require('./db')
const personalModel = require('./models')
const personal = require('./models')
const { Op } = require('sequelize')
const cron = require('node-cron')
const { query } = require('./db')
const webAppUrl = 'https://ya.ru'

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
    const telUser = msg.contact.phone_number.replace('+','')

    function check(){
 
        const isIdUnique = number_phone =>
            personalModel.findOne({ where: { number_phone} , attributes: ['number_phone'] })
            .then(token => token !== null)
            .then(isUnique => isUnique);

        const isIdUniqueAccess = access_level =>
            personalModel.findOne({ where: { [Op.and]: [{access_level},{number_phone:telUser}] } , attributes: ['number_phone'] })  
            .then(isIdUniqueAccess => isIdUniqueAccess);
    
        isIdUnique(telUser).then(isUnique => {
            if (isUnique) {
                bot.sendMessage(getChatId(msg), 'Вы можете начать работать с ботом')

                isIdUniqueAccess(1).then(isIdUniqueAccess => {
                    if (isIdUniqueAccess) {
                        bot.sendMessage(getChatId(msg), '1')
                    }
                    else{
                        bot.sendMessage(getChatId(msg), 'Установите пароль:')

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

    bot.once('message', (msg)=>{
        cron.schedule('0-35 15 * * 1-5', () =>{

            const morning = {
        reply_markup: {
            
            inline_keyboard: [
                [{
                    text: 'Ввести план на день',
                    callback_data: 'Ввести план на день'
                },{
                    text: 'Сегодня не работаю',
                    callback_data: 'Сегодня не работаю'
                }]
            ]
        }
            }
            bot.sendMessage(getChatId(msg),'Доброе утро! Что на сегодня запланировано?', morning)
   
        })
        bot.on('callback_query', (query) =>{
        
            if (query.data === 'Ввести план на день'){       
                bot.sendMessage(getChatId(msg), 'Жду',)           
                bot.once('message', (msg)=>{            
                    var tasks = msg.text
            
                    sequelize.query("UPDATE personals SET tasks = $2 WHERE number_phone = $1", {
                        bind:[telUser,tasks],
                        model: personal,   
                        mapToModel: true,
                        type: Op.SELECT,
                    })
                })
        
            } 

            else if (query.data === 'Сегодня не работаю'){
                bot.sendMessage(getChatId(msg), 'Введите причину',) 
                bot.once('message', (msg) =>{
                    this.tasks = 'Не работает, т.к: ' + msg.text
        
                    sequelize.query("UPDATE personals SET tasks = $2 WHERE number_phone = $1", {
                        bind:[telUser,this.tasks],
                        model: personal,
                        mapToModel: true,
                        type: Op.SELECT,
                    })   
                })
            }
        })
    })



    bot.once('message', (msg)=>{
        cron.schedule('11 18 * * 1-5', () =>{
             
            const evening = {
            reply_markup: {
                
                inline_keyboard: [
                    [{
                        text: 'Ввести факт',
                        callback_data: 'Ввести факт'
                    },{
                        text: 'Сегодня не работал',
                        callback_data: 'Сегодня не работал'
                    }]
                ]
            }
            }
            bot.sendMessage(getChatId(msg),'Готов отчитаться за день?', evening)
       
        })
        bot.on('callback_query',  async (query) =>{
            
            const timess = {
                reply_markup: {               
                    inline_keyboard: [
                        [{
                            text: 'Полный рабочий день',
                            callback_data: 'Полный рабочий день'
                        },{
                            text: 'Ввести часы работы',
                            callback_data: 'Ввести часы работы'
                        }]
                    ]
            }
            }
            if (query.data === 'Ввести факт'){       
                bot.sendMessage(getChatId(msg), 'Жду',)           
                bot.once('message', (msg)=>{                      
                    this.facts = msg.text 
                })                              
                bot.once('message', (msg)=>{
                    bot.sendMessage(getChatId(msg), 'У тебы был полный рабочий день?', timess) 
                })
            }
            else if (query.data === 'Сегодня не работал'){
                bot.sendMessage(getChatId(msg), 'ok',)  
                sequelize.query("UPDATE personals SET fact = $2 WHERE number_phone = $1", {
                    bind:[telUser,this.tasks],
                    model: personal,
                    mapToModel: true,
                    type: Op.SELECT,
                }) 
            }
            if(query.data === 'Полный рабочий день'){
                bot.sendMessage(getChatId(msg), 'ok',)  
                
                const facts1 = 'Полный рабочий день, ' + this.facts
                sequelize.query("UPDATE personals SET fact = $2 WHERE number_phone = $1", {
                    bind:[telUser,facts1],
                    model: personal,
                    mapToModel: true,
                    type: Op.SELECT,
                })            
            }
            else if (query.data === 'Ввести часы работы'){
                bot.sendMessage(getChatId(msg), 'Введи часы работы в формате ЧЧ:ММ - ЧЧ:ММ',)           
                bot.once('message', (msg)=>{                      
                    timework = 'Часы работы: ' + msg.text + '/ ' + this.facts
                    sequelize.query("UPDATE personals SET fact = $2 WHERE number_phone = $1", {
                        bind:[telUser,timework],
                        model: personal,
                        mapToModel: true,
                        type: Op.SELECT,
                      })
                })
                bot.once('message', (msg)=>{
                    bot.sendMessage(getChatId(msg), 'ok',)  
                })
            }                
        })   
    })
    
    bot.onText(/\/reports/, msg => {
        function rep(){       
            const isIdUnique = number_phone =>
                personalModel.findOne({ where: { number_phone} , attributes: ['number_phone'] })
                .then(token => token !== null)
                .then(isUnique => isUnique);

            const isIdUniqueAccess = access_level =>
                personalModel.findOne({ where: { [Op.and]: [{access_level},{number_phone:telUser}] } , attributes: ['number_phone'] })  
                .then(isIdUniqueAccess => isIdUniqueAccess);
        
            isIdUnique(telUser).then(isUnique => {
                if (isUnique) {
                    isIdUniqueAccess(1).then(isIdUniqueAccess => {
                        if (isIdUniqueAccess) {
                            bot.sendMessage(getChatId(msg), 'Недостаточно прав')
                        }
                        else{
                            bot.sendMessage(getChatId(msg), 'Нажмите на кнопку для просмотра отчетов', {
                                reply_markup:{
                                    inline_keyboard:[
                                        [{text: 'Просмотр отчетов', web_app:{url: webAppUrl}}]
                                    ]
                                }
                            })                    
                        }
                    })
                }
                else{
                    bot.sendMessage(getChatId(msg), 'Вас нет в списке, обратьтесь к администратору')
                }
            })
        }
        rep()
        
       
    })   
    
    
    



})






   
  