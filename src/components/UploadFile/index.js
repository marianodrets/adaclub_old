import React  from 'react';
import { URL_DBQUERY } from '../../constants';
import { Button } from 'react-bootstrap';
//import Message from '../Message';
//import Progress from '../Progress';
import axios from 'axios';

class UploadFileComponent extends React.Component {
  constructor(props) {
  super(props);

      this.state = {
          filename : 'Selec archivo...',
          alta_usua: props.alta_usua,
          soci_codi: props.soci_codi,
          showGraba: false,
          message  : '',
      };    

  }

  fileSelectedHandler = () => {
    var preview = document.querySelector('img');
    var file    = document.querySelector('input[type=file]').files[0];
    var reader  = new FileReader();

    reader.onloadend = function () {
      preview.src = reader.result;
      var imag = reader.result;
      // subimos la imagen como un string Hexa directo a la columna Blob , al ser async lo paso a variabla HTML
      document.getElementById("stringImagen").innerHTML = imag;
    }

    if (file) {
      reader.readAsDataURL(file);
      this.setState({filename : file.name,
                     showGraba : true });
    } else {
      preview.src = "";
    }
    //console.log('imag fuera',imag);
  };


  onSubmitAgregarImagen = (event) => {

    event.preventDefault();

    var body = {} //new Object();
    body.soci_codi = this.state.soci_codi;
    body.alta_usua = this.state.alta_usua;
    body.imagen  = document.getElementById("stringImagen").innerHTML
    
    const sql = `${URL_DBQUERY}/putFotSoc/`
    //console.log('sql',sql)
    //console.log(body)
    axios.post(sql, body )
    .then((response) => {
      this.setState({
        respuestaSp: response.data[0]
      })

      var obj = this.state.respuestaSp[0];
      this.setState({
        respError : obj.respuesta
      })

      if (this.state.respError==='OK') {
          /*
          this.setState({
              mensajeAlerta : 'Registrado correctamente',
              mensajeColor  : 'green',
          }) */
          this.props.onSubmitFunction(true) // acepto y subo señar para cerrar la modal
      }    
    
      })
      .catch((error) => {
        alert('ERROR interno API al actualizar BD:'+error)
      })

  };

 
  render() {
      return ( 
        <div className='custom-file mb-4'>
          <input
              type='file'
              className='custom-file-input'
              id='customFile'
              onChange={this.fileSelectedHandler} />
          <label className='custom-file-label' htmlFor='customFile'>
              {this.state.filename}
          </label>
         
          <img src="" alt="imagen" height="200"></img>


          <p id="stringImagen" style={{ display: 'none' }} ></p>
          <Button variant="success" 
              style={ this.state.showGraba ? {} : { display: 'none' } }
              onClick={this.onSubmitAgregarImagen} >Grabar imagen
          </Button>
       
        </div>
      );
  }
}

export default UploadFileComponent;
  
