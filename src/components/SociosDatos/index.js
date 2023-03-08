import React  from 'react';
import { URL_DB, URL_DBQUERY } from '../../constants';
import axios from 'axios';
import { Row, Col, Container, Button, Form, Alert, Card, Modal } from 'react-bootstrap';
import Select from 'react-select';
import WebcamCapture from '../Webcam/Webcam';
import UploadFileComponent from '../UploadFile/index.js';
import Notifications from '../Notifications';
import swal from 'sweetalert';
import AutosuggestsComponent from '../Autosuggest/index.js';
import '../Autosuggest/autosuggest.css';
import '../../pages/stylePages.css';
import { FaUserPlus, FaCamera } from "react-icons/fa";

class SociosDatos extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lee_mod : props.lee_mod,
      registros: [],
      filterGrilla:'',
      socio:[],
      sexo:[],
      localidades:[],
      parentesco:[],
      nacionalidad:[],
      actividades: [],
      comportamPago:[],
      categorias:[],
      motivosBaja:[],
      imagen:[],
      login_id: sessionStorage.getItem('USUA_ID'),

      soci_codi: '',
      soci_ape: '',
      soci_nom: '',
      soci_cate_codi: '',
      soci_domi: '',
      soci_loca_id: 183,
      soci_naci_f: '',
      soci_ingre_f: '',
      soci_sexo: 'O',
      soci_docu: '',
      soci_pais: 'AR',
      soci_celular: '',
      soci_tele: '',
      soci_mail: '',
      soci_responsable: '',
      soci_resp_pare_id: 0,
      soci_resp_celu: '',
      soci_nota: '',
      soci_alta_f: '',
      soci_alta_usua: '',
      soci_baja_f: '',
      soci_baja_usua: '',
      soci_baja_moti: '',

      confirmaBaja: '',
      estado: '',
      estado_color: '',
      ult_cuota_paga: '',
      sofa_grupo_deno: '',
      meses_deu: '',
      cate_color:'',
      rehab_motivo:'', 
      param_loca:'',
      param_pais:'',
      autosuggestValue: '',
      colorOblig : '#cce6ff',
      colorOpc : '#f0f5f5',
      fetchingregistros: false,
      fetchimagen: false,
      showModalBorr: false,
      showModalRehab: false,
      showAltaSociOk: false,
      showCamWeb:false,
      showGetFoto:false,
      selectedOption: [],

      respuestaSp: [],
      respError: '',
      mensajeAlerta: '',
    };
    
  }

  async getSocioDatos(a_socio) {

    this.setState({ fetchingregistros: true });
    const sql =  `${URL_DB}SEL_SOCIO_ABM(${a_socio})`;
    axios.get(sql)
    .then((response) => {
      this.setState({
        soci_codi:        response.data[0][0].soci_codi,
        soci_ape:         response.data[0][0].soci_ape,
        soci_nom:         response.data[0][0].soci_nom,
        soci_cate_codi:   response.data[0][0].soci_cate_codi,
        soci_domi:        response.data[0][0].soci_domi,
        soci_loca_id:     response.data[0][0].soci_loca_id, 
        soci_naci_f:      response.data[0][0].soci_naci_f,
        soci_sexo:        response.data[0][0].soci_sexo,
        soci_ingre_f:     response.data[0][0].soci_ingre_f,
        soci_docu:        response.data[0][0].soci_docu,
        soci_pais:        response.data[0][0].soci_pais,
        soci_celular:     response.data[0][0].soci_celular,
        soci_tele:        response.data[0][0].soci_tele,
        soci_mail:        response.data[0][0].soci_mail,
        soci_responsable: response.data[0][0].soci_responsable,
        soci_resp_pare_id:response.data[0][0].soci_resp_pare_id,
        soci_resp_celu:   response.data[0][0].soci_resp_celu,
        soci_nota:        response.data[0][0].soci_nota,
        soci_alta_f:      response.data[0][0].soci_alta_f,
        soci_alta_usua:   response.data[0][0].soci_alta_usua,
        soci_baja_f:      response.data[0][0].soci_baja_f,
        soci_baja_usua:   response.data[0][0].soci_baja_usua,
        soci_baja_moti:   response.data[0][0].soci_baja_moti,
        rehab_motivo  : '',
        estado:           response.data[0][0].estado,
        estado_color:     response.data[0][0].estado_color,
        ult_cuota_paga:   response.data[0][0].ult_cuota_paga,
        sofa_grupo_deno:  response.data[0][0].sofa_grupo_deno,
        meses_deu:        response.data[0][0].meses_deu,
        cate_color:       response.data[0][0].cate_color,
        confirmaBaja: '',
      })
    })      
    .catch((error) => console.log(error))
  }
 

  async getActividades(a_socio) {
    const sql =  `${URL_DB}SEL_SOCIOS_ACTIVIDADES_DDM(${a_socio})`
    axios.get(sql)
      .then((response) => {
        this.setState({
          actividades : response.data[0],
          selectedOption :response.data[0].filter(elem => elem.si_no==='S')
        })
      })
      .catch((error) => console.log(error))
  }


  async getLocalidades() {

    const sql = `${URL_DB}SEL_LOCALIDAD_PARTIDO_DD()`
    axios.get(sql)
    .then((response) => {
      this.setState({
        localidades: response.data[0]
      })
    })
    .catch((error) => console.log(error));
  }
 
  async getNacionalidad() {

    const sql = `${URL_DB}SEL_PAISES_DD()`
    axios.get(sql)
    .then((response) => {
      this.setState({
        nacionalidad: response.data[0]
      })
    })
    .catch((error) => console.log(error));
  }
 
  async getCategorias() {
    const sql =  `${URL_DB}SEL_SOCIOS_CATEGORIAS('A')`
    axios.get(sql)
      .then((response) => {
        this.setState({
          categorias: response.data[0]
        })
      })
      .catch((error) => console.log(error))
  }

  async getComportam(a_socio) {

    const sql = `${URL_DB}SEL_SOCIOS_PAGO_COMPORTAM(${a_socio})`
    axios.get(sql)
    .then((response) => {
      this.setState({
        comportamPago: response.data[0],
      })
    })
    .catch((error) => console.log(error));
  }

  async getSexo() {
    const sql =  `${URL_DB}SEL_SEXO()`
    axios.get(sql)
      .then((response) => {
        this.setState({
          sexo: response.data[0]
        })
      })
      .catch((error) => console.log(error))
  }
  
  async getParentesco() {
    const sql =  `${URL_DB}SEL_PARENTESCO()`
    axios.get(sql)
      .then((response) => {
        this.setState({
          parentesco: response.data[0]
        })
      })
      .catch((error) => console.log(error))
  }
     
  async getMotivosBaja() {
    const sql =  `${URL_DB}SEL_BAJA_MOTIVOS_DD('SOCIO')`
    axios.get(sql)
      .then((response) => {
        this.setState({
          motivosBaja: response.data[0]
        })
      })
      .catch((error) => console.log(error))
  }
  
  async getParametros() {
    const sql =  `${URL_DB}SEL_PARAMETROS()`
    axios.get(sql)
      .then((response) => {
        this.setState({
          param_loca: response.data[0][0].loca,
          param_pais: response.data[0][0].pais,
        })
      })
      .catch((error) => console.log(error))
  }


  async mostrarImagen(a_socio) {

    this.setState({ fetchimagen: true })

    const sql = `${URL_DBQUERY}/blobPreg/${a_socio}`
    axios.get(sql)
      .then((response) => {
        this.setState({
          imagen: response.data[0].simg_imagen,
        })
      })
      .catch((error) => console.log('error',error))
      .finally(() => {
        this.setState({ fetchimagen: false })
      })

  }

  async getInicio() {
    try{
      await Promise.all([ this.getNacionalidad(), this.getSexo(), this.getActividades(0), this.getLocalidades(), this.getComportam(),
                          this.getCategorias(), this.getParentesco(), this.getMotivosBaja(), this.getParametros() ])
    } catch(e) {
      console.log(e);
    } finally {
      
    }
  }

  async getSocio(a_socio) {
    try{
      await Promise.all([ this.getSocioDatos(a_socio), this.getActividades(a_socio), this.mostrarImagen(a_socio) ])
    } catch(e) {
      console.log(e);
    } finally {

    }
  }


  componentDidMount = () => {
    
    this.getInicio();
    this.handleAlta();
    
  }

  handleChange = (event) => {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    })
  }


  handleChangeActividad = (selectedOption) => {

    this.setState({ selectedOption })    
  }
 
  handleChangeSugg_soci_codi = (suggestion) => {

    this.setState({
      soci_codi: suggestion.codigo
    },()=>{  this.getSocio(this.state.soci_codi)  });

  };

  handleWebcamCapture = (a_acepto) => {

    this.setState({
      showCamWeb: false
      })
    this.mostrarImagen(this.state.soci_codi);

  };

  handleGetFoto = (a_acepto) => {

    this.setState({
      showGetFoto: false
      })
    this.mostrarImagen(this.state.soci_codi);

  };


  handleAlta = () => {

    this.setState({
      showAltaSociOk:false,
      soci_codi: '',
      soci_ape: '',
      soci_nom: '',
      soci_cate_codi: '',
      soci_domi: '',
      soci_loca_id: this.state.param_loca ||183,
      soci_naci_f: '',
      soci_ingre_f: '',
      soci_sexo: 'O',
      soci_docu: '',
      soci_pais: this.state.param_pais ||'AR',
      soci_celular: '',
      soci_tele: '',
      soci_mail: '',
      soci_responsable: '',
      soci_resp_pare_id: 0,
      soci_resp_celu: '',
      soci_nota: '',
      soci_alta_f: '',
      soci_alta_usua: '',
      soci_baja_f: '',
      soci_baja_usua: '',
      soci_baja_moti: '',

      imagen:'',
      selectedOption: [],
      confirmaBaja: '',
      estado: '',
      estado_color: '',
      ult_cuota_paga: '',
      sofa_grupo_deno: '',
      meses_deu: '',
      cate_color:'',

      autosuggestValue: '',
      rehab_motivo:''
    })

  }
