<?php
include 'db.php';
include 'php.php';
require_once 'PHPExcel.php';
session_start();

if (!empty($_SESSION['auth']) && access($connection) == 3 && isset($_GET['date'])) {
    $start = $_GET['date'];
    $end = date("Y-m-t", strtotime($start));
    $objExcel = new PHPExcel();
    $sql = "SELECT date FROM reports WHERE date BETWEEN '".$start."' AND '".$end."' GROUP BY date ORDER BY date ASC";
    $rs = pg_query($connection, $sql) or die("wait what\n");
    $dates = array();
    $objExcel->setActiveSheetIndex(0);
    $i = 1;
    $poditog = true;
    $poditog_col;
    $grey = array(
        'fill' => array(
            'type' => PHPExcel_Style_Fill::FILL_SOLID,
            'color' => array('rgb' => 'e6e6e6')
        )
    );
    $blue = array(
        'fill' => array(
            'type' => PHPExcel_Style_Fill::FILL_SOLID,
            'color' => array('rgb' => 'CCDAEA')
        )
    );
    $border_bottom = array(
        'borders'=>array(
            'bottom' => array(
                'style' => PHPExcel_Style_Border::BORDER_THIN,
                'color' => array('rgb' => '808080')
            )
        )
    );
    $border_right = array(
        'borders'=>array(
            'right' => array(
                'style' => PHPExcel_Style_Border::BORDER_THIN,
                'color' => array('rgb' => '808080')
            )
        )
    );
    while ($row = pg_fetch_array($rs)) {
        array_push($dates, $row[0]);
        if ($poditog && date('d', strtotime($row[0]))>15){
            $poditog = false;
            $poditog_col = $i;
            $objExcel->getActiveSheet()->setCellValueByColumnAndRow($i, 1, 'ПОДИТОГ');
            $i++;
        }
        $objExcel->getActiveSheet()->setCellValueByColumnAndRow($i, 1, PHPExcel_Shared_Date::PHPToExcel($row[0]));
        $objExcel->getActiveSheet()->getStyleByColumnAndRow($i, 1)->getNumberFormat()->setFormatCode('DD.MM');
        $objExcel->getActiveSheet()->getStyleByColumnAndRow($i, 1)->applyFromArray($blue);
        $i++;
    };
    $objExcel->getActiveSheet()->setCellValueByColumnAndRow($i, 1, 'ИТОГ');

    $sql1 = "SELECT full_name, array_to_json(ARRAY_AGG(date)), array_to_json(ARRAY_AGG(worked)), array_to_json(ARRAY_AGG(hours)) FROM reports, personals WHERE reports.chat_id = personals.chat_id AND date BETWEEN '".$start."' AND '".$end."' GROUP BY full_name";
    $rs1 = pg_query($connection, $sql1) or die("wait what\n");
    $j = 2;
    while ($row1 = pg_fetch_array($rs1)) {
        $poditog = true;
        $i = 1;
        $arr_date = json_decode($row1[1]);
        $arr_worked = json_decode($row1[2]);
        $arr_hours = json_decode($row1[3]);
        $objExcel->getActiveSheet()->setCellValueByColumnAndRow(0, $j, $row1[0]);
        foreach ($dates as $d) {
            if ($poditog && date('d', strtotime($d))>15){
                $poditog = false;
                $objExcel->getActiveSheet()->setCellValueByColumnAndRow($i, $j, '=SUM(B'.$j.':'.PHPExcel_Cell::stringFromColumnIndex($i-1).$j.')');
                $objExcel->getActiveSheet()->getStyleByColumnAndRow($i, $j)->applyFromArray($grey);
                $i++;
            }
            $text = $arr_hours[array_search($d, $arr_date)];
            if (array_search($d, $arr_date)===false){
                $text = '';
            } else if ($arr_worked[array_search($d, $arr_date)] == 'S') {
                $text = 'Б';
                $objExcel->getActiveSheet()->getStyleByColumnAndRow($i, $j)->applyFromArray($grey);
            } else if ($arr_worked[array_search($d, $arr_date)] == 'V') {
                $text = 'ОТ';
                $objExcel->getActiveSheet()->getStyleByColumnAndRow($i, $j)->applyFromArray($grey);
            } else if ($arr_worked[array_search($d, $arr_date)] == 'D') {
                $text = 'ДО';
                $objExcel->getActiveSheet()->getStyleByColumnAndRow($i, $j)->applyFromArray($grey);
            };
            $objExcel->getActiveSheet()->setCellValueByColumnAndRow($i, $j, $text);
            $i++;
        }
        $objExcel->getActiveSheet()->setCellValueByColumnAndRow($i, $j, '=SUM('.PHPExcel_Cell::stringFromColumnIndex($poditog_col).$j.':'.PHPExcel_Cell::stringFromColumnIndex($i-1).$j.')');
        $objExcel->getActiveSheet()->getStyleByColumnAndRow($i, $j)->applyFromArray($grey);
        $j++;
    };

    $objExcel->getActiveSheet()->getColumnDimension('A')->setAutoSize(true);
    foreach (range('A', $objExcel->getActiveSheet()->getHighestDataColumn()) as $col) {
        $objExcel->getActiveSheet()->getColumnDimension($col)->setWidth('6');
    };
    $objExcel->getActiveSheet()->getColumnDimension($objExcel->getActiveSheet()->getHighestDataColumn())->setWidth('10');
    $objExcel->getActiveSheet()->getColumnDimension(PHPExcel_Cell::stringFromColumnIndex($poditog_col))->setWidth('10');
    $objExcel->getActiveSheet()->getStyle('A1:'.$objExcel->getActiveSheet()->getHighestDataColumn().'1')->applyFromArray($border_bottom);
    $objExcel->getActiveSheet()->getStyle('A1:A'.$objExcel->getActiveSheet()->getHighestDataRow())->applyFromArray($border_right);

    header("Expires: Mon, 1 Apr 1974 05:00:00 GMT");
    header("Cache-Control: no-cache, must-revalidate");
    header("Pragma: no-cache");
    header("Content-type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    header("Content-Disposition: attachment; filename=".date('m.y', strtotime($start))."_табель.xlsx");

    $objWriter = PHPExcel_IOFactory::createWriter($objExcel, 'Excel2007');
    $objWriter->save('php://output'); 
    exit();
}
?>