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
let select = false;
let start;
let end;
let hours;
let one;
$(document).on('click', '#clock', function(event) {
    const part = selected_part(event);
    if (part) {
        if (!select) {
            select = true;
            clear();
            start = part;
            circleSelect(start, true);
            tg.MainButton.show();
            tg.MainButton.text = 'Работал с '+(start+5)+':00 до ... ()';
            one = false;
        }
        else if (part != start){
            select = false;
            end = part;
            if (end < start) {
                end += 12;
            }
            hours = end - start;
            hours = (hours >= 7) ? (hours - 1) : hours;
            if (hours > 7) {
                hours = 7;
                end = start+8;
            }
            if ((end-start) > 0) {
                for (let i = start; i < end; ++i) {
                    selection (i);
                }
            }
            circleSelect(end, true);
            end = (end > 18) ? (end - 24) : end;
            tg.MainButton.show();
            tg.MainButton.text = 'Работал с '+(start+5)+':00 до '+(end+5)+':00 ('+hours+')';
            one = true;
        }
    }
}) 

function selected_part(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const angle = Math.abs(Math.asin((y-size/2)/Math.sqrt(Math.pow(x-size/2,2)+Math.pow(y-size/2,2)))*180/Math.PI);
    let part;
    if (x <= size/2 && y <= size/2) {
        if (angle <= 15) {
            part = 4;
        } else if (angle <= 45) {
            part = 5;
        } else if (angle <= 75) {
            part = 6;
        } else {
            part = 7;
        }
    } else if (x >= size/2 && y <= size/2) {
        if (angle <= 15) {
            part = 10;
        } else if (angle <= 45) {
            part = 9;
        } else if (angle <= 75) {
            part = 8;
        } else {
            part = 7;
        }
    } else if (x > size/2 && y > size/2) {
        if (angle <= 15) {
            part = 10;
        } else if (angle <= 45) {
            part = 11;
        } else if (angle <= 75) {
            part = 12;
        } else {
            part = 1;
        }
    } else {
        if (angle <=15) {
            part = 4;
        } else if (angle <= 45) {
            part = 3;
        } else if (angle <= 75) {
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

function selection(part) {
    clock.fillStyle = `rgba(0, 0, 0, 0)`;
    clock.lineWidth = 6;
    clock.strokeStyle = "rgba(143, 20, 20, 0.7)";
    clock.beginPath();
    clock.arc(size/2,size/2,size/2.05,Math.PI/6*Math.abs(part+3),Math.PI/6*(Math.abs(part-1+3)),true);
    clock.stroke();
    clock.closePath();
    clock.fill();
}

tg.MainButton.onClick(() => {
    if (one) {
        one = false;
        $.ajax({
            type: "POST",
            url: 'clock/ajax.php',
            data: {date: get('date'), start: start+5, end: end+5, hours: hours, chatid: tg.initDataUnsafe.user.id, message_id: get('message_id')},
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

 $(document).on('mousemove', '#clock', function(event) {
    const part = selected_part(event);
    if (select) {      
        clear();
        circleSelect(start, true);
        end = part;
        if (end < start) {
            end += 12;
        }
        hours = end - start + 1;
        hours = (hours >= 7) ? (hours - 1) : hours;
        if (hours > 7) {
            hours = 7;
            end = start+8;
        }
        circleSelect(end, false);
        if ((end-start) > 0) {
            for (let i = start; i < end; ++i) {
                selection (i);
            }
        }
    } else {
        clear();
        circleSelect(start, true);
        circleSelect(end, true);
        circleSelect(part, false);
        if ((end-start) > 0) {
            for (let i = start; i < end; ++i) {
                selection (i);
            }
        }
    }
 })

function circleSelect(part, sw) {
    const circle = circleXY(part);
    clock.fillStyle = `rgba(72, 209, 204, 0.3`;
    if (sw) {
        clock.lineWidth = 5;
        clock.strokeStyle = "rgba(19, 56, 55, 0.8)";
    } else {
        clock.strokeStyle = "rgba(0,0,0,0)";
    }
    clock.beginPath();
    clock.arc(circle.X,circle.Y,size/12,0,2*Math.PI,true);
    clock.stroke();
    clock.closePath();
    clock.fill();
}

 function circleXY(part) {
    let x, y;
    part = part > 12 ? part - 12 : part;
    switch (part) {
        case 1:
            x = size/1.972;
            y = size/1.119;
            break;
        case 2:
            x = size/3.32;
            y = size/1.19;
            break;
        case 3:
            x = size/5.8;
            y = size/1.41;
            break;
        case 4:
            x = size/8.34;
            y = size/2.03;
            break;
        case 5:
            x = size/6;
            y = size/3.5;
            break;
        case 6:
            x = size/3.27;
            y = size/6.4;
            break;
        case 7:
            x = size/1.96;
            y = size/9.8;
            break;
        case 8:
            x = size/1.455;
            y = size/6.44;
            break;
        case 9:
            x = size/1.2;
            y = size/3.55;
            break;
        case 10:
            x = size/1.135;
            y = size/2.03;
            break;
        case 11:
            x = size/1.22;
            y = size/1.4;
            break;
        case 12:
            x = size/1.425;
            y = size/1.19;
            break;
    }
    return new circle(x,y);
 }
 
 class circle {
    constructor(X, Y) {
        this.X = X;
        this.Y = Y;
    }
 }