const TelegramBot = require('node-telegram-bot-api')
const { Query } = require('pg')
const { json } = require('stream/consumers')
const { getChatId } = require('./helpers')
const token = '6284064559:AAHxBH9ohl-gXbyfhxwGm0I5Td9m-KOsHJo' //'5703563310:AAE0tmQJfBQ1zFJxlRy_u9fpo65Dne9dhrM'

//const debug = require('./helpers')
//const helpers = require('./helpers')

const sequelize = require('./db')
const personalModel = require('./models').personal
const personal = require('./models').personal
const reports = require('./models').reports
const { Op } = require('sequelize')
const {QueryTypes} = require('sequelize')
const cron = require('node-cron')
const { query } = require('./db')
const webAppUrl = 'https://41c1-109-198-99-138.eu.ngrok.io/'
const {format, intervalToDuration} = require('date-fns')
const { default: getDay } = require('date-fns/getDay')

console.log('bot has been started . . .')
const bot = new TelegramBot(token, { polling: true})
bot.on("polling_error", console.log);


//Тут я кароче че-то делаю доброе утро

let reply1 = new Map()
let reply2 = new Map()
let reply3 = new Map()
let reply4 = new Map()


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

const WeekReport = {
    reply_markup: {               
        inline_keyboard: [
            [{
                text: 'Подтвердить',
                callback_data: 'Подтвердить'
            },{
                text: 'Есть ошибки', web_app:{url: webAppUrl},
                
            }]
        ]
    }
}
//Берет ChatId из любого сообщения (по идее)
bot.on('message', (msg)=>{
this.msgss = msg.chat.id
})
//факт за неделю
cron.schedule('27 0 * * *',async ()=>{
    var chat_ids = this.msgss
    
    var abs = await []
    await reports.findAll({
        attributes: ['fact', 'date'],
        order: ['date'], 
        where:{
            chat_id: chat_ids, 
            date:{
                [Op.and]:{ 
                    [Op.gte]:format(new Date((new Date()).valueOf() - 1000*60*60*24*7),'yyyy-MM-dd'),  
                    [Op.lt]: format(new Date(),'yyyy-MM-dd')
                }
            }
        }, 
        raw: true 
    }) 
    .then(report1=>{
        report1.forEach( rep => {
            const dateWithWeekday = new Date(rep.date).toLocaleString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
            abs += dateWithWeekday + '\n' + ' ' + rep.fact +'\n' + '\n'
        }) 
    })
    .catch(console.error); 
    await bot.sendMessage(chat_ids, 'Твой отчёт за неделю:')
    await bot.sendMessage(chat_ids, abs, WeekReport) 
    await bot.sendMessage(chat_ids, 'Если все в порядке - нажмите "Подтвердить". Если нет - нажмите "Есть ошибки" для отправки уведомления')
    bot.on('callback_query', async (query)=>{
        if (query.data === 'Подтвердить'){
            bot.sendMessage(chat_ids, 'Принято')
        }
        
    })
})
//Факт за неделю командой
bot.onText(/\/weeks/,async msg => { 
    var abs = await []
    await reports.findAll({
        attributes: ['fact', 'date'],
        order: ['date'], 
        where:{
            chat_id: msg.chat.id, 
            date:{
                [Op.and]:{ 
                    [Op.gte]:format(new Date((new Date()).valueOf() - 1000*60*60*24*7),'yyyy-MM-dd'),  
                    [Op.lt]: format(new Date(),'yyyy-MM-dd')
                }
            }
        }, 
        raw: true 
    }) 
    .then(report1=>{
        report1.forEach( rep => {
            const dateWithWeekday = new Date(rep.date).toLocaleString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
            abs += dateWithWeekday + '\n' + ' ' + rep.fact +'\n' + '\n'
        }) 
    })
    .catch(console.error); 
    await bot.sendMessage(msg.chat.id, 'Твой отчёт за неделю:')
    await bot.sendMessage(msg.chat.id, abs, WeekReport) 
    await bot.sendMessage(msg.chat.id, 'Если все в порядке - нажмите "Подтвердить". Если нет - нажмите "Есть ошибки" для отправки уведомления')
    bot.on('callback_query', async (query)=>{
        if (query.data === 'Подтвердить'){
            bot.sendMessage(msg.chat.id, 'Принято')
        }
        
    })
})

