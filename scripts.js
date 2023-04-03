//.........Загрузка страницы............
//Вывод таблицы
$(document).ready(function(){
    $('#table').load('table.php');
  });

//...........Модальное окно (Редактирование сотрудника)..........
function but_emp(tel) {
  document.getElementById("form_edit").innerHTML = '';
  $('#Modal').modal('show');
  $.ajax({
    type: "POST",
    url: "edit.php?tel="+tel,
    data: {},
    success: function (data) {
      document.getElementById("form_edit").innerHTML = data;
    }
  });
}

//...............Кнопка редактирования(пк)..............
$(document).on('click', '.but_edit', function () { 
  but_emp(this.value);
});

//.................Редактирование нажатием(не пк)............
$(document).on('click', '.emp_edit', function (e) {
  if($(document).width() < 1001){
    document.getElementById('list_content').style.left=event.clientX+'px';
    document.getElementById('list_content').style.top=event.clientY+'px';
    $('#list').modal('show');
    modal_but_edit.value = $(this).attr('value');
  };
});
$(document).ready(function(){
$('#list').modal({
  backdrop: false
});
});
$(document).on('click', '#list', function () { 
  $('#list').modal('hide')
});

//..........Удаление предупреждений о заполнености форм...........
if ( window.history.replaceState ) {
  window.history.replaceState( null, null, window.location.href );
};

//.........Календарь...............
$(document).on('click focus','.datepicker', function() {
  $(this).datepicker({format: "yyyy-mm-dd"});
});

//............Модальное окно (Добавление сотрудника).............
$(document).on('click', '#button_add', function () {
  $('#modal_add').modal('show');
})

//............Кнопки форм............
$(document).on('submit', '.formsql', function (e) {
        var form_data = $(this).serialize();
        var urlphp = "ajax.php?"+form_data;
        $.ajax({
            type: "POST",
            url: urlphp,
            data: {},
            success: function (data) {
              eval(data);
            }
        });
    });

//.............Обновление таблицы..............
function table_update(){
  var form_data = $('.form-filters').serialize();
  var urlphp = "table.php?"+form_data;
  var sort = $("#sort-check").val();
  var type = $("#sort-check").attr("sort");
  $.ajax({
    type: "POST",
    url: urlphp,
    data: {sort: sort, type: type},
    success: function (data) {
      document.getElementById("table").innerHTML = data;
    }
  });
}

//Фильтр
$(document).on('change', '.filters', function () {
    table_update();
  });
  
//Сортировка
$(document).on('click', '.sort', function () {
  if ($("#sort-check").val()==$(this).attr("value")){
    if ($("#sort-check").attr("sort")=="ASC"){
      var newtext = $(this).text().replace('↑','↓')
      $(this).text(newtext);
      $("#sort-check").attr("sort","DESC");
    }
    else {
      var newtext = $(this).text().replace('↓','↑')
      $(this).text(newtext);
      $("#sort-check").attr("sort","ASC");
    }
  }
  else {
    $(".sort").each(function(i, obj) {
      newtext=$(this).text().replace(/[↑↓]/g,"");
      $(this).text(newtext);
    });
    var newtext = $(this).text()+" ↑";
    $(this).text(newtext);
    $("#sort-check").val($(this).attr("value"));
    $("#sort-check").attr("sort","ASC");
  }
  table_update();
})

//..........Авторизация.............
//Отправка номера и кода
function auth_num() {
  var form_data = $('#auth').serialize();
  var urlphp = "ajax.php?"+form_data;
  $.ajax({
    type: "POST",
    url: urlphp,
    data: {},
    success: function (data) {
      eval(data);
    }
  });
};
//Возврат к вводу номера
function auth_back() {
  $.ajax({
    type: "POST",
    url: "ajax.php?Back=da",
    data: {},
    success: function (data) {
      document.getElementById("auth").innerHTML = data;
    }
  });
};

//...................Кнопка отчета..................
$(document).on('click', '.but_report', function () {
  $("#DailyReport").remove();$("#DailyReport").remove();
  $('.emp_edit').removeClass('row_selected');
  if ($('#selected').val() == $(this).val()){
    $('#selected').val('');
    $('#report').animate({width: 0}, 500);
    $('#left').animate({width: $("body").prop("clientWidth")}, 500);
    $('.team-report').show();
    $('.post-report').show();
	$('#report').hide();
  }
  else{
    $('#report').show();
    $('#selected').val($(this).val());
    $(this).closest('.emp_edit').toggleClass('row_selected');
    $('#report').animate({width: "50vw"}, 500);
    $('#left').animate({width: "49vw"}, 500)
    if($(document).width() < 1400){
      $('.team-report').hide();
    }
    if($(document).width() < 1200){
      $('.post-report').hide();
    }
    calendar_update();
  }
});

