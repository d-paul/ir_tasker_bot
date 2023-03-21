let tg = window.Telegram.WebApp;
let startdate;
let enddate;
$(document).ready(function(){
    try {
        $.ajax({
            type: "POST",
            url: 'vacation/ajax_vacation.php',
            data: {chatid: tg.initDataUnsafe.user.id},
            success: function (data) {
              eval(data);
                $('#calendar').daterangepicker({"autoApply":true, "opens":"center", "drops":"up"}, function(start, end) {
                tg.MainButton.show();   
                tg.MainButton.text = 'С '+start.format('DD.MM.YYYY')+' по '+end.format('DD.MM.YYYY');
                startdate=start;
                enddate=end;
                });
                $('#calendar').data("daterangepicker").show();
                $('#calendar').on('hide.daterangepicker', function(){
                  setTimeout(() => { $('#calendar').data("daterangepicker").show(); }, 1);
                })
            }
        });
    } catch (err) {
        document.getElementById("tgonly").innerHTML = '<h1>Доступ только из тг бота</h1>';
    }
  });
  tg.MainButton.onClick(() => {
    $.ajax({
      type: "POST",
      url: 'vacation/ajax_vacation.php',
      data: {chatid: tg.initDataUnsafe.user.id, start: startdate.format('YYYY-MM-DD'), end: enddate.format('YYYY-MM-DD')},
      success: function () {
        tg.close();
      }
    });
  });