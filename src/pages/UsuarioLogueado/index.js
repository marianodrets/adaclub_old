import React  from "react";
import { NOMBRE_SIST, URL_DB, URL_DBQUERY } from './../../constants';     // URL_DBQUERY="http://localhost:3001/";
import axios from 'axios';
import { Button, FormGroup, FormControl, Card, Row, Col, Modal, Alert, Form } from "react-bootstrap";
import "./DatosUsuario.css";
import swal from 'sweetalert';
// import emailjs from 'emailjs-com';

export default class DatosUsuario extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      fetchingregistros: true, 
      login_usua_id: sessionStorage.getItem('USUA_ID'),
      usua_usuario: '',
      usua_nombre:  '',
      usua_apellido: '',
      usua_docum:  '',
      usua_celular: '',
      usua_nivel :  '',
      password_ant : '',
      password_1 : '',
      password_2 : '',
      password_3 : '',
      codigoVerificaDado : 0,
      codigoVerificaInput : 0,
      mensajeDatos : '',
      mensajePwd : '',
      mensajeEmail : '',
      mensajeModal : '',
      respError: '',
      mensajeAlerta: '',
      email: '',
      asunto: '',
      mensaje: '',
    };

  }
  
  async getUsuarioDatos() {
    const sql = `${URL_DB}SEL_USUARIOS(${this.state.login_usua_id})`
    console.log(sql)
    const response = await axios.get(sql)
    try {
      this.setState({ usua_usuario: response.data[0][0].usua_usuario,
                      usua_nombre: response.data[0][0].usua_nombre,
                      usua_apellido:response.data[0][0].usua_apellido,
                      usua_docum: response.data[0][0].usua_docum,
                      usua_celular: response.data[0][0].usua_celular,
       });

    } catch(error) {
      console.log(error)
    } 
  } 

  async getInicio() {
    try{
      await Promise.all([this.getUsuarioDatos()])
    } catch(e) {
      console.log(e);
    }
  }

  componentDidMount() {

    this.getInicio()
    .then(()=>{
      this.setState({ fetchingregistros: false })
    })

  }

  validateFormPwd = () => {
    return this.state.password_ant.length > 0 && this.state.password_1.length > 0 && this.state.password_2.length > 0;
  }


  /*==========================================================================
   Actualizacion : Modificacion datos
  *==========================================================================*/
  handleDatos = (event) => {
  //event.preventDefault();

  const sql =  `${URL_DB}M_USUARIO_DATOS(${this.state.login_usua_id},
  '${this.state.usua_nombre}','${this.state.usua_apellido}','${this.state.usua_docum}','${this.state.usua_celular}')`  
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
            this.setState({ mensajeDatos : 'Registrado correctamente', })     
        } else {
            this.setState({ mensajeDatos : this.state.respError, });
        } 
    })
    .catch((error) => {
        alert('ERROR interno API al actualizar BD:'+error)
        this.setState({ mensajeDatos : 'Error API'+error, })
    })
}

/*==========================================================================
   Actualizacion : Modificacion password
*==========================================================================*/
handlePwd = (event) => {

  const sql =  `${URL_DB}M_USUARIO_PWD_LOGUEADO(${this.state.login_usua_id},
  '${this.state.password_ant}','${this.state.password_1}','${this.state.password_2}')`  
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
          this.setState({ mensajePwd : 'Registrado correctamente', })     
        } else {
          this.setState({ mensajePwd : this.state.respError, });
        } 
  })
  .catch((error) => {
      alert('ERROR interno API al actualizar BD:'+error)
      this.setState({ mensajePwd : 'Error API', })
  })

  }
 
  /*==========================================================================
   Actualizacion : Modiica del Usuario.Email
  *==========================================================================*/
  handleEMailUsuario = (event) => {
 
    if (this.state.email.length===0) {
        this.setState({ mensajeEmail : 'Complete mail nuevo' })
        return
    }
    if (this.state.usua_usuario===this.state.email) {
      this.setState({ mensajeEmail : 'El mail nuevo no puede ser el actual...' })
      return
    }
    if (this.state.password_3.length===0) {
        this.setState({ mensajeEmail : 'Complete su password actual' })
        return
    }

    const sql =  `${URL_DB}SEL_LOGIN('${this.state.usua_usuario}','${this.state.password_3}','U')`   
      axios.get(sql)
      .then((response) => {
        console.log(sql)
        console.log(response)
          if (response.data[0][0].usuario===0) {

                this.setState({ mensajeEmail : 'Password incorrecta' })

          } else {
            
                swal({ 
                  title : `Cambiar usuario-mail`,
                  text  : `Esta seguro de no utilizar mas el usuario ${this.state.usua_usuario} y utilizar ${this.state.email} para loggearse esta app, con el nuevo E-Mail, Confirma?`,
                  icon : "warning",  
                  buttons : ['No','Si'], 
                  }).then( respuesta => {
                    if ( respuesta===true ) {
                        this.handleEmailVeriCodigo()
                    }
                  });

          }
      })
      .catch((error) => {
        this.setState({ mensaje : 'ERROR interno API al actualizar BD:'+error });
      })
  }

