<?php
include 'db.php';
$webAppUrl = ((!empty($_SERVER['HTTPS'])) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'];
$approve = pg_fetch_row(pg_query($connection, "SELECT chat_id FROM personals WHERE access_level = 4"))[0];
?>