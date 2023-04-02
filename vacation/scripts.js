let tg = window.Telegram.WebApp;
let startdate;
let enddate;
let date;
let button = true;
let select_day;

$(document).ready(async function(){
    try {
        await $.ajax({
          type: "POST",
          url: 'vacation/ajax.php',
          data: {today: 'today'},
          success: function (data) {
            date = data;
          }
        });
        await $.ajax({
            type: "POST",
            url: 'vacation/ajax.php',
            data: {chatid: tg.initDataUnsafe.user.id},
            success: async function (data) {
              eval(data);
                new AirDatepicker('#calendar', {
                  inline: true,
                  range: true,
                  dynamicRange: false,
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

$(document).on('click', '.air-datepicker-cell.-day-:not(.-disabled-)', function () {
  if (button) {
    button = false;
    if ($(`.-day-[day='${select_day}']`).attr('day') != $(this).attr('day')) {
      $(`.-day-[day='${select_day}']`).removeClass('-selected-');
    }
    if (!$(this).hasClass('-selected-') && $(this).hasClass('-range-to-')) {
      startdate = startdate;
    } else if (!$(this).hasClass('-selected-')) { 
      startdate = enddate;
    } else {
      startdate = $(this).attr('day');
    }
    tg.MainButton.show();   
    tg.MainButton.text = 'С '+startdate+' по ...';
  } else {
    button = true;
    enddate = $(this).attr('day');
    let swap = enddate;
    if (startdate > enddate) {
        enddate = startdate;
        startdate = swap;
    }
    if (!$(this).hasClass('-selected-')) {
      select_day = $(this).attr('day');
      $(this).addClass('-selected-');
    }
    tg.MainButton.text = 'С '+startdate+' по '+enddate;
  }
});

  let one = true;

  tg.MainButton.onClick(() => {
    if (one && button) {
      one = false;
      $.ajax({
        type: "POST",
        url: 'vacation/ajax.php',
        data: {chatid: tg.initDataUnsafe.user.id, start: startdate, end: enddate, message_id: get('message_id')},
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