//Создание отчетов
cron.schedule('35 13 * * 1-5', () =>{  
    personal.findAll({where:{active: "Y", chat_id: {[Op.not]: null}}, raw: true })
    .then(user=>{
    user.forEach(item =>
        sequelize.query("INSERT INTO reports(date, chat_id, worked) SELECT $1, $2, 'N' WHERE NOT EXISTS (SELECT * FROM reports WHERE date = $1 AND chat_id = $2) AND EXISTS (SELECT * FROM personals WHERE chat_id = $2)", {
            bind:[format(new Date(),'yyyy-MM-dd'),item.chat_id],
            model: reports,   
            mapToModel: true,
            type: Op.SELECT,
        })
    )
    }).catch(err=>console.log(err));
})

//План
cron.schedule('0 10 * * 1-5', () =>{  
    reports.findAll({where:{tasks: null, date: format(new Date(),'yyyy-MM-dd')}, raw: true })
    .then(user=>{
        user.forEach(item => bot.sendMessage(item.chat_id, 'Доброе утро! Что на сегодня запланировано?', morning));
    }).catch(err=>console.log(err));
})

//Факт
cron.schedule('0 19 * * 1-5', () =>{            
    reports.findAll({where:{fact: null, date: format(new Date(),'yyyy-MM-dd')}, raw: true })
    .then(user=>{
        user.forEach(item => bot.sendMessage(item.chat_id, 'Готов отчитаться за день?', evening));
    }).catch(err=>console.log(err));
})