//............Статичный календарь..............
new AirDatepicker('#report', {
  onRenderCell({date, cellType}) {
    let nolik_month = (date.getMonth() < 9) ? '0' : '';
    let nolik_day = (date.getDate() < 10) ? '0' : '';
    if (cellType === 'day') {
      return {
        attrs: {
          day: date.getFullYear()+'-'+nolik_month+(date.getMonth()+1)+'-'+nolik_day+date.getDate()
          }
        }
      }
    },
    onChangeViewDate(){  
      setTimeout(() => {
      calendar_update();
    }, 1);
    }
  })
//............Обновление данных календаря............
function calendar_update(){
  $('.circle').remove();
    $.ajax({
      type: "POST",
      url: "ajax.php",
      data: {first: $('.air-datepicker-cell.-day-:first').attr('day'), last: $('.air-datepicker-cell.-day-:last').attr('day'), tel: $('#selected').val()},
      success: function (data) {
        eval(data);
      }
    });
}

//.............Открытие ежедневного отчета................
$(document).on('click', '.air-datepicker-cell.-day-:not(.-other-month-)', function () {
	  $('#Daily').append(`<div class="modal" id="DailyReport" style="display: contents;" aria-hidden="true" data-backdrop=”false”>
      <div class="modal-dialog custom-class" id="DailyReport_content" style="margin:0;">
        <div class="modal-content" style='padding:5px; height:100%; background-color: rgb(247, 247, 247);'>
		  <a onclick="closedaily()" class="close" style="position: absolute; right:0px"></a>
          <label style='border-bottom: 1px solid grey;'>${$(this).attr('day')}</label>
		  <form id="feedback-form" action="">
			  <input type="hidden" name="checkdaily" value="submit">
			  <input type="hidden" name="number" value="${$(this).attr('tel') ?? ''}">
			  <input type="hidden" name="day" value="${$(this).attr('day')}">
			  <label for='plan'>План</label>
			  <textarea class='form-control' id='plan' type='text' name='planedit'>${$(this).attr('plan') ?? ''}</textarea>
			  <label for='fact'>Факт</label>
			  <textarea class='form-control' id='fact' type='text' name='factedit'>${$(this).attr('fact') ?? ''}</textarea>
			  <div class='row' style='padding-top:5px'>
				<label for='hours' style='width:70px'>Часы:</label>
				<input maxlength='2' class='form-control' id='hours' type='text' style='width:30px; padding:2px' name="hoursedit" value='${$(this).attr('hours') ?? ''}'>
				<label style='width: 76px;'>Статус: </label>
				<select style='width: auto;' name='stats'>
				<option value="Y" ${$(this).attr('work') ?? ''}>Работал</option>
				<option value="N" ${$(this).attr('nowork') ?? ''}>Не работал</option>
				<option value="S" ${$(this).attr('sick') ?? ''}>Больничный</option>
				<option value="V" ${$(this).attr('vacation') ?? ''}>Отпуск</option>
				<option value="D" ${$(this).attr('takeaday') ?? ''}>Взял день</option>
				</select>
			  </div>
				<button type="submit" name="submit" style="margin-left: 5%;width: 90%;margin-top: 1%;">Изменить</button><br>
				<button onclick="$( '#DailyReport' ).remove();$('#report').show()" style="margin-left: 5%;width: 90%;margin-top: 1%;">Отмена</button
		  </form>
			<script>
			  $(document).ready(function () {
			$("#feedback-form").submit(function () {
				// Получение ID формы
				var formID = $(this).attr('id');
				// Добавление решётки к имени ID
				var formNm = $('#' + formID);
				$.ajax({
					type: "POST",
					url: '/ajax.php',
					data: formNm.serialize(),
					beforeSend: function () {
						// Вывод текста в процессе отправки
						$(formNm).html('<p style="text-align:center">Сохранение...</p>');
					},
					success: function (data) {
						// Вывод текста результата отправки
						$(formNm).html('<p style="text-align:center">'+data+'</p>');
					},
					error: function (jqXHR, text, error) {
						// Вывод текста ошибки отправки
						$(formNm).html(error);
					}
				});
				return false;
			});
			});
			</script>
        </div>
      </div>
    </div>`);
  $('#report').hide();
  calendar_update();
  $('#DailyReport').show();
	
});

//..................Закрытие ежедневного отчета...................
function closedaily() {
	var div = $( "#DailyReport" );
	div.remove();
	$('#report').show();
	$(this).closest('.emp_edit').toggleClass('row_selected');
	$('#report').animate({width: "50vw"}, 700);
    $('#left').animate({width: "49vw"}, 500)
	if($(document).width() < 1200){
	  $('.team-report').hide();
	}
	if($(document).width() < 1200){
	  $('.post-report').hide();
	}
	$('.air-datepicker-cell').removeClass('-selected-');
}

