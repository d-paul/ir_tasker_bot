let tg = window.Telegram.WebApp;
let startdate;
let enddate;
let date;

$(document).ready(async function(){
    try {
        await $.ajax({
          type: "POST",
          url: 'sick/ajax.php',
          data: {today: 'today'},
          success: function (data) {
            date = data;
          }
        });
        await $.ajax({
            type: "POST",
            url: 'sick/ajax.php',
            data: {chatid: tg.initDataUnsafe.user.id},
            success: async function (data) {
              eval(data);
                new AirDatepicker('#calendar', {
                  inline: true,
                  minDate: date,
                  onRenderCell({date, cellType}) {
                    let nolik_month = (date.getMonth() < 9) ? '0' : '';
                    let nolik_day = (date.getDate() < 10) ? '0' : '';
                    if (cellType === 'day') {
                      return {
                        attrs: {
                          day: date.getFullYear()+'-'+nolik_month+(date.getMonth()+1)+'-'+nolik_day+date.getDate()
                        }
                      }
                    }
                  },
                })
            }
        });
    } catch (err) {
        document.getElementById("tgonly").innerHTML = '<h1>Доступ только из тг бота</h1>';
    }
  });

let selected = false;

$(document).on('click', '.air-datepicker-cell.-day-:not(.-disabled-)', function () {
  enddate = $(this).attr('day');
  if (selected && !$(this).hasClass('-selected-')) {
    tg.MainButton.hide();
    selected = false;
  } else {
    tg.MainButton.show();
    tg.MainButton.text = 'На прием '+enddate;
    selected = true;
  };
});

  let one = true;

  tg.MainButton.onClick(() => {
    if (one) {
      one = false;
      $.ajax({
        type: "POST",
        url: 'sick/ajax.php',
        data: {chatid: tg.initDataUnsafe.user.id, end: enddate, message_id: get('message_id')},
        success: function () {
          tg.close();
        }
      });
    }
  });

  function get(name){
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
       return decodeURIComponent(name[1]);
 }