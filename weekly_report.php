<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Iridi</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
  <link rel="stylesheet" href="weekly_report/styles.css">
</head>
<body>
  <div class="container h-100 justify-content-center">
    <div class="flex-column" id="tgonly">
    </div>
  </div>
  <div class='modal fade' id='time' aria-hidden="true">
    <div class='modal-dialog modal-dialog-centered' style='--bs-modal-width: auto; margin:0 5vW;'>
      <div class='modal-content'>
        <div class='modal-header'>
        <button type='button' class='btn btn-primary full_day'>Полный рабочий день</button>
          <button type='button' class='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
        </div>
        <div class='modal-body' style='padding:0;' id='edit'>
          <div class="clock">
            <canvas id="clock" style="width:100%; height:100%;"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4" crossorigin="anonymous"></script>
  <script src="weekly_report/scripts.js"></script>
</body>
</html>