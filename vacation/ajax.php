<?php
include '../db.php';
include '../token.php';
include '../webapp.php';
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

//..................Указание отпуска................................
if (isset($_POST['start'])){
  $chatid = $_POST['chatid'];
  $start = $_POST['start'];
  $end = $_POST['end'];
  $sql ="INSERT INTO vacation_aprove (chat_id, start, \"end\", status) VALUES ('".$chatid."', '".$start."', '".$end."', 'V') RETURNING id";
  $query = pg_query($connection, $sql);
  $id = pg_fetch_row($query)[0];

  
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
    "text" => "Заявка на отпуск с ".$start." по ".$end." была отправлена.",
    "parse_mode" => "html"
  );
  $ch = curl_init("https://api.telegram.org/bot". $token ."/sendMessage?" . http_build_query($getQuery));
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_HEADER, false);
  $resultQuery = curl_exec($ch);
  curl_close($ch);

  $sql="SELECT full_name FROM personals WHERE chat_id='".$chatid."'";
  pg_query($connection, $sql);
  $res = pg_query($connection, $sql);
  $fullname;
  while ($row = pg_fetch_array($res)) {
      $fullname = $row[0];
  }

  $getQuery = array(
    "chat_id" 	=> $approve,
    "text"  	=> "[#".$id."]\n".$fullname." хочет взять отпуск с ".$start." по ".$end,
    'reply_markup' => json_encode(array(
        'inline_keyboard' => array(
            array(
                array(
                    'text' => 'Одобрить',
                    'callback_data' => 'vacation_aprove',
                ),
                array(
                  'text' => 'Отклонить',
                  'callback_data' => 'vacation_!aprove',
              ),
            )
        ),
    )),
    "parse_mode" => "html"
  );
  $ch = curl_init("https://api.telegram.org/bot". $token ."/sendMessage?" . http_build_query($getQuery));
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_HEADER, false);
  $resultQuery = curl_exec($ch);
  curl_close($ch);
}
?>