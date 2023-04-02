<?php
include '../db.php';
include '../token.php';
include '../webapp.php';

date_default_timezone_set('Etc/GMT+5');
//...................Сегодняшняя дата...............
if (isset($_POST['today'])){
  echo(date("m/d/Y"));
}
//..................(контент)................................
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
    echo("document.getElementById('tgonly').innerHTML = \"<input readonly style = 'opacity: 0;' id='calendar' class='form-control'>\" ");
  } else {
    echo("document.getElementById('tgonly').innerHTML = '<h1>У вас нет доступа!</h1>';");
  }
}

//..................Указание даты приема................................
if (isset($_POST['end'])){
  $chatid = $_POST['chatid'];
  $end = $_POST['end'];
  //$sql ="INSERT INTO not_working (chat_id, start, \"end\", status) VALUES ('".$chatid."', '".date('Y-m-d')."', '".$end."', 'S')";
  $sql ="UPDATE not_working SET \"end\" = '".$end."' WHERE chat_id = '".$chatid."' AND status = 'S' AND id = (SELECT id FROM not_working WHERE chat_id = '".$chatid."' ORDER BY start DESC LIMIT 1)";
  $query = pg_query($connection, $sql);
  
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

  $getQuery = array(
    "chat_id" 	=> $chatid,
    "text" => $end." придет уведомление о приеме",
    "parse_mode" => "html"
  );
  $ch = curl_init("https://api.telegram.org/bot". $token ."/sendMessage?" . http_build_query($getQuery));
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_HEADER, false);
  $resultQuery = curl_exec($ch);
  curl_close($ch);
}
?>