import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { NOMBRE_SIST } from './../../constants';
import labelExportGrillas from './labelExportGrillas'

function exportToCSV(a_titulo, a_subtit ,a_sqlGrilla) {

    var today = new Date();
    const fileName = a_titulo.replaceAll(' ','_')+`_${NOMBRE_SIST}`
    const hoy = `${today.getDate()}/${(today.getMonth() + 1)<10?`0${(today.getMonth() + 1)}`:`${(today.getMonth() + 1)}`}/${today.getFullYear()}`
    const fileExtension = '.xlsx';

    /* ========= Obtengo datos ===============*/
    axios.get(a_sqlGrilla)
    .then((response) => {
        
        var registros = response.data[0];
        var colTitulo = '';
        //var colTitulo = labelExportGrillas(response.data[0][0]) // Obtengo cabeceras
        labelExportGrillas(response.data[0][0], function(data){
            colTitulo = data;
           

       
        var Heading = [
                [`${NOMBRE_SIST} : ${hoy} `],
                [`${a_titulo}`],
                [`${a_subtit}`]
            ];

        Heading.push(colTitulo)
        var Headcol = [] //desplaza columnas
        var ws = XLSX.utils.aoa_to_sheet(Heading);
    
        XLSX.utils.sheet_add_json(ws, registros, { header:Headcol, skipHeader:true, origin:-1});
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "SheetJS");
        var wbout = XLSX.write(wb, {bookType:'xlsx', type:'array'});
        FileSaver.saveAs(new Blob([wbout],{type:"application/octet-stream"}), fileName + fileExtension);

    })
        /* const ws = XLSX.utils.json_to_sheet(csvData);
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], {type: this.state.fileType});
        //FileSaver.saveAs(data, fileName + this.state.fileExtension); */

    })
    .catch((error) => {
        alert('ERROR interno API al exportar datos BD:'+error)
    })
        
}


export default exportToCSV;
