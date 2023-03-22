<?php
include 'db.php';
include 'php.php';
include 'token.php';
//...........Добавление сотрудника...............
if (isset($_GET['button-form']) && $_GET['button-form'] == 'button-add'){
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
if (isset($_GET['button-form']) && $_GET['button-form'] == 'button-save'){
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
  $sql = "SELECT tasks, fact, hours, date FROM reports, personals WHERE number_phone='".$_POST['tel']."' AND date BETWEEN '".$_POST['first']."' AND '".$_POST['last']."' AND reports.chat_id=personals.chat_id";
  $rs = pg_query($connection, $sql) or die("wait what\n");
  while ($row = pg_fetch_array($rs)) {
    if ($row[1] != ''){
      $worked = 'background-color: lime';
    }
    else{
      $worked = 'background-color: red';
    }
    echo "$(\".air-datepicker-cell[day='".$row[3]."']\").append(\"<div class='circle' style='".$worked."'></div>\");";
    if ($row[0] != ''){
      echo "$(\".air-datepicker-cell[day='".$row[3]."']\").append(\"<div class='circle plan'></div>\");";
    }
    echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('plan', '".$row[0]."');";
    echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('fact', '".$row[1]."');";
    echo "$(\".air-datepicker-cell[day='".$row[3]."']\").attr('hours', '".$row[2]."');";
  }
}

//.......Команды..............
if (isset($_POST['teams'])) {
  $sql = "SELECT * FROM team";
  $res = pg_query($connection, $sql) or die("wait what\n");
  while ($combobox = pg_fetch_array($res)) {
    echo  "document.getElementById('teams').innerHTML += `
    <div class='row' style='padding-left:8%;padding-bottom:10px;'>
      <div class='col' style='width:40%; flex:auto;padding:0;'>
        <input type='text' class='form-control' id='' value='".$combobox[0]."'>
      </div>
      <div class='col' style='width:60%; flex:auto; padding:0; padding-left:5px;'>
        <select class='form-select' id='access_level'>
          <option value='".$combobox[1]."'>".$combobox[1]." (".$combobox[1].")</option>;
          }
        </select>
      </div>
    </div>
    `;";
  }
}
?>