/*==========================================================================
   Actualizacion : Alta / Modificacion
*==========================================================================*/
  handleGrabar = (event) => {
    event.preventDefault();

const sql =  `${URL_DB}AM_SOCIOS(${this.state.login_id},${this.state.soci_codi||0},'${encodeURIComponent(this.state.soci_ape)}',
'${encodeURIComponent(this.state.soci_nom)}','${this.state.soci_cate_codi}','${encodeURIComponent(this.state.soci_domi)}',
${this.state.soci_loca_id},'${this.state.soci_naci_f}','${this.state.soci_sexo}','${this.state.soci_docu}',
'${this.state.soci_pais}','${this.state.soci_celular}','${this.state.soci_tele}',
'${this.state.soci_mail}','${this.state.soci_responsable}','${this.state.soci_resp_pare_id}',
'${this.state.soci_resp_celu}','${encodeURIComponent(this.state.soci_nota)}','${String(JSON.stringify(this.state.selectedOption))}')`;
    axios.get(sql)
    .then((response) => {
          this.setState({
            respuestaSp: response.data[0]
          })
          var obj = this.state.respuestaSp[0];
          this.setState({
            respError : obj.respuesta
          })
          if (this.state.respError==='OK') {
              this.setState({
                  mensajeAlerta : 'Registrado correctamente',
                  mensajeColor  : 'green',
              })
              if(obj.codigo!==0) {
                  // Si todo ok muestro pantalla de nuevo socio y pido foto
                  this.setState({
                    soci_codi : obj.codigo,
                    showAltaSociOk  : true,
                })
              } else {
                this.handleAlta()
              }
          }    
      })
      .catch((error) => {
        alert('ERROR interno API al actualizar BD:'+error)
      })

  }

