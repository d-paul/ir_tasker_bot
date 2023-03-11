<?php
include '../db.php';

$days = [
    1 => 'Понедельник',
    2 => 'Вторник',
    3 => 'Среда',
    4 => 'Четверг',
    5 => 'Пятница',
    6 => 'Суббота',
    7 => 'Воскресенье',
  ];

if (isset($_POST['chatid'])){
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
        $sql ="SELECT tasks, fact, hours, date FROM reports WHERE chat_id = '".$_POST['chatid']."' AND date BETWEEN '".$start."' AND '".$end."' ORDER BY date";
        $res = pg_query($connection, $sql);
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
                <label class='fs-5'>План</label>
                <textarea class='form-control fs-6' id='plan' type='text'>".$row[0]."</textarea>
            </div>
            <div class='row'>
                <label class='fs-5'>Факт</label>
                <textarea class='form-control fs-6' id='fact' type='text'>".$row[1]."</textarea>
            </div>
            <div class='row'>
            <label class='fs-5' for='hours' style='width:70px'>Часы:</label>
            <input maxlength='2' class='form-control' id='hours' type='text' style='width:30px; padding:2px' value='".$row[2]."'>
            </div>
            </div>`);");
        }
    } else {
        echo("document.getElementById('tgonly').innerHTML = '<h1>У вас нет доступа!</h1>';");
    }
}
?>