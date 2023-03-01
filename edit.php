<?php 
    session_start();
    include 'db.php';
    include 'php.php';
      $employee = getdata($connection, $_GET["tel"]);
      ?>
        <input type="hidden" name="button-form" value="button-save">
          <div class="col-auto mx-auto">
            <label for="number_phone">Номер телефона</label>
            <input readonly type="text" class="form-control" id="number_phone" name="number_phone" value="+<?php echo($employee[0]) ?>" maxlength="12">
          </div>
          <div class="col-auto mx-auto">
            <label for="date_birth">Дата рождения</label>
            <div class="input-group date datepicker" id="datepicker">
              <input readonly type="text" class="form-control" id="date_birth" name="date_birth" data-date-format='yy-mm-dd' value="<?php echo($employee[1]) ?>">
              <span class="input-group-append">
                <span class="input-group-text bg-white" style="height:100%">
                  <i class="fa fa-calendar"></i>
                </span>
              </span>
            </div>
          </div>
          <div class="col-auto mx-auto">
            <label for="full_name">ФИО</label>
            <input type="text" class="form-control" id="full_name" name="full_name" value="<?php echo($employee[2]) ?>">
          </div>
          <div class="col-auto mx-auto">
            <label for="post">Должность</label>
            <input type="text" class="form-control" name="post" id="post" value="<?php echo($employee[3]) ?>">
          </div>
          <div class="col-auto mx-auto">
            <label for="team">Команда</label>
            <select class="form-select" name="team" id="team">
            <?php
              echo "<option value='".$employee[4]."' selected hidden>".$employee[4]."</option>";
              $sql_com = "SELECT * FROM team";
              $rescom = pg_query($connection, $sql_com) or die("wait what\n");
              while ($combobox = pg_fetch_array($rescom)) {
                echo "<option value='".$combobox[0]."'>".$combobox[0]."</option>";
              }
            ?>
            </select>
          </div>
          <div class="col-auto mx-auto">
            <label for="access_level">Уровень доступа</label>
            <select class="form-select" name="access_level" id="access_level">
            <?php
              if ($employee[5]==''){
                $access=0;
              }
              else{
                $access=$employee[5];
              }
              $sql_com = "SELECT * FROM root WHERE access_level=".$access;
              $rescom = pg_query($connection, $sql_com) or die("wait what\n");
              while ($combobox = pg_fetch_array($rescom)){
                echo "<option value=".$combobox[0]." selected hidden>".$combobox[1]."</option>";
              };
              $sql_com = "SELECT * FROM root";
              $rescom = pg_query($connection, $sql_com) or die("wait what\n");
              while ($combobox = pg_fetch_array($rescom)) {
                if ($combobox[0]<access($connection)){
                echo "<option value=".$combobox[0].">".$combobox[1]."</option>";
                }
              }
            ?>
            </select>
          </div>
          <div class="col-auto mx-auto">
            <label for="active"></label>
            <input <?php if ($employee[8]=="Y") { ?>checked<?php } ?> style="margin-top:30%" type="checkbox" class="form-check-input" id="active" name="active" value="Y">
            <label style="margin-top:23%" for="active">Active</label>
          </div>
          <?php
          if ($employee[5] < access($connection)){
          ?>
          <div class="mx-auto" style="margin-top:15px">
            <button type="submit" class="btn btn-primary" name="button-save">Сохранить изменения</button>
          </div>
          <?php
          }
          ?>
        