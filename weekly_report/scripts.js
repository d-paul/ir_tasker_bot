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
 
let one = true;

tg.MainButton.show();   
tg.MainButton.text = 'Сохранить изменения';
tg.MainButton.onClick(() => {
    if (one) {
        one = false;
        let date = [];
        let fact = [];
        let worked = [];
        let hours = [];
        let time_work = [];
        $('.day').each(function (){
            date.push($(this).find('.time_work').attr('date'));
            fact.push($(this).find('.fact').val());
            if ($(this).find('.worked').is(':checked')){
                worked.push('Y');
                time_work.push($(this).find('.time_work').attr('time_work'));
                hours.push($(this).find('.time_work').attr('hours'));
            } else {
                worked.push('N');
                time_work.push(null);
                hours.push(0);
            }
        })
        $.ajax({
            type: "POST",
            url: 'weekly_report/ajax.php',
            data: {date: date, fact: fact, worked: worked, hours: hours, time_work: time_work, chatid: tg.initDataUnsafe.user.id, message_id: get('message_id')},
            success: function () {
                tg.close();
            }
        });
    }
});

$(document).on('click', '.but_time_work', function() {
    $('#time').modal('show');
    time = $(this).closest('.day').attr('date');
    setTimeout(()=>{canvas = document.getElementById("clock");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    size = canvas.width;
    clock = canvas.getContext("2d");
    select = false;},200);
});

let canvas; let size; let clock; let select; let start; let end; let time;

$(document).on('click', '#clock', function(event) {
const part = selected_part(event);
if (part) {
    if (!select) {
        select = true;
        clear();
        start = part;
        selection (start, 0.3);
    }
    else {
        select = false;
        end = part;
        if (end < start) {
            end += 12;
        }
        hours = end - start + 1;
        hours = (hours >= 7) ? (hours - 1) : hours;
        if (hours > 7) {
            hours = 7;
            end = start+7;
        }
        if ((end-start) > 1) {
            for (let i = start+1; i < end; ++i) {
                selection (i, 0.2);
            }
        }
        selection (end, 0.3);
        end = (end > 18) ? (end - 24) : end;
        $(`.time_work[date='${time}']`).text((((start+5)<10)?'0':'')+(start+5)+':00-'+(((end+6)<10)?'0':'')+(end+6)+':00'+' ('+hours+')');
        $(`.time_work[date='${time}']`).attr('time_work',(((start+5)<10)?'0':'')+(start+5)+':00-'+(((end+6)<10)?'0':'')+(end+6)+':00');
        $(`.time_work[date='${time}']`).attr('hours',hours);
        $('#time').modal('hide');
    }
}
}) 

function selected_part(event) {
const rect = canvas.getBoundingClientRect();
const x = event.clientX - rect.left;
const y = event.clientY - rect.top;
const angle = Math.abs(Math.asin((y-size/2)/Math.sqrt(Math.pow(x-size/2,2)+Math.pow(y-size/2,2)))*180/Math.PI);
let part;
if (x < size/2 && y < size/2) {
    if (angle <= 30) {
        part = 4;
    } else if (angle <= 60) {
        part = 5;
    } else {
        part = 6;
    }
} else if (x > size/2 && y < size/2) {
    if (angle <= 30) {
        part = 9;
    } else if (angle <= 60) {
        part = 8;
    } else {
        part = 7;
    }
} else if (x > size/2 && y > size/2) {
    if (angle <= 30) {
        part = 10;
    } else if (angle <= 60) {
        part = 11;
    } else {
        part = 12;
    }
} else {
    if (angle <=30) {
        part = 3;
    } else if (angle <= 60) {
        part = 2;
    } else {
        part = 1;
    }
};
return part;
}

function clear() {
    clock.save();
    clock.beginPath();
    clock.arc(size/2,size/2,size/2,0,Math.PI*2,true);
    clock.lineTo(size/2,size/2);
    clock.closePath();
    clock.clip()
    clock.clearRect(0,0,size,size);
    clock.restore();
}

function selection(part, v) {
clock.fillStyle = `rgba(0, 214, 21, ${v})`;
clock.strokeStyle = "rgba(0,0,0,0)";
clock.beginPath();
clock.arc(size/2,size/2,size/2,Math.PI/6*Math.abs(part+3),Math.PI/6*(Math.abs(part-1+3)),true);
clock.lineTo(size/2,size/2);
clock.stroke();
clock.closePath();
clock.fill();
}

$(document).on('change', '.worked', function () {
    if (this.checked!=true){
        $(`.row_time_work[date='${$(this).closest('.day').attr('date')}']`).hide();
    } else {
        $(`.row_time_work[date='${$(this).closest('.day').attr('date')}']`).show();
        $(`.row_time_work[date='${$(this).closest('.day').attr('date')}']`).find('.time_work').text('(8)');
        $(`.row_time_work[date='${$(this).closest('.day').attr('date')}']`).find('.time_work').attr('hours',8);
    }
  });

  function get(name){
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
       return decodeURIComponent(name[1]);
 }

 $(document).on('click', '.full_day', function(event) {
    $(`.time_work[date='${time}']`).text('(8)');
    $(`.time_work[date='${time}']`).attr('time_work','');
    $(`.time_work[date='${time}']`).attr('hours','8');
    $('#time').modal('hide');
}) 