/*==========================================================================
   Atualizacion de Email: 
   1- grabo y genero un codigo de seguridad
   2- envio un mail con ese codigo
   3- El usuario lee ese mail, captura el codigo y lo escribe en el modal
   4- Si esta OK grabamos el nuevo mail, estando seguros que es del usuario y tiene acceso 
*==========================================================================*/
handleEmailVeriCodigo = () => {
  //event.preventDefault();

  //const sql =  `${URL_DB}M_USUARIO_EMAIL_VERIFICA(${this.state.login_usua_id},'V','${this.state.email}',0)`  
  const sql =  `${URL_DB}M_USUARIO_EMAIL_VERIFICA(${this.state.login_usua_id},'V','${this.state.email}',0)`  
  axios.get(sql)
  .then((response) => {
        this.setState({
          respuestaSp: response.data[0]
        })
        var obj = this.state.respuestaSp[0];
        this.setState({
          respError          : obj.respuesta,
          codigoVerificaDado : Number(obj.codigo)
        })

        if (this.state.codigoVerificaDado > 10000 ) {
            this.setState({ mensajeEmail : 'Enviando Email...', })
            this.enviarEmail(this.state.codigoVerificaDado) 
            this.setState({ mensajeEmail : 'Verifique el correo y capture el codigo',
                            showModalConfirma : true })     
        } else {

            this.setState({ mensajeEmail : `Error, reintente ${this.state.respError}`, });
        } 
    })
    .catch((error) => {
        alert('ERROR interno API al actualizar BD:'+error)
        this.setState({ mensajePwd : 'Error API', })
    })

  }
 
  handleModalConfirmaExit = () => {
    this.setState({ showModalConfirma: false,
                    mensajeEmail : 'No se aplico cambio', })
    
  }

  /*==========================================================================
   Envio el mail de verificacion 
  *==========================================================================*/
   enviarEmail(a_codigo){
    
    axios.post(`${URL_DBQUERY}/sendMail/form`,{
      email  : this.state.email,
      asunto : 'Email enviado por el sistema',
      mensaje: `Debe tomar este codigo que le enviamos, e ingresarlo en el form que te lo está solicitando. 
      Codigo de verif: ${a_codigo}`,
      sistema: NOMBRE_SIST
      });
    console.log(`${URL_DBQUERY}/sendMail/form - email : ${this.state.email}`)
  
  }


  handleEmailGrabo = (event) => {
    //event.preventDefault();
  
    const sql =  `${URL_DB}M_USUARIO_EMAIL_VERIFICA(${this.state.login_usua_id},'G','${this.state.email}',${this.state.codigoVerificaInput})`  
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
            this.setState({ mensajeEmail : 'Registrado correctamente',  
                            showModalConfirma : false,
                            email : '' })   
          } else {
            this.setState({ mensajeModal : this.state.respError, });
          } 
          
      })
      .catch((error) => {
          alert('ERROR interno API al actualizar BD:'+error)
          this.setState({ mensajeEmail : 'Error API', })
      })
  
    }
  
  render(){

    /*const respError = this.state.respError;
    const mensajeAlerta = this.state.mensajeAlerta;
    const mensajeColor = this.state.mensajeColor; */

    return (
      
      <div className="DatosUsuario">

          <form>
              <h3>{`Datos del usuario registrados en ${NOMBRE_SIST}`}</h3>
              <Row>
                <Col xs={4}>
                    <Card style={{ width: '18rem' }}>
                    <Card.Body>
                      <Card.Title><b>Datos personales</b></Card.Title>
                          <FormGroup controlId="nombre" >
                            Nombre
                            <FormControl  type="text" value={this.state.usua_nombre}
                              onChange={e => this.setState({ usua_nombre : (e.target.value)})}
                            />
                          </FormGroup>
                          <FormGroup controlId="apellido" >
                            Apellido
                            <FormControl  type="text" value={this.state.usua_apellido}
                              onChange={e => this.setState({ usua_apellido : (e.target.value)})}
                            />
                          </FormGroup>
                          <FormGroup controlId="usua_docum" >
                            Nro docum
                            <FormControl  type="text" value={this.state.usua_docum}
                              onChange={e => this.setState({ usua_docum : (e.target.value)})}
                            />
                          </FormGroup>
                          <FormGroup controlId="usua_celular" >
                            Celular
                            <FormControl  type="text" value={this.state.usua_celular}
                              onChange={e => this.setState({ usua_celular : (e.target.value)})}
                            />
                          </FormGroup>
                          <br />
                          <Button onClick={this.handleDatos}>
                          Actualizar datos
                          </Button>
                    </Card.Body>
                    </Card>
                    <b style={{ color:'#ff0000' }}>{this.state.mensajeDatos}</b>
                </Col>
                <Col xs={4}>
                    <Card style={{ width: '18rem' }}>
                    <Card.Body>
                      <Card.Title><b>Contraseña</b></Card.Title>
                          <FormGroup controlId="password_ant" >
                            Password Actual
                            <FormControl  type="password" value={this.state.password_ant}
                              onChange={e => this.setState({ password_ant : (e.target.value)})}
                            />
                          </FormGroup>
                          <FormGroup controlId="password_1" >
                            Password Nueva
                            <FormControl  type="password" value={this.state.password_1}
                              onChange={e => this.setState({ password_1 : (e.target.value)})}
                            />
                          </FormGroup>
                          <FormGroup controlId="password_2" >
                            Reescriba Pwd Nueva
                            <FormControl  type="password" value={this.state.password_2}
                              onChange={e => this.setState({ password_2 : (e.target.value)})}
                            />
                          </FormGroup>
                          <br />
                          <Button  disabled={!this.validateFormPwd()} onClick={() => {this.handlePwd()}}>
                          Cambiar Contraseña
                          </Button>
                    </Card.Body>
                    </Card>
                    <b style={{ color:'#ff0000' }}>{this.state.mensajePwd}</b>
                </Col>
                <Col xs={4}>
                    <Card style={{ width: '25rem' }}>
                    <Card.Body>
                      <Card.Title><b>Cambiar Mail (Usuario)</b></Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">
                        <p>Si cambia el mail, dado que es la entrada a esta app, verificaremos que sea suyo.</p>
                        <p>Se enviará un codigo al mail nuevo, el cual debe reingresar aqui para confirmar.</p>
                        <p>Se conservará la misma password para loguearse a esta app.</p>
                        </Card.Subtitle>
                          <FormGroup controlId="email" >
                          Email Nuevo
                          <FormControl  
                                    onChange={e => this.setState({ email: e.target.value})}
                          />
                          </FormGroup>
                          <FormGroup controlId="password_3" >
                          Escriba su Pwd actual para saber que Ud
                          <FormControl  type="password" value={this.state.password_3}
                                    onChange={e => this.setState({ password_3 : (e.target.value)})}
                            />
                          </FormGroup>
                          <br />
                          <Button block  onClick={this.handleEMailUsuario}>
                          Cambiar Mail Usuario
                          </Button>
                      </Card.Body>
                      </Card>
                      <b style={{ color:'#ff0000' }}>{this.state.mensajeEmail}</b>
                </Col>
              </Row>
              <br />
              <Row>
                  <Col xs={3}>
                  </Col> 
                  <Col xs={6}>
                    <div className="d-grid gap-2">
                      <Button variant="secondary" size="sm" onClick={() => { window.location = '/'; }} >
                          Salir de Datos de Usuarios
                      </Button>
                    </div>
                  </Col> 
              </Row>
          </form>
    

          <Modal show={this.state.showModalConfirma} onHide={this.handleModalConfirmaExit}>
          <Modal.Header closeButton>
            <Modal.Title>
               Revisa en {this.state.email} el mail que te enviamos
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <Form>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Ingresa el codigo que te mandamos</Form.Label>
                  <Form.Control type="number" name="codigoVerificaInput" 
                                onChange= {e => this.setState({ codigoVerificaInput : (e.target.value)})} />
                </Form.Group>
              </Col>
            </Row>
            <br />
            <Row>
              <Col>
                <Button variant="success" size="sm" onClick={this.handleEmailGrabo}>
                  Grabar
                </Button>
                <Button variant="secondary" size="sm" onClick={this.handleModalConfirmaExit}>
                  Cancelar
                </Button>
                <Alert key="1" variant="danger" show={this.state.mensajeModal.length >3 ? true : false} >
                      {this.state.mensajeModal}
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

