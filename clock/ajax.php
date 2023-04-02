<?php
include '../db.php';
include '../token.php';

if (isset($_POST['chatid']) && !isset($_POST['date'])){
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
    if (!$bool) {
        echo("document.getElementById('tgonly').innerHTML = '<h1>У вас нет доступа!</h1>';");
    }
  }

if (isset($_POST['date'])){
  $message_id=$_POST['message_id'];
  $start=$_POST['start'];
  $end=$_POST['end'];
  $chatid=$_POST['chatid'];
  $date=$_POST['date'];
  $hours=$_POST['hours'];
  if ($start<10) {
    $start = '0'.$start;
  }
  if ($end<10) {
    $end = '0'.$end;
  }
  $sql ="UPDATE reports SET hours = '".$hours."', time_work = '".$start.":00-".$end.":00' WHERE chat_id = '".$chatid."' AND date = '".$date."'";
  pg_query($connection, $sql);

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

  $getQuery = array(
    "chat_id" 	=> $chatid,
    "text" => "Ваш факт принят",
    "parse_mode" => "html"
  );
  $ch = curl_init("https://api.telegram.org/bot". $token ."/sendMessage?" . http_build_query($getQuery));
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_HEADER, false);
  $resultQuery = curl_exec($ch);
  curl_close($ch);
}
?>