//..........Вставка номера................
$(document).on('paste', "input[type='tel']", function(e) {
  e.preventDefault();
  let tel = (e.originalEvent || e).clipboardData.getData('text/plain').replace(/\D/g,'');
  let text = $(this).val();
  if (tel.substring(0,2) == '+7'){
    tel = tel.substring(2,tel.length);
  }
  else if (tel.length == 11 && (tel.substring(0,1) == 7 || 8)){
    tel = tel.substring(1,tel.length);
  }
  tel = tel.substring(0,10-$(this).val().length+(e.target.selectionEnd-e.target.selectionStart)) ?? '';
  text = text.substring(0,e.target.selectionStart)+tel+text.substring(e.target.selectionEnd,e.length);
  $(this).val(text);
});

//...........Авторизация(enter).......
$(document).on('keypress','.auth_enter' , function (e) {
  if(e.which === 13){
    $('.auth_button').click();
  }
});

//..........Модальное окно(команды)....................
$(document).on('click', '#teams_but', function() {
  $('#modal_teams').modal('show');
  teams_update();
})

function teams_update() {
  document.getElementById('teams').innerHTML = '';
  $.ajax({
    type: "POST",
    url: "ajax.php",
    data: {teams: 'da',},
    success: function (data) {
      eval(data);
    }
  });;
}

//..........Модальное окно(табель)...................
$(document).on('click', '#report_card', function() {
  $('#modal_report_card').modal('show');
});
new AirDatepicker('#report_card_calendar', {
  view: 'years',
  minView: 'months',
  onRenderCell({date, cellType}) {
    let nolik_month = (date.getMonth() < 9) ? '0' : '';
    if (cellType === 'month') {
      return {
        attrs: {
          date: date.getFullYear()+'-'+nolik_month+(date.getMonth()+1)+'-01'
          }
        }
      }
    },
  })

$(document).on('click', '#report_card_calendar .-month-', function() {
  $('#modal_report_card').modal('hide');
  location.href='report_card.php?date='+$(this).attr('date');
})

//............Изменить название команды..............
$(document).on('click', '#team_rename', function() {
  $.ajax({
    type: "POST",
    url: 'ajax.php',
    data: {team_title: $(this).closest('.row').attr('title'), team_rename: $(this).closest('.row').find('input').val()},
    success: function (data) {
      eval(data);
    }
  });
})

//............Добавить команду..............
$(document).on('click', '#team_add', function() {
  $.ajax({
    type: "POST",
    url: 'ajax.php',
    data: {team_add: $(this).closest('.row').find('input').val()},
    success: function (data) {
      eval(data);
    }
  });
})

//............Удалить команду..............
$(document).on('click', '#team_delete', function() {
  $.ajax({
    type: "POST",
    url: 'ajax.php',
    data: {team_delete: $(this).closest('.row').attr('title')},
    success: function (data) {
      eval(data);
    }
  });
})

//............Оставить без команды..............
$(document).on('click', '#team_deleteall', function() {
  $.ajax({
    type: "POST",
    url: 'ajax.php',
    data: {team_deleteall: $(this).closest('.row').attr('title')},
    success: function (data) {
      eval(data);
    }
  });
})

//............Перенести в другие команды..............
$(document).on('click', '#team_traveling', function() {
  $.ajax({
    type: "POST",
    url: 'ajax.php',
    data: {team_traveling: $(this).closest('.row').attr('title')},
    success: function (data) {
      eval(data);
    }
  });
})

//...................Выбрать всех...............
$(document).on('click', '#team_checkbox_all', function() {
  if ($(this).is(':checked')) {
    $('.team_checkbox').prop('checked', true);
  } else {
    $('.team_checkbox').prop('checked', false);
  }
})

//................Отмена удаления команд..................
$(document).on('click', '#team_back', function() {
  teams_update();
})

//...............Переместить в другую команду..................
$(document).on('click', '#team_change', async function() {
  await $(".team_checkbox:checked").each(function(){
    $(this).closest('.row').remove();
  });
  if (await !$(".team_checkbox").length) {
    alert('всё, дальше не готово');
  };
})

//.............Уведомления...................
function notification(text, color) {
  if (!document.querySelector('#notifications')) {
    let notifications = document.createElement('div');
    notifications.id = 'notifications';
    document.body.appendChild(notifications);
  }
  let notification = document.createElement('div');
  notification.classList.add('notification');
  notification.innerText = text;
  notification.style.background = color;
  document.querySelector('#notifications').appendChild(notification);
  setTimeout( () => {notification.remove(); removenotifications()}, 3000);
}

function removenotifications() {
  let notification = document.querySelectorAll('#notifications .notification');
  if (notification.length == 0){
    document.querySelector('#notifications').remove();
  }
};