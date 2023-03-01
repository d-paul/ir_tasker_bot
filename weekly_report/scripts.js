let tg = window.Telegram.WebApp;
$(document).ready(function(){
    try {
        $.ajax({
            type: "POST",
            url: 'weekly_report/ajax.php',
            data: {},
            success: function (data) {
              alert(data);
            }
        });
    } catch (err) {
        document.getElementById("tgonly").innerHTML = '<h1>Доступ только из тг бота</h1>';
    }
  });