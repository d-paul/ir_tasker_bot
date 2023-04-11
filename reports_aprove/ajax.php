<?php
include '../db.php';
include '../token.php';

$days = [
    1 => 'Понедельник',
    2 => 'Вторник',
    3 => 'Среда',
    4 => 'Четверг',
    5 => 'Пятница',
    6 => 'Суббота',
    7 => 'Воскресенье',
  ];

if (isset($_POST['chatid']) && isset($_POST['id']) && !isset($_POST['aprove']) && !isset($_POST['reject'])) {
    $id = $_POST['id'];
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
    if ($bool) {
        $sql1 ="SELECT * FROM report_aprove WHERE id = ".$id;
        $res1 = pg_query($connection, $sql1);
        while ($row1 = pg_fetch_array($res1)) {
            $chatid = $row1[1];
            $date = array($row1[4],$row1[9],$row1[14],$row1[19],$row1[24]);
            $hours = array($row1[3],$row1[8],$row1[13],$row1[18],$row1[23]);
            $fact = array($row1[2],$row1[7],$row1[12],$row1[17],$row1[22]);
            $time_work = array($row1[6],$row1[11],$row1[16],$row1[21],$row1[26]);
            $worked = array($row1[5],$row1[10],$row1[15],$row1[20],$row1[25]);
            $dates = '';
            if ($date[0] != null) {
                $dates = $dates."date = '".$date[0]."' OR ";
            }
            if ($date[1] != null) {
                $dates = $dates."date = '".$date[1]."' OR ";
            }
            if ($date[2] != null) {
                $dates = $dates."date = '".$date[2]."' OR ";
            }
            if ($date[3] != null) {
                $dates = $dates."date = '".$date[3]."' OR ";
            }
            if ($date[4] != null) {
                $dates = $dates."date = '".$date[4]."' OR ";
            }
            $dates = $dates."1 != 1";
            $sql = "SELECT tasks, fact, hours, date, time_work, worked FROM reports WHERE chat_id = '".$chatid."' AND (".$dates.") ORDER BY date";
            $res = pg_query($connection, $sql);
            $worked = array_diff($worked, array(null));
            $time_work = array_diff($time_work, array(null));
            $fact = array_diff($fact, array(null));
            $hours = array_diff($hours, array(null));
            $date = array_diff($date, array(null));
            $n = 0;
            while ($row = pg_fetch_array($res)) {
                echo("$('#tgonly').append(`<div class='day'>
                    <div class='row date'>
                        <div class='col text-start'>
                            <span class='fs-5 fst-italic'>".$days[date('w', strtotime($row[3]))]."</span>
                        </div>
                        <div class='col text-end'>
                            <span class='fs-5 fst-italic'>".$row[3]."</span>
                        </div>
                    </div>
                    <div class='row'>
                        <div class='col old' style='padding:0 4px;'>
                            <label class='fs-5'>old</label>
                            <textarea class='form-control fs-6' type='text'>".$row[1]."</textarea>
                            <label class='fs-5'>".$row[4]." (".($work = ($row[5] == 'Y') ? $row[2] : (($row[5] == 'N') ? 'Не работал' : (($row[5] == 'V') ? 'Отпуск' : 'Взял день'))).")</label>
                        </div>
                        <div class='col new' style='padding:0 4px;'>
                            <label class='fs-5'>new</label>
                            <textarea class='form-control fs-6' type='text'>".$fact[$n]."</textarea>
                            <label class='fs-5 '>".$time_work[$n]." (".($work = ($worked[$n] == 'Y') ? $hours[$n] : (($worked[$n] == 'N') ? 'Не работал' : (($worked[$n] == 'V') ? 'Отпуск' : 'Взял день'))).")</label>
                        </div>
                    </div>
                </div>`);");
                $n++;
            };
            echo("$('#tgonly').append(`<div class='row''>
                <div class='col'>
                    <button style='width:90%; float:right;' type='button' class='btn btn-primary aprove'>Принять</button>
                </div>
                <div class='col'>
                    <button style='width:90%; float:left;' type='button' class='btn btn-danger reject'>Отклонить</button>
                </div>
            </div>`);");
        }
    } else {
        echo("document.getElementById('tgonly').innerHTML = '<h1>У вас нет доступа!</h1>';");
    }
};

if (isset($_POST['reject'])) {
    $chatid = $_POST['chatid'];
    $message_id = $_POST['message_id'];
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
    
    $sql1 ="SELECT * FROM report_aprove WHERE id = ".$id;
    $res1 = pg_query($connection, $sql1);
    while ($row1 = pg_fetch_array($res1)) {
        $chatid = $row1[1];
    };
    $getQuery = array(
        "chat_id" 	=> $chatid,
        "text"  	=> "Изменения еженедельного отчета были отклонены",
        "parse_mode" => "html"
    );
    $ch = curl_init("https://api.telegram.org/bot". $token ."/sendMessage?" . http_build_query($getQuery));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, false);
    $resultQuery = json_decode(curl_exec($ch), true);
    curl_close($ch);
};


if (isset($_POST['aprove'])) {
    $id = $_POST['id'];
    $sql1 ="SELECT * FROM report_aprove WHERE id = ".$id;
    $res1 = pg_query($connection, $sql1);
    while ($row1 = pg_fetch_array($res1)) {
        $chatid = $row1[1];
        $date = array($row1[4],$row1[9],$row1[14],$row1[19],$row1[24]);
        $hours = array($row1[3],$row1[8],$row1[13],$row1[18],$row1[23]);
        $fact = array($row1[2],$row1[7],$row1[12],$row1[17],$row1[22]);
        $time_work = array($row1[6],$row1[11],$row1[16],$row1[21],$row1[26]);
        $worked = array($row1[5],$row1[10],$row1[15],$row1[20],$row1[25]);
        $dates = '';
        if ($date[0] != null) {
            $dates = $dates."date = '".$date[0]."' OR ";
        }
        if ($date[1] != null) {
            $dates = $dates."date = '".$date[1]."' OR ";
        }
        if ($date[2] != null) {
            $dates = $dates."date = '".$date[2]."' OR ";
        }
        if ($date[3] != null) {
            $dates = $dates."date = '".$date[3]."' OR ";
        }
        if ($date[4] != null) {
            $dates = $dates."date = '".$date[4]."' OR ";
        }
        $dates = $dates."1 != 1";
        $worked = array_diff($worked, array(null));
        $time_work = array_diff($time_work, array(null));
        $fact = array_diff($fact, array(null));
        $hours = array_diff($hours, array(null));
        $date = array_diff($date, array(null));
        $sql2 = '';
        for ($i = 0; $i < count($date); $i++) {
            $sql2 = $sql2."UPDATE reports SET worked = '".$worked[$i]."', time_work = '".$time_work[$i]."', fact = '".$fact[$i]."', hours = '".$hours[$i]."' WHERE date = '".$date[$i]."' AND chat_id = '".$chatid."'; ";
        }
        echo $sql2;
        pg_query($connection, $sql2);
    };

    $chatid = $_POST['chatid'];
    $message_id = $_POST['message_id'];
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
    
    $sql1 ="SELECT * FROM report_aprove WHERE id = ".$id;
    $res1 = pg_query($connection, $sql1);
    while ($row1 = pg_fetch_array($res1)) {
        $chatid = $row1[1];
    };
    $getQuery = array(
        "chat_id" 	=> $chatid,
        "text"  	=> "Изменения еженедельного отчета были одобрены",
        "parse_mode" => "html"
    );
    $ch = curl_init("https://api.telegram.org/bot". $token ."/sendMessage?" . http_build_query($getQuery));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, false);
    $resultQuery = json_decode(curl_exec($ch), true);
    curl_close($ch);
};
