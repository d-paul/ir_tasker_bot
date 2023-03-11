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

//.........Модальное оконо (подтверждение удаления)........
function warn(){
  $('#modal_warn').modal('show');  
};

//..........Удаление предупреждений о заполнености форм...........
if ( window.history.replaceState ) {
  window.history.replaceState( null, null, window.location.href );
};

//.........Календарь...............
$(document).on('click focus','.datepicker', function() {
  $(this).datepicker({format: "yyyy-mm-dd"});
});

//............Модальное окно (Добавление сотрудника).............
function add(){
  $('#modal_add').modal('show');  
};

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
//Фильтры
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
  $('.emp_edit').removeClass('row_selected');
  if ($('#selected').val() == $(this).val()){
    $('#selected').val('');
    $('#report').animate({width: 0}, 500);
    $('#left').animate({width: $("body").prop("clientWidth")}, 500);
    $('.team-report').show();
    $('.post-report').show();
  }
  else{
    $('#report').show();
    $('#selected').val($(this).val());
    $(this).closest('.emp_edit').toggleClass('row_selected');
    $('#report').animate({width: $("body").prop("clientWidth")/2}, 500);
    $('#left').animate({width: $("body").prop("clientWidth")/2}, 500);
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
    $('.air-datepicker-body').append(`<div class="modal" id="DailyReport" aria-hidden="true" data-backdrop=”false”>
      <div class="modal-dialog custom-class" id="DailyReport_content" style="position:absolute; margin:0;">
        <div class="modal-content" style='padding:5px; height:100%; background-color: rgb(247, 247, 247);'>
          <label style='border-bottom: 1px solid grey;'>${$(this).attr('day')}</label>
          <label for='plan'>План</label>
          <textarea class='form-control' id='plan' type='text'>${$(this).attr('plan') ?? ''}</textarea>
          <label for='fact'>Факт</label>
          <textarea class='form-control' id='fact' type='text'>${$(this).attr('fact') ?? ''}</textarea>
          <div class='row' style='padding-top:5px'>
            <label for='hours' style='width:70px'>Часы:</label>
            <input maxlength='2' class='form-control' id='hours' type='text' style='width:30px; padding:2px' value='${$(this).attr('hours') ?? ''}'>
          </div>
        </div>
      </div>
    </div>`);
  let top = $(this).offset().top+$(this).height()*3/4;
  let left = $(this).offset().left+$(this).width()/2-$('#DailyReport').width()/2;
  if ( ($('body').height() - top) < 280 ){
    top = ($('body').height() - ($('body').height() - top)-60)
  }
  $('#DailyReport').offset({top: top, left: left});
  $('#DailyReport').show();
});

//..................Закрытие ежедневного отчета...................
$(function($){
	$(document).mouseup( function(e){ 
		var div = $( "#DailyReport" );
		if ( !div.is(e.target) && div.has(e.target).length === 0 ) { 
			div.remove();
      $('.air-datepicker-cell').removeClass('-selected-');
		}
	});
});

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
