let tg = window.Telegram.WebApp;

$(document).ready(function(){
    try {
        $.ajax({
            type: "POST",
            url: 'reports_aprove/ajax.php',
            data: {chatid: tg.initDataUnsafe.user.id, id: get('id')},
            success: function (data) {
              eval(data);
            }
        });
    } catch (err) {
        document.getElementById("tgonly").innerHTML = '<h1>Доступ только из тг бота</h1>';
    }
  });

let one = true;

$(document).on('click', 'button', function() {
  if (one) {
    one = false;
    if ($(this).text() == 'Принять') {
      $.ajax({
        type: "POST",
        url: 'reports_aprove/ajax.php',
        data: {aprove: 'aprove', id: get('id'), message_id: get('message_id'), chatid: tg.initDataUnsafe.user.id},
        success: function () {
          tg.close();
        }
    });
    } else {
      $.ajax({
        type: "POST",
        url: 'reports_aprove/ajax.php',
        data: {reject: 'reject', id: get('id'), message_id: get('message_id'), chatid: tg.initDataUnsafe.user.id},
        success: function () {
          tg.close();
        }
    });
    }
  }
})

function get(name){
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
       return decodeURIComponent(name[1]);
 }