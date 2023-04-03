<?php
include 'db.php';
include 'php.php';
include 'token.php';
session_start();

//...........Добавление сотрудника...............
if (isset($_GET['button-form']) && $_GET['button-form'] == 'button-add' && !empty($_SESSION['auth'])){
  $add_date_birth = $_GET['add_date_birth'];
  $add_number_phone = '7'.pg_escape_string($_GET['add_number_phone']);
  $add_full_name = pg_escape_string($_GET['add_full_name']);
  $add_post = pg_escape_string($_GET['add_post']);
  if ($_GET['add_date_birth']==''){
    $add_date_birth = 'NULL';
  }
  else {
    $add_date_birth = "'$add_date_birth'";
  }
  $sql = "SELECT number_phone FROM personals WHERE number_phone='$add_number_phone'";
  $res = pg_query($connection, $sql);
  $row = pg_fetch_array($res);
  if ($row['number_phone'] != ''){
    echo "$('.number-error').text('Номер уже зарегистрирован');";
  }
  elseif (mb_strlen($add_number_phone)!=11 || !(is_numeric($add_number_phone)))
  {
    echo "$('.number-error').text('Неверный формат номера');";
  }
  else{
    $sql ="INSERT INTO personals (number_phone, date_birth, full_name, post, team, access_level, active) VALUES ('".$add_number_phone."', ".$add_date_birth.", '".$add_full_name."', '".$add_post."', '".$_GET['add_team']."', '".$_GET['add_access_level']."', 'Y')";
    pg_query($connection, $sql);
    echo "table_update(); $('#modal_add').modal('hide');";
  }
}

//.............Редактирование сотрудника.............
if (isset($_GET['button-form']) && $_GET['button-form'] == 'button-save' && !empty($_SESSION['auth'])){
  $date_birth = $_GET['date_birth'];
  $full_name = pg_escape_string($_GET['full_name']);
  $post = pg_escape_string($_GET['post']);
  $number_phone = mb_substr($_GET['number_phone'],1,11);
  if (isset($_GET['active']) && $_GET['active']=='Y'){
    $active='Y';
  }
  else{
    $active='N';
  }
  if ($_GET['date_birth']==''){
    $date_birth = 'NULL';
  }
  else {
    $date_birth = "'$date_birth'";
  }
  $sql ="UPDATE personals SET date_birth=".$date_birth.", full_name='".$full_name."', post='".$post."', team='".$_GET['team']."', access_level='".$_GET['access_level']."', active='".$active."' WHERE number_phone = '".$number_phone."'";
  pg_query($connection, $sql);
  echo "table_update(); $('#Modal').modal('hide');";
}

