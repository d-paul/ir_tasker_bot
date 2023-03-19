let tg = window.Telegram.WebApp;;
$(document).ready(function(){
    try {
        $.ajax({
            type: "POST",
            url: 'clock/ajax.php',
            data: {chatid: tg.initDataUnsafe.user.id},
            success: function (data) {
              eval(data);
            }
        });
    } catch (err) {
        document.getElementById("tgonly").innerHTML = '<h1>Доступ только из тг бота</h1>';
    }
});
const canvas = document.getElementById("clock");
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;
const size = canvas.width;
const clock = canvas.getContext("2d");
clock.fillStyle = "rgba(0,0,0,0.2)";
clock.strokeStyle = "rgba(0,0,0,0)";
clock.beginPath();
clock.arc(size/2,size/2,size/2,Math.PI,Math.PI/2,true);
clock.lineTo(size/2,size/2);
clock.stroke();
clock.closePath();
clock.fill();
let select = false;
let start;
let end;
$(document).on('click', '#clock', function(event) {
    const part = selected_part(event);
    if (part) {
        if (!select) {
            select = true;
            clear();
            start = part;
            selection (start, 0.3);
            tg.MainButton.hide();
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
            tg.MainButton.show();
            tg.MainButton.text = 'Работал с '+(start+8)+' до '+(end+9);
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

let one = true;

tg.MainButton.onClick(() => {
    if (one) {
        one = false;
        $.ajax({
            type: "POST",
            url: 'clock/ajax.php',
            data: {date: get('date'), start: start+8, end: end+9, chatid: tg.initDataUnsafe.user.id, message_id: get('message_id')},
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