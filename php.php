<?php

//.........Выход.............
if(isset($_POST['button-exit']))
{
  $_SESSION['auth']='';
  $_SESSION['access']='';
}

//..........Информация о сотруднике...............
function getdata($connection, $tel)
{
    $query_employee = "SELECT * FROM personals WHERE number_phone='$tel'";
    $result = pg_query($connection, $query_employee) or die('wait what');
    while ($row = pg_fetch_array($result)) {
        $number_phone=$row[0];
        $date_birth=$row[1];
        $full_name=$row[2];
        $post=$row[3];
        $team=$row[4];
        $access_level=$row[5];
        $password=$row[6];
        $chat_id=$row[8];
        $active=$row[7];
    }
    return array($number_phone,$date_birth,$full_name,$post,$team,$access_level,$password,$chat_id, $active);
}

//...........Уровень доступа.................
function access($connection)
{
    $query = "SELECT access_level FROM personals WHERE number_phone='".$_SESSION['auth']."'";
    $res = pg_query($connection, $query) or die('wait what');
    while ($row = pg_fetch_array($res)) {
        if ($row[0]!='' && $row[0]>1){
            return $row[0];
        }
        else {
            $_SESSION['auth']='';
        }
    }
}
?>