//Реакция на клавы
bot.on('callback_query', (query) =>{
    if (query.data === 'Ввести план на день'){     
        bot.sendMessage(query.message.chat.id, 'жду', {
            reply_markup: JSON.stringify({ force_reply: true }),
        }).then(msg => {
            bot.removeReplyListener(reply1.get(query.message.chat.id));
            reply1.set(query.message.chat.id, 
                bot.onReplyToMessage(msg.chat.id, msg.message_id, reply => {
                    sequelize.query("UPDATE reports SET tasks = $2 WHERE chat_id= $1 AND date = $3", {
                        bind:[reply.chat.id,reply.text,format(new Date(),'yyyy-MM-dd')],
                        model: reports,   
                        mapToModel: true,
                        type: Op.SELECT,
                    });
                    bot.sendMessage(query.message.chat.id, 'ok',);
                    bot.removeReplyListener(reply1.get(query.message.chat.id));
                    reply1.delete(query.message.chat.id);
                })
            )
        }) 
    } 
    else if (query.data === 'Сегодня не работаю'){
        bot.sendMessage(query.message.chat.id, 'Введите причину', {
            reply_markup: JSON.stringify({ force_reply: true }),
        }).then(msg => {
            bot.removeReplyListener(reply2.get(query.message.chat.id));
            reply2.set(query.message.chat.id, 
                bot.onReplyToMessage(msg.chat.id, msg.message_id, reply => {
                    sequelize.query("UPDATE reports SET fact = $2 WHERE chat_id= $1 AND date = $3", {
                        bind:[reply.chat.id,reply.text,format(new Date(),'yyyy-MM-dd')],
                        model: reports,
                        mapToModel: true,
                        type: Op.SELECT,
                    });
                    bot.sendMessage(query.message.chat.id, 'ok',);
                    bot.removeReplyListener(reply2.get(query.message.chat.id));
                    reply2.delete(query.message.chat.id);
                })
            )     
        })
    }
    else if (query.data === 'Ввести факт'){  
        bot.sendMessage(query.message.chat.id, 'Жду', {
            reply_markup: JSON.stringify({ force_reply: true }),
        }).then(msg => { 
            bot.removeReplyListener(reply3.get(query.message.chat.id)); 
            reply3.set(query.message.chat.id,
                bot.onReplyToMessage(msg.chat.id, msg.message_id, reply => {
                    sequelize.query("UPDATE reports SET fact = $2, worked = 'Y' WHERE chat_id= $1 AND date = $3", {
                        bind:[reply.chat.id,reply.text,format(new Date(),'yyyy-MM-dd')],
                        model: reports,
                        mapToModel: true,
                        type: Op.SELECT,
                    });
                    const timess = {
                        reply_markup: {               
                            inline_keyboard: [
                                [{
                                    text: 'Полный рабочий день',
                                    callback_data: 'Полный рабочий день'
                                },{
                                    text: 'Ввести часы работы',
                                    web_app:{url: webAppUrl+'/clock.php?date='+format(new Date(),'yyyy-MM-dd'), hide:true}
                                    
                                }]
                            ]
                        }
                    }
                    bot.sendMessage(query.message.chat.id, 'У тебы был полный рабочий день?', timess);
                    bot.removeReplyListener(reply3.get(query.message.chat.id));
                    reply3.delete(query.message.chat.id);
                })
            )
        })                             
    }
    else if (query.data === 'Сегодня не работал'){
        bot.sendMessage(query.message.chat.id, 'Введите причину', {
            reply_markup: JSON.stringify({ force_reply: true }),
        }).then(msg => { 
            bot.removeReplyListener(reply4.get(query.message.chat.id));
            reply4.set(query.message.chat.id,     
                bot.onReplyToMessage(msg.chat.id, msg.message_id, reply => {
                    sequelize.query("UPDATE reports SET fact = $2 WHERE chat_id= $1 AND date = $3", {
                        bind:[reply.chat.id,reply.text,format(new Date(),'yyyy-MM-dd')],
                        model: reports,
                        mapToModel: true,
                        type: Op.SELECT,
                    });
                    bot.sendMessage(query.message.chat.id, 'ok',);
                    bot.removeReplyListener(reply4.get(query.message.chat.id));
                    reply4.delete(query.message.chat.id);
                })
            )
        }) 
    }
    else if(query.data === 'Полный рабочий день'){  
        sequelize.query("UPDATE reports SET hours = '8' WHERE chat_id = $1 AND date = $2", {
            bind:[query.message.chat.id,format(new Date(),'yyyy-MM-dd')],
            model: reports,
            mapToModel: true,
            type: Op.SELECT,
        });
        bot.sendMessage(query.message.chat.id, 'ok',);        
    }
    bot.editMessageReplyMarkup({reply_markup: JSON.stringify({keyboard: []})}, {chat_id: query.message.chat.id, message_id: query.message.message_id});
})
//Ввод плана командой
bot.onText(/\/workstart/, async msg => {
    if(new Date().getDay() != (6 || 0)){
        await sequelize.query("INSERT INTO reports(date, chat_id, worked) SELECT $1, $2, 'N' WHERE NOT EXISTS (SELECT * FROM reports WHERE date = $1 AND chat_id = $2) AND EXISTS (SELECT * FROM personals WHERE chat_id = $2 AND active = 'Y')", {
            bind:[format(new Date(),'yyyy-MM-dd'),msg.chat.id],
            model: reports,   
            mapToModel: true,
            type: Op.SELECT,
        });
        await reports.findOne({where:{chat_id: msg.chat.id, date: format(new Date(),'yyyy-MM-dd')}, raw: true })
        .then(user=>{
            if (user && user.tasks == null && user.fact == null){
                bot.sendMessage(user.chat_id, 'Доброе утро! Что на сегодня запланировано?', morning);
            } else {
                bot.sendMessage(msg.chat.id, 'Не понял');
            }
        }).catch(err=>console.log(err));
    } else {
        bot.sendMessage(msg.chat.id, 'Кто работа?');
    }
}) 
//Ввод факта командой
bot.onText(/\/workend/, async msg => {
    if(new Date().getDay() != (6 || 0)){
        await sequelize.query("INSERT INTO reports(date, chat_id, worked) SELECT $1, $2, 'N' WHERE NOT EXISTS (SELECT * FROM reports WHERE date = $1 AND chat_id = $2) AND EXISTS (SELECT * FROM personals WHERE chat_id = $2 AND active = 'Y')", {
            bind:[format(new Date(),'yyyy-MM-dd'),msg.chat.id],
            model: reports,   
            mapToModel: true,
            type: Op.SELECT,
        });
        await reports.findOne({where:{chat_id: msg.chat.id, date: format(new Date(),'yyyy-MM-dd')}, raw: true })
        .then(user=>{
            if (user && user.fact == null){
                bot.sendMessage(user.chat_id, 'Готов отчитаться за день?', evening);
            } else {
                bot.sendMessage(msg.chat.id, 'Не понял');
            }
        }).catch(err=> console.log(err));
    } else {
        bot.sendMessage(msg.chat.id, 'Кто работа?');
    }
}) 


