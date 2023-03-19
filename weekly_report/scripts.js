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
    clock.fillStyle = "rgba(0,0,0,0.2)";
    clock.strokeStyle = "rgba(0,0,0,0)";
    clock.beginPath();
    clock.arc(size/2,size/2,size/2,Math.PI,Math.PI/2,true);
    clock.lineTo(size/2,size/2);
    clock.stroke();
    clock.closePath();
    clock.fill();
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
        let swap = end;
        if (end < start) {
            end = start;
            start = swap;
        }
        if ((end-start) > 1) {
            for (let i = start+1; i < end; ++i) {
                selection (i, 0.2);
            }
        }
        selection (swap, 0.3);
        $(`.time_work[date='${time}']`).text((((start+8)<10)?'0':'')+(start+8)+':00-'+(((end+9)<10)?'0':'')+(end+9)+':00'+' ('+((end-start+1)>8) ? '8' : (end-start+1)+')');
        $(`.time_work[date='${time}']`).attr('time_work',(((start+8)<10)?'0':'')+(start+8)+':00-'+(((end+9)<10)?'0':'')+(end+9)+':00');
        $(`.time_work[date='${time}']`).attr('hours',((end-start+1)>8) ? '8' : (end-start+1));
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
        part = 1;
    } else if (angle <= 60) {
        part = 2;
    } else {
        part = 3;
    }
} else if (x > size/2 && y < size/2) {
    if (angle <= 30) {
        part = 6;
    } else if (angle <= 60) {
        part = 5;
    } else {
        part = 4;
    }
} else if (x > size/2 && y > size/2) {
    if (angle <= 30) {
        part = 7;
    } else if (angle <= 60) {
        part = 8;
    } else {
        part = 9;
    }
}
return part;
}

function clear() {
clock.save();
clock.beginPath();
clock.arc(size/2,size/2,size/2,Math.PI/2,Math.PI,true);
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
clock.arc(size/2,size/2,size/2,Math.PI/6*Math.abs(part+6),Math.PI/6*(Math.abs(part-1+6)),true);
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
    }
  });

  function get(name){
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
       return decodeURIComponent(name[1]);
 }