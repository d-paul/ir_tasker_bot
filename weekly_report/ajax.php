<?php
/*if (isset($_POST['chatid'])){
  $sql ="SELECT active FROM personals WHERE chat_id = '".$_POST['chatid']."'";
  $res = pg_query($connection, $sql);
  $bool = false;
    while ($row = pg_fetch_array($res)) {
        if ($row[0]!='' && $row[0]=='Y') {
            $bool = true;
        } else {
            $bool = false;
        }
    }*/
    date_default_timezone_set('Etc/GMT+5');
    $start = date('Y-m-d', strtotime('monday this week'.' -7 day'));
    $end = date('Y-m-d',strtotime('friday this week'.' -7 day'));
    echo("document.getElementById('tgonly').append('<h1>".$start."</h1>')");
    echo("document.getElementById('tgonly').append('<h1>".$end."</h1>')");
    /*if ($bool) {
        $sql ="SELECT tasks, fact, hours, date FROM reports WHERE chat_id = '".$_POST['chatid']."' AND ";
        $res = pg_query($connection, $sql);
        while ($row = pg_fetch_array($res)) {
            echo("document.getElementById('tgonly').append(`<div class='day'>
            <div class='row date'>
                <div class='col text-start'>
                    <span class='fs-5 fst-italic'>Понедельник</span>
                </div>
                <div class='col text-end'>
                    <span class='fs-5 fst-italic'>01.01.2023</span>
                </div>
            </div>
            <div class='row'>
                <label class='fs-5'>План</label>
                <textarea class='form-control fs-6' id='plan' type='text'></textarea>
            </div>
            <div class='row'>
                <label class='fs-5'>Факт</label>
                <textarea class='form-control fs-6' id='plan' type='text'></textarea>
            </div>
            </div>`)");
        }
    } else {
        echo("document.getElementById('tgonly').innerHTML = '<h1>У вас нет доступа!</h1>';");
    }
}*/
?>