<?php
include '../db.php';
include '../token.php';
include '../webapp.php';
$days = [
    1 => 'Понедельник',
    2 => 'Вторник',
    3 => 'Среда',
    4 => 'Четверг',
    5 => 'Пятница',
    6 => 'Суббота',
    7 => 'Воскресенье',
  ];

if (isset($_POST['chatid']) && !isset($_POST['time_work'])) {
  $sql ="SELECT active FROM personals WHERE chat_id = '".$_POST['chatid']."'";
  $res = pg_query($connection, $sql);
  $bool = false;
    while ($row = pg_fetch_array($res)) {
        if ($row[0]!='' && $row[0]=='Y') {
            $bool = true;
        } else {
            $bool = false;
        }
    }
    date_default_timezone_set('Etc/GMT+5');
    $start = date('Y-m-d', strtotime('monday this week'.' -7 day'));
    $end = date('Y-m-d',strtotime('friday this week'.' -7 day'));
    if ($bool) {
        $sql ="SELECT tasks, fact, hours, date, time_work, worked FROM reports WHERE chat_id = '".$_POST['chatid']."' AND date BETWEEN '".$start."' AND '".$end."' ORDER BY date";
        $res = pg_query($connection, $sql);
        while ($row = pg_fetch_array($res)) {
            echo("$('#tgonly').append(`<div class='day' date='".$row[3]."'>
            <div class='row date'>
                <div class='col text-start'>
                    <span class='fs-5 fst-italic'>".$days[date('w', strtotime($row[3]))]."</span>
                </div>
                <div class='col text-end'>
                    <span class='fs-5 fst-italic'>".$row[3]."</span>
                </div>
            </div>
            <div class='row'>
                <label class='fs-5'>Факт</label>
                <textarea class='form-control fs-6 fact' type='text'>".$row[1]."</textarea>
            </div>
            <div class='row row_time_work' date='".$row[3]."' ".($check = ($row[5] == 'Y') ? '' : 'style="display:none;"').">
                <label class='fs-5 time_work' date='".$row[3]."' hours='".$row[2]."' time_work='".$row[4]."' style='width:50%'>".$row[4]." (".$row[2].")</label>
                <button type='button' style='width:50%' class='btn btn-primary but_time_work'>Выбрать время</button>
            </div>
            <div class='row row_not_work' date='".$row[3]."' ".($check = ($row[5] != 'Y') ? '' : 'style="display:none;"').">
                <select class='form-select filter-select filters' name='filter-post' id='filter-post'>
                <option value='N' ".($select = ($row[5] == 'N') ? 'selected' : '').">Не работал</option>
                <option value='D' ".($select = ($row[5] == 'D') ? 'selected' : '').">Взял день</option>
                <option value='S' ".($select = ($row[5] == 'S') ? 'selected' : '').">Болел</option>
                <option value='V' ".($select = ($row[5] == 'V') ? 'selected' : '').">Отпуск</option>
                </select>
            </div>
            <div class='row'>
                <label class='fs-5' style='width:100px;'>Работал?</label>
                <input ".($check = ($row[5] == 'Y') ? 'checked' : '')." type='checkbox' class='form-check-input worked' style='margin:9px 0; padding:0;'>
            </div>
            </div>`);");
        };
    } else {
        echo("document.getElementById('tgonly').innerHTML = '<h1>У вас нет доступа!</h1>';");
    }
}
if (isset($_POST['time_work'])) {
    $message_id = $_POST['message_id'];
    $date = $_POST['date'];
    $fact = $_POST['fact'];
    $worked = $_POST['worked'];
    $hours = $_POST['hours'];
    $time_work = $_POST['time_work'];
    $chatid = $_POST['chatid'];
    $n = 0;
    $sql ="INSERT INTO report_aprove(chat_id,fact1,hours1,date1,worked1,time_work1,fact2,hours2,date2,worked2,time_work2,fact3,hours3,date3,worked3,time_work3,fact4,hours4,date4,worked4,time_work4,fact5,hours5,date5,worked5,time_work5) VALUES ('".$chatid."'";
    for ($i = 1; $i <= 5; $i++) {
        if (date('w', strtotime($date[$n])) == $i) {
            $sql=$sql.", '".$fact[$n]."', '".$hours[$n]."', '".$date[$n]."', '".$worked[$n]."', '".$time_work[$n]."'";
            $n++;
        } else {
            $sql=$sql.", null, null, null, null, null";
        }
    }
    $sql=$sql.") RETURNING id";
    $res = pg_query($connection, $sql);
    $id;
    while ($row = pg_fetch_array($res)) {
        $id = $row[0];
    }

    $sql="SELECT full_name FROM personals WHERE chat_id='".$chatid."'";
    pg_query($connection, $sql);
    $res = pg_query($connection, $sql);
    $fullname;
    while ($row = pg_fetch_array($res)) {
        $fullname = $row[0];
    }

    $getQuery = array(
        "chat_id" 	=> $approve,
        "text"  	=> $fullname." хочет изменить еженедельный отчет",
        'reply_markup' => json_encode(array(
            'inline_keyboard' => array(
                array(
                    array(
                        'text' => 'Посмотреть',
                        'web_app' => array('url' => $webAppUrl.'/reports_aprove.php?id='.$id),
                    ),
                )
            ),
        )),
        "parse_mode" => "html"
    );
    $ch = curl_init("https://api.telegram.org/bot". $token ."/sendMessage?" . http_build_query($getQuery));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, false);
    $resultQuery = json_decode(curl_exec($ch), true);
    curl_close($ch);

    $getQuery = array(
        "chat_id" 	=> $chatid,
        "message_id"  	=> $resultQuery['result']['message_id'],
        'reply_markup' => json_encode(array(
            'inline_keyboard' => array(
                array(
                    array(
                        'text' => 'Посмотреть',
                        'web_app' => array('url' => $webAppUrl.'/reports_aprove.php?id='.$id.'&message_id='.$resultQuery['result']['message_id']),
                    ),
                )
            ),
        )),
        "parse_mode" => "html"
    );
    $ch = curl_init("https://api.telegram.org/bot". $token ."/editMessageReplyMarkup?" . http_build_query($getQuery));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, false);
    $resultQuery = curl_exec($ch);
    curl_close($ch);

    $getQuery = array(
        "chat_id" 	=> $chatid,
        "message_id"  	=> $message_id,
        'reply_markup' => json_encode(array(
            'keyboard' => []
        )),
        "parse_mode" => "html"
    );
    $ch = curl_init("https://api.telegram.org/bot". $token ."/editMessageReplyMarkup?" . http_build_query($getQuery));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, false);
    $resultQuery = curl_exec($ch);
    curl_close($ch);
}
?>