/*==========================================================================
   Actualizacion : Baja / Rehab
*==========================================================================*/
handleBajaRehab = (a_baja_rehab) => {

  var sigo = true;

  if (a_baja_rehab==='B' && this.state.confirmaBaja==='REHABILITAR') {
    sigo = false;
    swal({ 
              title : `Error en Baja de Socio`,
              text  : `Debe completar con la palabra 'REHABILITAR'`});
  }

  if (a_baja_rehab==='R' && this.state.confirmaBaja==='BAJA') {
    sigo = false;
    swal({ 
      title : `Error en Rehabilitacion de Socio`,
      text  : `Debe completar con la palabra 'REHABILITAR'`});  
  }

  if (sigo) {
    const sql =  `${URL_DB}B_SOCIOS_REHABILITAR(${this.state.login_id},'${a_baja_rehab}',
  ${this.state.soci_codi},'${this.state.soci_baja_moti}','${encodeURIComponent(this.state.rehab_motivo)}')`;
  axios.get(sql)
    .then((response) => {
        this.setState({
          respuestaSp: response.data[0]
        })
        var obj = this.state.respuestaSp[0];
        this.setState({
          respError : obj.respuesta,
        })

        if (this.state.respError==='OK') {
            this.setState({
                mensajeAlerta : 'Registrado correctamente',
                mensajeColor  : 'green',
                showModalRehab:false,
                showModalBorr :false
            })
        }    
    })
    .catch((error) => {
      alert('ERROR interno API al actualizar BD:'+error)
    })

  }

}


