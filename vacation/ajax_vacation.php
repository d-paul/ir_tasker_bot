<?php
include '../db.php';
//..................Отпуск(контент)................................
if (isset($_POST['chatid']) && !isset($_POST['start'])){
  $sql ="SELECT active FROM personals WHERE chat_id = '".$_POST['chatid']."'";
  $res = pg_query($connection, $sql);
  $bool=false;
  while ($row = pg_fetch_array($res)) {
    if ($row[0]!='' && $row[0]=='Y'){
        $bool = true;
    } else {
        $bool = false;
    }
  }
  if ($bool) {
    echo("document.getElementById('tgonly').innerHTML = \"<input readonly id='calendar' class='form-control'>\" ");
  } else {
    echo("document.getElementById('tgonly').innerHTML = '<h1>У вас нет доступа!</h1>';");
  }
}

//..................Указание отпуска................................
if (isset($_POST['start'])){
  //$sql ="INSERT INTO vacation VALUES ('".$_POST['chatid']."', '".$_POST['start']."', '".$_POST['end']."', 'awaiting')";
  //pg_query($connection, $sql);
}
?>