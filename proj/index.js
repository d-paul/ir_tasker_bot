const TelegramBot = require('node-telegram-bot-api')
const { Query } = require('pg')
const { json } = require('stream/consumers')
const { getChatId } = require('./helpers')
const token = '5703563310:AAE0tmQJfBQ1zFJxlRy_u9fpo65Dne9dhrM'

//const debug = require('./helpers')
//const helpers = require('./helpers')

const sequelize = require('./db')
const personalModel = require('./models').personal
const personal = require('./models').personal
const reports = require('./models').reports
const { Op } = require('sequelize')
const cron = require('node-cron')
const { query } = require('./db')
const webAppUrl = 'https://ya.ru'
const {format} = require('date-fns')

console.log('bot has been started . . .')
const bot = new TelegramBot(token, { polling: true})
bot.on("polling_error", console.log);


bot.onText(/\/start/, msg => {
   
    const reqPhone = {
        reply_markup: {
            
            keyboard: [
                [{
                text: "Отправить мой номер",
                request_contact: true,
                remove_keyboard: true,
                
                }],
                ["Отмена"]
            ]
        }
    }  
      
    try{
        sequelize.authenticate( 
        sequelize.sync(),
        console.log('db  in')
        )

    } catch (e) { console.log('db  errors')}

    function check_id(){
        
        const isIdUnique = chat_id =>
            personalModel.findOne({ where: { chat_id} , attributes: ['chat_id'] })
            .then(token => token !== null)
            .then(isUnique => isUnique);

        const isIdUniqueAccess = access_level =>
            personalModel.findOne({ where: { [Op.and]: [{access_level},{chat_id:msg.chat.id}] } , attributes: ['chat_id'] })  
            .then(isIdUniqueAccess => isIdUniqueAccess);
    
        isIdUnique(msg.chat.id).then(isUnique => {
            if (isUnique) {
                bot.sendMessage(getChatId(msg), 'Вы можете начать работать с ботом')

                isIdUniqueAccess(1).then(isIdUniqueAccess => {
                    if (isIdUniqueAccess) {
                        bot.sendMessage(getChatId(msg), '1')
                    }
                    else{
                        bot.sendMessage(getChatId(msg), '!=1')
                        
                    }
                })
            }
            else{
                bot.sendMessage(getChatId(msg), 'Вас нет в списке, отправьте номер ', reqPhone)
                
                bot.once('contact', msg=>{
                    const telUser = msg.contact.phone_number.replace('+','')
                    
                    function check_num(){
    
                        const isIdUnique = number_phone =>
                            personalModel.findOne({ where: { number_phone} , attributes: ['number_phone'] })
                            .then(token => token !== null)
                            .then(isUnique => isUnique);
                    
                        isIdUnique(telUser).then(isUnique => {
                            if (isUnique) {
                                bot.sendMessage(getChatId(msg), 'Вы можете начать работать с ботом')
                                sequelize.query("UPDATE personals SET chat_id = $2 WHERE number_phone = $1", {
                                    bind:[telUser,msg.chat.id],
                                    model: personal,   
                                    mapToModel: true,
                                    type: Op.SELECT,
                                })
                                
                            }
                            else{
                                bot.sendMessage(getChatId(msg), 'Вас нет в списке, обратьтесь к администратору')
                            }
                        })
                    }
                    check_num()                   
                })
            }
        })
    }
    check_id()
})
 


        
        






    bot.once('message', (msg)=>{       
        const today = format(new Date(),'yyyy-MM-dd');  
        
        cron.schedule('23 14 * * 1-5', () =>{
        reports.create({
            tasks:"",
            fact: "",
            date: today,
            hours: 8,
            chat_id: msg.chat.id,
        })
   
    })

        cron.schedule('13 14 * * 1-5', () =>{  
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
            
                    sequelize.query("UPDATE reports SET tasks = $2 WHERE chat_id= $1 AND date = $3", {
                        bind:[msg.chat.id,tasks,today],
                        model: reports,   
                        mapToModel: true,
                        type: Op.SELECT,
                    })
                })
                bot.once('message', (msg)=>{
                    bot.sendMessage(getChatId(msg), 'ok',)  
                })
        
            } 

            else if (query.data === 'Сегодня не работаю'){
                bot.sendMessage(getChatId(msg), 'Введите причину',) 
                bot.once('message', (msg) =>{
                    this.tasks = 'Не работает, т.к: ' + msg.text
        
                    sequelize.query("UPDATE reports SET tasks = $2 WHERE chat_id= $1 AND date = $3", {
                        bind:[msg.chat.id,this.tasks,today],
                        model: reports,
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


    

    bot.once('message', (msg)=>{
        cron.schedule('23 17 * * 1-5', () =>{
             
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
                sequelize.query("UPDATE reports SET fact = $2 WHERE chat_id= $1 AND date = $3", {
                    bind:[msg.chat.id,this.tasks,today],
                    model: reports,
                    mapToModel: true,
                    type: Op.SELECT,
                }) 
            }
            if(query.data === 'Полный рабочий день'){
                bot.sendMessage(getChatId(msg), 'ok',)  
                
                const facts1 = 'Полный рабочий день, ' + this.facts
                sequelize.query("UPDATE reports SET fact = $2 WHERE chat_id = $1 AND date = $3", {
                    bind:[msg.chat.id,facts1,today],
                    model: reports,
                    mapToModel: true,
                    type: Op.SELECT,
                })            
            }
            else if (query.data === 'Ввести часы работы'){
                bot.sendMessage(getChatId(msg), 'Введи часы работы в формате ЧЧ:ММ - ЧЧ:ММ',)           
                bot.once('message', (msg)=>{                      
                    timework = 'Часы работы: ' + msg.text + '/ ' + this.facts
                    sequelize.query("UPDATE reports SET fact = $2 WHERE chat_id = $1 AND date = $3", {
                        bind:[msg.chat.id,timework,today],
                        model: reports,
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
            const isIdUnique = chat_id =>
                personalModel.findOne({ where: { chat_id} , attributes: ['chat_id'] })
                .then(token => token !== null)
                .then(isUnique => isUnique);

            const isIdUniqueAccess = access_level =>
                personalModel.findOne({ where: { [Op.and]: [{access_level},{chat_id:msg.chat.id}] } , attributes: ['chat_id'] })  
                .then(isIdUniqueAccess => isIdUniqueAccess);
        
            isIdUnique(msg.chat.id).then(isUnique => {
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
  
    
    









   
  