//Тут я кароче закончил что-то делать, спокойной ночи

//Блок авторизации
bot.onText(/\/start/, msg => {
    this.msgs = msg.chat.id
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
                        bot.sendMessage(getChatId(msg), 'Ваш уровень доступа: стандартный')
                    }
                    else{
                        bot.sendMessage(getChatId(msg), 'У васч есть права администратора')
                        
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
//Наверное надо убрать 
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
   //Редактирование последнего сообщения
bot.onText(/\/edit_last_message/, async (msg) => { 
    const { chat: { id } } = msg; 
    const maxId = await reports.max('ID',{where:{chat_id: id}})
    const lastReport = await reports.findOne({ 
        where: { chat_id: id }, 
        order: [['created_at', 'DESC']], 
        limit: 1, 
    }); 
    let lastMessage; 
    let column; 

    if (lastReport) { 
    
        if (lastReport.tasks && lastReport.fact) { 
            if (lastReport.tasks_updated_at > lastReport.fact_updated_at) { 
                lastMessage = lastReport.tasks; 
                column = 'tasks'; 
            } else { 
                lastMessage = lastReport.fact; 
                column = 'fact'; 
            } 
        } else if (lastReport.tasks) { 
            lastMessage = lastReport.tasks; 
            column = 'tasks'; 
        } else if (lastReport.fact) { 
            lastMessage = lastReport.fact; 
            column = 'fact'; 
        } 
    } 

    if (!lastMessage) { 
        return bot.sendMessage(id, 'Не найдено ни одного сообщения'); 
    } 

    bot.sendMessage(id, `Последнее сообщение: ${lastMessage}\nВведите новое сообщение:`, { 
        reply_markup: { 
        force_reply: true, 
        }, 
    }).then((reply) => { 
        bot.onReplyToMessage(id, reply.message_id, async (newMsg) => { 
            await reports.update( 
                { [column]: newMsg.text }, 
                { where: { chat_id: id, [column]: lastMessage , ID: maxId} } 
            ); 

        bot.sendMessage(id, `Сообщение отредактировано:\n${newMsg.text}`); 
        }); 
    }); 
});





//Вывод сотрудников твоей команды
// bot.onText(/\/employes/, async (msg) => {
//     const { chat: { id } } = msg;
//     const team = await personal.findOne({
//         where: { chat_id: id },
//         limit: 1,
//     });
  
//     if (!team) {
//         return bot.sendMessage(id, 'No team found for this chat.');
//     }
  
//     const employees = await personal.findAll({
//         attributes: ['full_name', 'post'],
//         order: ['full_name'],
//         where: {
//             team: team.team,
//         },
//         raw: true,
//     });
  
//     if (employees.length === 0) {
//         return bot.sendMessage(id, 'No employees found for this team.');
//     }
    
//     const employeeList = employees.map(emp => `${emp.full_name} (${emp.post})`).join('\n');
    
//     const message = `Твоя команда:\n${employeeList}`;
  
//     bot.sendMessage(id, message);
// });
  


bot.onText(/\/employes/, async (msg) => {
    const { chat: { id }, from: { id: userId } } = msg;
  
    // Check if user has access level of 1 or higher
    const user = await personal.findOne({ where: { chat_id: userId } });
    if (!user || user.access_level <= 1) {
      return bot.sendMessage(id, 'У вас нет доступа к этой команде');
    }
  
    const team = await personal.findOne({ 
      where: { chat_id: id }, 
      limit: 1, 
    }); 
  
    if (!team) { 
      return bot.sendMessage(id, 'Команда не найдена'); 
    } 
  
    const employees = await personal.findAll({ 
      attributes: ['full_name', 'post'], 
      order: ['full_name'], 
      where: { 
        team: team.team, 
      }, 
      raw: true, 
    }); 
  
    if (employees.length === 0) { 
      return bot.sendMessage(id, 'Сотрудники не найдены'); 
    } 
  
    const employeeList = employees.map(emp => `${emp.full_name} (${emp.post})`).join('\n'); 
  
    const message = `Твоя команда:\n${employeeList}`;
  
    bot.sendMessage(id, message); 
  });
  