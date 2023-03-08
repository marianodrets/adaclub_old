import { URL_DB } from './../../constants';
import axios from 'axios';
import toTitleCase from './toTitleCase.js'

function labelExportGrillas(a_reg, callback) {
    /* paso un reg del reporte, y devuelvo vector de titulos de columna */
    const sql = `${URL_DB}SEL_ZZ_DB_LABEL()`
    axios.get(sql)
      .then((response) => {
  
          const registros = response.data[0];
          const cols = Object.keys(a_reg);
          var colTitulo = [];
          var label = '';
          
          cols.forEach((elem) => {
            label = registros.find(f => f.zzlb_db.toLowerCase()===elem.toLowerCase())
          
            if (typeof label === 'undefined') {
                colTitulo.push(toTitleCase(elem)) // Si no esta pongo la misma que la BD
            } else {
                colTitulo.push(label.zzlb_label)
            }
          });

          callback(colTitulo);
      })
      .catch((error) => console.log(error))
   
 //return colTitulo
}

export default labelExportGrillas;