/*==========================================================================
   RENDER
*==========================================================================*/

  render() {  

    //const registrosFiltrados = this.filtrarDatos();
    const respError = this.state.respError;
    const mensajeAlerta = this.state.mensajeAlerta;
    const mensajeColor = this.state.mensajeColor;

    return(
      <div>        
        {mensajeAlerta.length >1 ? <Notifications mensaje={mensajeAlerta}
                                                  mensajeColor={mensajeColor}
                                    /> : '' }

        <Container fluid="true">
          <Form>
          <Row>
            <Col md={2} style={{fontSize:"22px"}}>
                <b>{`Socio #${this.state.soci_codi===''?'Nuevo':this.state.soci_codi}`}</b>
            </Col>
            <Col md={3} >
            <Form.Group>
            <AutosuggestsComponent  tabla={'socio'}
                                    placeholder={'Digite Apellido Socio a editar'} 
                                    denoValue={this.state.autosuggestValue}
                                    onSubmitFunction={this.handleChangeSugg_soci_codi}
                                  />
              </Form.Group>  
            </Col>
            <Col md={2} style={{fontWeight: "bold", textAlign: "left", color: this.state.estado_color }}>
                {this.state.estado} 
            </Col>  
            <Col xs={2}>
                <Button variant="secondary" size="sm" 
                        onClick={this.handleAlta} ><FaUserPlus /> Reset
                </Button>
            </Col>
            <Col xs={1}>
  { this.state.soci_codi !=='' && this.state.soci_baja_f ===null && this.state.lee_mod==='M' &&
                    <Button variant="danger" size="sm"
                      onClick={() =>{ this.setState({ showModalBorr : true, soci_baja_moti: '',}) }}>
                      Baja socio</Button>
  }
  { this.state.soci_codi !=='' && this.state.soci_baja_f !==null && this.state.lee_mod==='M' &&
                    <Button variant="primary" size="sm" 
                      onClick={() =>{ this.setState({ showModalRehab : true}) }}>
                      ReHabilitar</Button>
  }
                </Col>
          </Row>
          <Row>
          </Row>
          <Row>
            <Col md={9} sm={12}>
              <Row>

                <Card>
                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control type="text" name="soci_nom" value={this.state.soci_nom}
                                      onChange={this.handleChange} 
                                      style={{backgroundColor:this.state.colorOblig, textTransform: 'capitalize'}} />
                        <Form.Text className="text-muted"></Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Apellido</Form.Label>
                        <Form.Control type="text" name="soci_ape" value={this.state.soci_ape} 
                                      onChange={this.handleChange} 
                                      style={{backgroundColor:this.state.colorOblig, textTransform: 'capitalize'}} />
                        <Form.Text className="text-muted"></Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>Nacionalidad</Form.Label>
                        <select className="form-control" name="soci_pais" value={ this.state.soci_pais }
                                onChange={this.handleChange} style={{backgroundColor:this.state.colorOpc}}>
                        { this.state.nacionalidad.map((pais,i) => { 
                            return (
                                    <option key={i} 
                                            value={pais.pais_id}
                                    > {pais.pais_deno}
                                    </option>
                                    ) 
                          }) }
                        </select>
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>#Documento</Form.Label>
                        <Form.Control type="number" name="soci_docu" value={this.state.soci_docu} 
                                      onChange={this.handleChange} style={{backgroundColor:this.state.colorOblig}}/>
                        <Form.Text className="text-muted"></Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={2}>
                    <Form.Group>
                      <Form.Label>F.Nacimiento</Form.Label>
                        <Form.Control type="date" name="soci_naci_f" value={this.state.soci_naci_f} 
                                      onChange={this.handleChange} style={{backgroundColor:this.state.colorOblig}}/>
                        <Form.Text className="text-muted"></Form.Text>
                      </Form.Group>
                    </Col>  
                    <Col md={1}>
                      <Form.Group>
                        <Form.Label>Sexo</Form.Label>
                        <select className="form-control" name="soci_sexo" value={ this.state.soci_sexo } 
                                onChange={this.handleChange} style={{backgroundColor:this.state.colorOpc}}>
                      { this.state.soci_id===null &&  // Cuando esta vacio ponemos un reg de 'Seleccion' para que haga el change
                                      <option key={'0'} value={'0'} disabled >( Selecc )</option>
                      }
                        { this.state.sexo.map((sex) => { 
                            return (
                                    <option key={sex.sexo} 
                                            value={sex.sexo}
                                    > {sex.sexo_deno}
                                    </option>
                                    ) 
                          }) }
                        </select>
                      </Form.Group>
                    </Col>
                    <Col md={5}>
                      <Form.Group>
                        <Form.Label>Domicilio</Form.Label>
                        <Form.Control type="text" name="soci_domi" value={this.state.soci_domi} 
                                      onChange={this.handleChange} 
                                      style={{backgroundColor:this.state.colorOblig, textTransform: 'capitalize'}}/>
                        <Form.Text className="text-muted"></Form.Text>
                      </Form.Group> 
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                          <Form.Label>Localidad</Form.Label>
                          <select className="form-control" name="soci_loca_id" value={this.state.soci_loca_id }
                                  onChange={this.handleChange} style={{backgroundColor:this.state.colorOblig}}>

                          { this.state.soci_loca_id===null &&  // Cuando esta vacio ponemos un reg de 'Seleccion' para que haga el change
                                          <option key={-1} value={0} disabled >( Selec localidad )</option>
                          }

                          { this.state.localidades.map((loc,i) => { 
                              return (
                                      <option key={i} 
                                              value={loc.loca_id}
                                      > {loc.loca_deno}
                                      </option>
                                      ) 
                            }) }
                          </select>
                        </Form.Group> 
                    </Col>
                  </Row>
                  <Row>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Celular</Form.Label>
                        <Form.Control type="text" name="soci_celular" value={this.state.soci_celular} 
                                      onChange={this.handleChange} style={{backgroundColor:this.state.colorOblig}}/>
                        <Form.Text className="text-muted"></Form.Text>
                      </Form.Group> 
                    </Col>
                    <Col md={5}>
                      <Form.Group>
                        <Form.Label>Mail</Form.Label>
                        <Form.Control type="text" name="soci_mail" value={this.state.soci_mail} 
                                      onChange={this.handleChange} style={{backgroundColor:this.state.colorOpc}}/>
                        <Form.Text className="text-muted"></Form.Text>
                      </Form.Group> 
                    </Col>
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>Telefono</Form.Label>
                        <Form.Control type="text" name="soci_tele" value={this.state.soci_tele} 
                                      onChange={this.handleChange} style={{backgroundColor:this.state.colorOpc}}/>
                        <Form.Text className="text-muted"></Form.Text>
                      </Form.Group> 
                    </Col>
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>Categoría</Form.Label>
                        <select className="form-control" name="soci_cate_codi" value={this.state.soci_cate_codi }
                                onChange={this.handleChange} style={{backgroundColor:this.state.cate_color}}>
                        { this.state.soci_cate_codi==='' &&  // Cuando esta vacio ponemos un reg de 'Seleccion' para que haga el change
                                        <option key={-1} value={0} disabled >( Seleccione )</option>
                        }

                        { this.state.categorias.map((cat,i) => {  
                            return (
                                    <option key={i} 
                                            value={cat.cate_codi}
                                    > {cat.cate_deno}
                                    </option>
                                    ) 
                          }) }
                        </select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                  <Col md={3}>
                      <Form.Group>
                        <Form.Label>Nombre Responsable</Form.Label>
                        <Form.Control type="text" name="soci_responsable" value={this.state.soci_responsable} 
                                      onChange={this.handleChange} 
                                      style={{backgroundColor:this.state.colorOpc, textTransform: 'capitalize'}}/>
                        <Form.Text className="text-muted"></Form.Text>
                      </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Parent Respon</Form.Label>
                      <select className="form-control" name="soci_resp_pare_id" value={this.state.soci_resp_pare_id }
                              onChange={this.handleChange} style={{backgroundColor:this.state.colorOpc}}>

                      { this.state.soci_resp_pare_id==='' &&  // Cuando esta vacio ponemos un reg de 'Seleccion' para que haga el change
                                      <option key={-1} value={0} disabled >( Seleccione )</option>
                      }

                      { this.state.parentesco.map((pare,i) => { 
                          return (
                                  <option key={i} 
                                          value={pare.pare_id}
                                  > {pare.pare_deno}
                                  </option>
                                  ) 
                        }) }
                      </select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                      <Form.Group>
                        <Form.Label>Celular Responsable</Form.Label>
                        <Form.Control type="text" name="soci_resp_celu" value={this.state.soci_resp_celu} 
                                      onChange={this.handleChange} style={{backgroundColor:this.state.colorOpc}}/>
                        <Form.Text className="text-muted"></Form.Text>
                      </Form.Group> 
                  </Col>
                  <Col md={4}>  
                    <Form.Group>
                        <Form.Label>Observaciones</Form.Label>
                        <Form.Control type="text" name="soci_nota" value={this.state.soci_nota} 
                                      onChange={this.handleChange} />
                        <Form.Text className="text-muted"></Form.Text>
                    </Form.Group> 
                  </Col>
                </Row>
                </Card.Body>
              </Card>
    
            </Row>
            <Row>
              <Card>
              <Card.Body>
              <Row>
                <Col xs={4}>
                  <Alert key="1" variant="danger" show={respError.length >3 ? true : false} >
                        {respError}</Alert>
                </Col> 
                <Col xs={4}>
  { this.state.lee_mod==='M' 
            ?     <Button variant="success" size="sm" onClick={this.handleGrabar}>
                      {this.state.soci_codi===''?'Grabar socio nuevo':'Modificar datos'}</Button>
            :     <Button variant="outline-danger" size="sm" disabled>Solo Lectura</Button>
  }              
                </Col>
  { this.state.soci_codi!=='' && this.state.lee_mod==='M' &&
  <>
                <Col xs={2}>
                  <Button variant="success" size="sm" onClick={() => this.setState({ showCamWeb : true})}>
                      Tomar <FaCamera /></Button>
                </Col>
                <Col xs={2}>
                  <Button variant="success" size="sm" onClick={() => this.setState({ showGetFoto : true})}>
                      Subir <FaCamera /></Button>
                </Col>
  </>
  }
              </Row>
              </Card.Body>
            </Card>

            </Row>
  { this.state.soci_codi!=='' &&
              <Row style={{backgroundColor:"#ccffcc"}}> 
                  <Col xs={3}>
                    <p>{`Ingreso : ${this.state.soci_ingre_f}`}</p>
                  </Col>
                  <Col xs={6}>
                    <p>{`Ult cuota paga: ${this.state.ult_cuota_paga} (${this.state.meses_deu} meses)`}</p>
                  </Col>
                  <Col xs={3}>
                    <p>{`Grupo Fam : ${this.state.sofa_grupo_deno}`}</p>
                  </Col>
              </Row>
  }

            </Col>

            <Col md={3} sm={12}>
              <Row>
                <Card>
                <Card.Header>Actividades</Card.Header>
                <Card.Body>
                  <Row>
                    <Col>
                      <Select   name="form-field-name"
                                closeMenuOnSelect={false}
                                isClearable={false}
                                value={this.state.selectedOption}
                                onChange={this.handleChangeActividad}
                                isMulti
                                options={this.state.actividades}
                              />
                    </Col>
                  </Row>
                  </Card.Body>
                </Card>
              </Row>
  { this.state.soci_codi!=='' &&
  <>
              <Row style={{backgroundColor:"#ccffcc"}}> 
                  <Col>
                  {
                    this.state.fetchimagen && 'Cargando...'
                  }
                  <div className="Grilla-header"  >

                  <img style={{ width: '100%' }} src={`data:image/jpg;base64,${this.state.imagen}`} alt={'Foto socio'} />
                  </div>
                  </Col>
              </Row>
</>}
            </Col>
          </Row>
          </Form>
         
        </Container>


        <Modal show={this.state.showModalBorr} onHide={() =>{this.setState({showModalBorr:false})}} dialogClassName="modal-40">
          <Modal.Header closeButton style={{ backgroundColor: "#ff6666" }}>
            <Modal.Title>
              {`Eliminar socio ${this.state.soci_ape} ${this.state.soci_nom} (#${this.state.soci_codi})`}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <Form>
            <Row> 
              <Col>
                <Form.Group>
                  <Form.Label>Seleccione motivo de baja</Form.Label>
                  <select className="form-control" name="soci_baja_moti" value={this.state.soci_baja_moti}
                          onChange={this.handleChange}  >
                  <option key={0} value={''} disabled >(Selecione un motivo)</option>
                  { this.state.motivosBaja.map((mot) => { 
                      return (
                          <option key={mot.baja_moti} 
                                  value={mot.baja_moti}> {mot.baja_deno}</option>
                              ) 
                    }) }
                  </select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>digite la palabra BAJA</Form.Label>
                  <Form.Control type="text" name="confirmaBaja" value={this.state.confirmaBaja}
                                onChange={this.handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <br />
            <Row>
              <Col xs={8} style={{textAlign: "right"}}>
                  <Button variant="danger" size="sm"
                          onClick={() => {this.handleBajaRehab('B')}}>
                    Eliminar socio
                  </Button>
                  <Button variant="secondary" size="sm" 
                          onClick={() => {this.setState({showModalBorr:false})}}>
                    Cancelar
                  </Button>
              </Col>
            </Row>
            <Row>
              <Col>
                  <Alert key="1" variant="danger" show={respError.length >3 ? true : false} >
                        {respError}
                  </Alert>
              </Col>
            </Row>

          </Form>

          </Modal.Body>
        </Modal>


        <Modal show={this.state.showModalRehab} onHide={() =>{this.setState({showModalRehab:false})}} dialogClassName="modal-40">
          <Modal.Header closeButton style={{ backgroundColor: "#3399ff" }}>
            <Modal.Title>
              {`Rehabilitar socio ${this.state.soci_ape} ${this.state.soci_nom} (#${this.state.soci_codi})`}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <Form>
            <Row> 
              <Col>
                <Form.Group>
                  <Form.Label>Escriba el motivo de Rehabilitación</Form.Label>
                  <Form.Control as="textarea" rows={3} name="rehab_motivo" value={this.state.rehab_motivo}
                                onChange={this.handleChange} />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>digite la palabra REHABILITAR</Form.Label>
                  <Form.Control type="text" name="confirmaBaja" value={this.state.confirmaBaja}
                                onChange={this.handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <br />
            <Row>
              <Col xs={8} style={{textAlign: "right"}}>
                  <Button variant="success" size="sm"
                          onClick={() => {this.handleBajaRehab('R')}}>
                    Rehabilitar socio
                  </Button>
                  <Button variant="secondary" size="sm" 
                          onClick={() => {this.setState({showModalRehab:false})}}>
                    Cancelar
                  </Button>
              </Col>
            </Row>
            <Row>
              <Col>
                  <Alert key="1" variant="danger" show={respError.length >3 ? true : false} >
                        {respError}
                  </Alert>
              </Col>
            </Row>
          </Form>

          </Modal.Body>
        </Modal>




        <Modal show={this.state.showCamWeb} onHide={() =>{this.setState({showCamWeb:false})}} dialogClassName="modal-40">
          <Modal.Header closeButton style={{ backgroundColor: "#7bdb95" }}>
            <Modal.Title>
              {`Tomar Foto socio ${this.state.soci_ape} ${this.state.soci_nom} (#${this.state.soci_codi}) por webCam`}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <Form>
            <Row> 
              <Col>
                <WebcamCapture alta_usua={this.state.login_id}
                               soci_codi={this.state.soci_codi}
                               onSubmitFunction={this.handleWebcamCapture}
                               />
              </Col>
            </Row>
            <br />
            <Row>
              <Col xs={8} style={{textAlign: "right"}}>
                  
                  <Button variant="secondary" size="sm" 
                          onClick={() => {this.setState({showCamWeb:false})}}>
                    Cancelar
                  </Button>
              </Col>
            </Row>
            <Row>
              <Col>
                  <Alert key="1" variant="danger" show={respError.length >3 ? true : false} >
                        {respError}
                  </Alert>
              </Col>
            </Row>
          </Form>

          </Modal.Body>
        </Modal>



        <Modal show={this.state.showGetFoto} onHide={() =>{this.setState({showGetFoto:false})}} dialogClassName="modal-40">
          <Modal.Header closeButton style={{ backgroundColor: "#99ccff" }}>
            <Modal.Title>
              {`Cargar Foto socio ${this.state.soci_ape} ${this.state.soci_nom} (#${this.state.soci_codi}) de un archivo`}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <Form>
            <Row> 
              <Col>
              <UploadFileComponent  alta_usua={this.state.login_id}
                                    soci_codi={this.state.soci_codi} 
                                    onSubmitFunction={this.handleGetFoto}
                                    />    
              </Col>
            </Row>
            <br />
            <Row>
              <Col xs={8} style={{textAlign: "right"}}>

                  <Button variant="secondary" size="sm" 
                          onClick={() => {this.setState({showGetFoto:false})}}>
                    Cancelar
                  </Button>
              </Col>
            </Row>
            <Row>
              <Col>
                  <Alert key="1" variant="danger" show={respError.length >3 ? true : false} >
                        {respError}
                  </Alert>
              </Col>
            </Row>
          </Form>

          </Modal.Body>
        </Modal>





        <Modal show={this.state.showAltaSociOk} onHide={() =>{this.handleAlta()}} dialogClassName="modal-40">
          <Modal.Header closeButton style={{ backgroundColor: "#009900" }}>
            <Modal.Title>
              {`Alta socio #${this.state.soci_codi}`}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <Form>
            <Row>
              <Col xs={6} style={{fontSize:"22px"}}>
              {`${this.state.soci_ape} ${this.state.soci_nom}`}
              </Col>
              <Col xs={3}>
                  <Button variant="success" size="sm" onClick={() => this.setState({ showCamWeb : true})}>
                      Tomar <FaCamera /></Button>
                </Col>
                <Col xs={3}>
                  <Button variant="success" size="sm" onClick={() => this.setState({ showGetFoto : true})}>
                      Subir <FaCamera /></Button>
                </Col>  
            </Row>
            <br />
            <Row>
              <Col style={{textAlign: "center"}}>

                  <Button variant="secondary" size="sm" 
                          onClick={this.handleAlta}>
                    Cerrar
                  </Button>
              </Col>
            </Row>
            <Row>
              <Col>
                  <Alert key="1" variant="danger" show={respError.length >3 ? true : false} >
                        {respError}
                  </Alert>
              </Col>
            </Row>
          </Form>

          </Modal.Body>
        </Modal>


      </div>
    );
  }
}

export default SociosDatos;
