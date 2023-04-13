<?php
include 'db.php';
$webAppUrl = 'https://webapp.test.iridi.com';
$approve = pg_fetch_row(pg_query($connection, "SELECT chat_id FROM personals WHERE access_level = 4"))[0];
?>