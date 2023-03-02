let tg = window.Telegram.WebApp;

$(document).ready(function(){
    try {
        $.ajax({
            type: "POST",
            url: 'weekly_report/ajax.php',
            data: {chatid: tg.initDataUnsafe.user.id},
            success: function (data) {
              eval(data);
            }
        });
    } catch (err) {
        document.getElementById("tgonly").innerHTML = '<h1>Доступ только из тг бота</h1>';
    }
  });
 
tg.MainButton.show();   
tg.MainButton.text = 'Сохранить изменения';
tg.MainButton.onClick(() => {
    $.ajax({
        type: "POST",
        url: 'weekly_report/ajax.php',
        data: {},
        success: function () {
        tg.close();
        }
    });
});