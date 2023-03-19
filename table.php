<?php
    include "db.php";
    include "php.php";
    session_start();
    if(!empty($_SESSION['auth'])){
        $query = "SELECT * FROM personals WHERE number_phone = '".$_SESSION['auth']."' OR access_level<".access($connection);
        if (isset($_GET['filter-post']) && $_GET['filter-post']!='Все'){
            $query .= " AND post = '".$_GET['filter-post']."'";
        }
        if (isset($_GET['filter-team']) && $_GET['filter-team']!='Все'){
            $query .= " AND team = '".$_GET['filter-team']."'";
        }
        if (isset($_GET['active-check']) && $_GET['active-check']=='Y'){
            $query .= " AND active != ''";
        }
        else{
            $query .= " AND active != 'N'";
        }
        if (isset($_GET['search']) && $_GET['search']!=''){
            $search=trim(pg_escape_string($_GET['search']));
            if (mb_substr($search,0,1)=='+'){
                $search=substr($search,1,mb_strlen($search));
            }
            $query .= " AND ( number_phone iLIKE '%".$search."%' OR full_name iLIKE '%".$search."%' OR post iLIKE '%".$search."%' OR team iLIKE '%".$search."%')";
        }
        if (isset($_POST['sort'])){
            $query .= " ORDER BY ".$_POST['sort']." ".$_POST['type'];
        }
        else {
            $query .= " ORDER BY full_name ASC";
        }
        $rs = pg_query($connection, $query) or die("wait what\n");
        while ($row = pg_fetch_array($rs)) {
            if ($row[7]=='N'){
                $NonActive='NonActive';
            }
            else{
                $NonActive='';
            }
            if ($row[0]==$_GET['selected']){
                $selected='row_selected';
            }
            else{
                $selected='';
            }
            echo "
            <tr class='emp_edit $NonActive $selected' value='$row[0]'>
            <td>+$row[0]</td>
            <td>$row[2]</td>
            <td class='post-report'>$row[3]</td>
            <td class='team-report'>$row[4]</td>
            <td class='text-center actions'><button class='but_edit' value='$row[0]'>Ред.</button> <button class='but_report' value='$row[0]'>Отч.</button></td>
            </tr>
            ";
        }
    }
?>