//..............Авторизация....................
//Ввод номера
if (isset($_GET['InputTel']))
{
  $tel='7'.(pg_escape_string($_GET['InputTel']));
  $employee=getdata($connection, $tel);
  if ($employee[0] != '' & $tel == $employee[0]){
      if ($employee[5]!=1 && $employee[8] == 'Y'){
        if ($employee[7] != NULL){
          $code = rand(100000,999999);
          $sql ="UPDATE personals SET password = '".$code."' WHERE number_phone = '".$tel."'";
          pg_query($connection, $sql);
          file_get_contents("https://api.telegram.org/bot".$token."/sendMessage?chat_id=".$employee[7]."&text=".$code);
          echo "document.getElementById('auth').innerHTML = \"<div class='mb-3'>\
          <input type='hidden' name='InputCode_tel' value='".$tel."'>\
          <label for='InputCode' class='form-label'>Введите код</label>\
          <input type='code' class='form-control mx-auto auth_enter' style='width:250px;' id='InputCode' name='InputCode'>\
          <label style='color:lightgrey; font-size:80%'>Код был отправлен на номер +".$tel."</label><br/>\
          <button class='button-back' type='button' style='' onclick='auth_back()'><a>Ошиблись номером?</br>(вернуться)</a></button>\
          </div><button type='button' class='btn btn-primary auth_button' name='button-auth' onclick='auth_num()'>Подтвердить</button>\
          <p class='text-center' id='auth-error' style='color:red; margin-top:10px'></p>\"";
        }
        else{
          echo("document.getElementById('auth-error').innerHTML = 'Вы не подтвердили номер в боте!'");
        }
      }
      else {
        echo("document.getElementById('auth-error').innerHTML = 'У вас недостаточно прав!'");
      }
  }
  else {
    echo("document.getElementById('auth-error').innerHTML = 'Номер не зарегистрирован в системе!'");
  }
}
//Проверка кода
if (isset($_GET['InputCode']))
{
  $code = $_GET['InputCode'];
  $tel = $_GET['InputCode_tel'];
  $employee=getdata($connection, $tel);
  if ($code == $employee[6]){
    session_start();
    $_SESSION['auth']=$employee[0];
    $sql ="UPDATE personals SET password = '' WHERE number_phone = '".$tel."'";
    pg_query($connection, $sql);
    echo("location.reload()");
  }
  else{
    echo("document.getElementById('auth-error').innerHTML = \"Неверный код!\"");
  }
}
//Возврат к вводу номера
if (isset($_GET['Back']))
{
  echo "<div class='mb-3'> 
  <label for='InputTel' class='form-label'>Введите номер телефона</label>
  <div class='row'>
  <div class ='mx-auto'>
  <input readonly type='tel' class='form-control' style='width:20px; padding:6px 1px 6px 0px; margin-right:-5px; display:inline; border:none; border-radius:5px 0 0 5px;' onclick='this.nextElementSibling.focus();' value='+7'>
  <input autocomplete='off' onkeypress='return event.charCode >= 48 && event.charCode <= 57' type='tel' maxlength='10' class='form-control auth_enter' style='width:200px; padding-left:2px; display:inline; border:none; border-radius:0 5px 5px 0; outline:none; box-shadow: none;' id='InputTel' name='InputTel'>
  </div>
  </div>
  </div>
  <button type='button' class='btn btn-primary auth_button' name='button-auth' onclick='auth_num()'>Отправить</button>
  <p class='text-center' id='auth-error' style='color:red; margin-top:10px'></p>";
}

//.................Подгрузка ежедневных отчетов..................
if (isset($_POST['first']) && isset($_POST['last'])){
  $tele = $_POST['tel'];
  $sql = "SELECT tasks, fact, hours, date, worked FROM reports, personals WHERE number_phone='".$_POST['tel']."' AND date BETWEEN '".$_POST['first']."' AND '".$_POST['last']."' AND reports.chat_id=personals.chat_id";
  $rs = pg_query($connection, $sql) or die("wait what\n");
  while ($row = pg_fetch_array($rs)) {
	if ($row[4] == 'S'){
      $worked = 'background-color: black';
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('sick', 'selected');";
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('vacation', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('takeaday', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('work', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('nowork', '');";
	}
	elseif ($row[4] == 'V'){
      $worked = 'background-color: #cece00';
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('sick', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('vacation', 'selected');";
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('takeaday', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('work', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('nowork', '');";
	}
	elseif ($row[4] == 'D'){
      $worked = 'background-color: darkgray';
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('sick', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('vacation', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('takeaday', 'selected');";
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('work', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('nowork', '');";
	}
	elseif ($row[4] == 'N') {
      $worked = 'background-color: red';
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('sick', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('vacation', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('takeaday', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('work', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('nowork', 'selected');";
	}
	elseif ($row[0] != ''){
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('sick', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('vacation', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('takeaday', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('work', 'selected');";
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('nowork', '');";
	  $worked = 'background-color: red';
	  if ($row[1] != ''){
		$worked = 'background-color: lime';
		echo "$(\".air-datepicker-cell[day='".$row[3]."']\").append(\"<div class='circle plan'></div>\");";
    }
    }
	elseif ($row[1] != ''){
	  $worked = 'background-color: lime';
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('sick', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('vacation', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('takeaday', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('work', 'selected');";
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('nowork', '');";
    }
    else{
      $worked = 'background-color: red';
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('sick', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('vacation', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('takeaday', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('work', '');";
	  echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('nowork', 'selected');";
    }
	echo "$(\".air-datepicker-cell[day='".$row[3]."']\").append(\"<div class='circle' style='".$worked."'></div>\");";
	echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('tel', '".$tele."');";
    echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('plan', '".$row[0]."');";
    echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('fact', '".$row[1]."');";
    echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('hours', '".$row[2]."');";
}
}

//.......Команды..............
if (isset($_POST['teams']) && !empty($_SESSION['auth']) && access($connection) == 3) {
  $sql = "SELECT * FROM team";
  $res = pg_query($connection, $sql) or die("wait what\n");
  while ($combobox = pg_fetch_array($res)) {
    echo  "document.getElementById('teams').innerHTML += `
    <div class='row' style='width:100%; margin:0; padding-bottom:3px; padding-top:3px;' title=\"".htmlspecialchars($combobox[0])."\">
      <div class='col' style='width:45%; flex:auto;padding:0;'>
        <input type='text' class='form-control' value=\"".htmlspecialchars($combobox[0])."\">
      </div>
      <div class='col' style='width:30%; flex:auto; padding:0; padding-left:5px;'>
        <button id='team_rename' type='button' class='btn btn-primary' style='width:100%; height:100%; overflow: hidden;'>Изменить</button>
      </div>
      <div class='col' style='width:25%; flex:auto; padding:0; padding-left:5px;'>
        <button id='team_delete' type='button' class='btn btn-danger' style='width:100%; height:100%; overflow: hidden;'>Удалить</button>
      </div>
    </div>
    `;";
  };
  echo "document.getElementById('teams').innerHTML += `
  <div class='row align-items-center' style='width:100%; margin:0; padding-bottom:10px; padding-top:12px;'>
    <div class='col-1' flex:auto;padding:0;'>
    </div>
    <div class='col-6' flex:auto;padding:0;'>
      <input type='text' class='form-control'>
    </div>
    <div class='col-5' flex:auto;padding:0;'>
      <button id='team_add' type='button' class='btn btn-primary' style='width:120px;'>Добавить</button>
    </div>
  </div>
  `;";
}


//............Изменить название команды.............
if (isset($_POST['team_rename']) && !empty($_SESSION['auth']) && access($connection) == 3) {
  $title = pg_escape_string($_POST['team_title']);
  $rename = trim(pg_escape_string($_POST['team_rename']));
  $sql = "SELECT team FROM team WHERE team = '".$rename."'";
  $res = pg_query($connection, $sql) or die("wait what\n");
  $row = pg_fetch_row($res);
  if ($title == $rename) {
    echo ("notification('Название команды не было изменено','rgba(255, 0, 0, 0.7)');");
  } else if ($row[0] == $rename) {
    echo ("notification('Название занято','rgba(255, 0, 0, 0.7)');");
  } else {
    $sql = "UPDATE team SET team = '".$rename."' WHERE team = '".$title."'; UPDATE personals SET team = '".$rename."' WHERE team = '".$title."';";
    pg_query($connection, $sql) or die("wait what\n");
    echo ("notification('Новое название команды \'".$rename."\'','rgba(53, 209, 29, 0.7)');");
    echo ("table_update();");
    echo ("teams_update();");
  }
}

//............Добавить команду.............
if (isset($_POST['team_add']) && !empty($_SESSION['auth']) && access($connection) == 3) {
  $title = trim(pg_escape_string($_POST['team_add']));
  $sql = "SELECT team FROM team WHERE team = '".$title."'";
  $res = pg_query($connection, $sql) or die("wait what\n");
  $row = pg_fetch_row($res);
  if ($row[0] != '') {
    echo ("notification('Название занято','rgba(255, 0, 0, 0.7)');");
  } else {
    $sql = "INSERT INTO team (team) VALUES ('".$title."')";
    pg_query($connection, $sql) or die("wait what\n");
    echo ("notification('Команда создана','rgba(53, 209, 29, 0.7)');");
    echo ("teams_update();");
    echo ("$('#team_add').closest('.row').find('input').val('')");
  }
}

//............Удалить команду.............
if (isset($_POST['team_delete']) && !empty($_SESSION['auth']) && access($connection) == 3) {
  $title = pg_escape_string($_POST['team_delete']);
  $sql = "SELECT count(number_phone) FROM personals WHERE team = '".$title."'";
  $res = pg_query($connection, $sql) or die("wait what\n");
  $row = pg_fetch_row($res);
  if ($row[0] > 0) {
    echo "document.getElementById('teams').innerHTML = `
    <div class='row align-items-center' style='width:100%; margin:0; padding-bottom:10px; padding-top:12px;'>
      <div class='col'>
        <p class='fs-5 text-center'><b>Нельзя удалить команду, пока в ней числятся сотрудники!</b><br></p>
        <p class='fs-6 text-center'>В команде находится ".$row[0]." человек, оставим их без команды или переместим в другую?</p>
      </div>
    </div>
    <div class='row align-items-center' style='width:100%; margin:0; padding-bottom:10px; padding-top:12px;' title=\"".htmlspecialchars($title)."\">
      <div class='col align-items-center'>
        <button id='team_traveling' type='button' class='btn btn-primary' style='width:95%;'>Переместить</button>
      </div>
      <div class='col align-items-center'>
        <button id='team_deleteall' type='button' class='btn btn-primary' style='width:95%;'>Без команды</button>
      </div>
    </div>
    `;";
  } else {
    $sql = "DELETE FROM team WHERE team = '".$title."'";
    pg_query($connection, $sql) or die("wait what\n");
    echo ("notification('Команда удалена','rgba(53, 209, 29, 0.7)');");
    echo ("teams_update();");
  }
}

//............Оставить без команды.............
if (isset($_POST['team_deleteall']) && !empty($_SESSION['auth']) && access($connection) == 3) {
  $title = pg_escape_string($_POST['team_deleteall']);
  $sql = "DELETE FROM team WHERE team = '".$title."'; UPDATE personals SET team = '' WHERE team = '".$title."'";
  pg_query($connection, $sql) or die("wait what\n");
  echo ("notification('Команда удалена','rgba(53, 209, 29, 0.7)');");
  echo ("table_update();");
  echo ("teams_update();");
}

//............Перенести в другие команды..............
if (isset($_POST['team_traveling']) && !empty($_SESSION['auth']) && access($connection) == 3) {
  $title = pg_escape_string($_POST['team_traveling']);
  $sql = "SELECT team FROM team";
  $res = pg_query($connection, $sql) or die("wait what\n");
  $text = '';
  while ($combobox = pg_fetch_array($res)) {
    $text = $text."<option value='".$combobox[0]."'>".$combobox[0]."</option><br>";
  };
  echo "document.getElementById('teams').innerHTML = `
    <div class='row align-items-center' style='width:100%; margin:0; padding-bottom:10px; padding-top:12px;'>
      <div class='col-1'>
        <input id='team_checkbox_all' type='checkbox' class='form-check-input' title='все'>
      </div>
      <div class='col-5'>
      </div>
      <div class='col-6'>
        <select class='form-select' id='team_combobox''>
        <option value=''></option>"
        .$text."
        </select>
      </div>
    </div>
    `;";
  $sql = "SELECT full_name, post FROM personals WHERE team = '".$title."'";
  $res = pg_query($connection, $sql) or die("wait what\n");
  while ($row = pg_fetch_array($res)) {
    echo "document.getElementById('teams').innerHTML += `
    <div class='row align-items-center' style='width:100%; margin:0; padding-bottom:10px; padding-top:12px;'>
      <div class='col-1'>
        <input type='checkbox' class='form-check-input team_checkbox'>
      </div>
      <div class='col-11'>
        <input readonly type='text' class='form-control' value=\"".htmlspecialchars($row[0])." (".htmlspecialchars($row[1]).")\">
      </div>
    </div>
    `;";
  }
  echo "document.getElementById('teams').innerHTML += `
    <div class='row align-items-center' style='width:100%; margin:0; padding-bottom:10px; padding-top:12px;'>
      <div class='col align-items-center'>
        <button id='team_change' type='button' class='btn btn-primary' style='width:95%;'>Переместить</button>
      </div>
      <div class='col align-items-center'>
        <button id='team_back' type='button' class='btn btn-secondary' style='width:95%;'>Отмена</button>
      </div>
    </div>
    `;";
}

//.......Изменение Календаря..............

if(isset($_SERVER['HTTP_X_REQUESTED_WITH']) && !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest' && !empty($_POST['checkdaily'])) {
    $chatid = "SELECT chat_id FROM personals WHERE number_phone='".$_POST['number']."'";
	$chatid = pg_query($connection, $chatid);
	$chatid = pg_fetch_assoc($chatid);
	
	pg_query($connection, "UPDATE public.reports SET tasks='".$_POST['planedit']."', fact='".$_POST['factedit']."', hours='".$_POST['hoursedit']."', worked='".$_POST['stats']."' WHERE chat_id='".$chatid['chat_id']."' AND date='".$_POST['day']."'");
	echo "<script>$('#report').show();calendar_update();var div = $( '#DailyReport' );div.remove();$('.air-datepicker-cell').removeClass('-selected-');</script>";
}
?>