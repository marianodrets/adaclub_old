import React  from "react";
import { NOMBRE_SIST, URL_DB, URL_DBQUERY } from './../../constants';     // URL_DBQUERY="http://localhost:3001/";
import axios from 'axios';
import { Redirect } from "react-router-dom";
import { Button, FormGroup, FormControl, Table, Row, Col, Alert, Modal, Form } from "react-bootstrap";
import logo from './../../assets/images/LogoAdaClub.jpg'
import "./Login.css";


export default class Login extends React.Component {

//export default function Login() {
  constructor(props){
    super(props);

    this.state = {
        accesos:[],
        email: '', 
        password : '',
        mensaje : '',
        login: false,
        store: null, 
        mensajeModalPwd: '',
        showModalUserNew: false,
        showModalConfirma: false,
        password_1 : '',
        password_2 : '',
        usua_ape: '',
        usua_nom: '',
        usua_docum: '',
        usua_celular:'',
        disabledEmailPwd: false,
        codigoVerificaDado: '',
        codigoVerificaInput: 0,
        mensajeModalGrabo: '',
        bienvenidoFin: false
    };

  }
  
  componentDidMount() {
      sessionStorage.setItem('USUA_ID',0)
      sessionStorage.setItem('USUA_APENOM','')
      document.title = NOMBRE_SIST;
  }


  /****************************************************************************
  * Logueo al sistema 
  ****************************************************************************/
  login = () => {

    const lenPwd = 5;

   if (this.state.email.length===0) {
      this.setState({ login : false, mensaje : 'Complete Usuario (debe ser un mail))' })
   }
   if (this.state.password.length < lenPwd) {
    this.setState({ login : false, mensaje : 'Complete contraseña, debe tener 5 digitos o más' })
   }

   if (this.state.email.length>0 && this.state.password.length >= lenPwd) {

      const sql =  `${URL_DB}SEL_LOGIN('${this.state.email}','${this.state.password}','L')`   
      axios.get(sql)
      .then((response) => {
          const usu = response.data[0][0].usua_id;
          if (usu===0) {
            this.setState({ login : false, mensaje : 'Credenciales incorrectas' })
            sessionStorage.setItem('USUA_ID',0)
            sessionStorage.setItem('USUA_APENOM','')

          } else {

            this.setState({ login : true, mensaje : '' })
            sessionStorage.setItem('USUA_ID',usu);
            sessionStorage.setItem('USUA_APENOM',response.data[0][0].apenom);
            
          }
      })
      .catch((error) => {
        this.setState({ mensaje : 'ERROR interno API al actualizar BD:'+error });
      })
    }

  };

  /****************************************************************************
  * MODAL 1 : El usuario solicita nuevo usuario o recup clave , y envio de mail
  *****************************************************************************
   1- Genero un codigo de seguridad
   2- envio un mail con ese codigo
   3- El usuario lee ese mail, captura el codigo y lo escribe en el modal
   4- Si esta OK grabamos el nuevo mail, estando seguros que es del usuario y tiene acceso 
*==========================================================================*/
  generaNuevapwd = () => {
    this.setState({ showModalUserNew: true,
                    password_1 : '',
                    password_2 : '',
                    mensajeModalPwd: '', })    
  }



  obtengoCodigoVerificacion = (event) => {
  
  if (this.state.password_1===this.state.password_2) {

    this.setState({ mensajeModalPwd : '' })

    const sql =  `${URL_DB}M_USUARIO_EMAIL_VERIFICA(0,'V','${this.state.email}',${this.state.codigoVerificaInput})`  
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
              this.setState({ mensajeModalPwd : 'Enviando Email...', })
              this.enviarEmail(this.state.codigoVerificaDado) 
              this.setState({ mensajeModalPwd : 'Verifique el correo y capture el codigo',
                              showModalUserNew : false,
                              showModalConfirma : true })     
          } else {
  
              this.setState({ mensajeModalPwd : `Error, reintente ${this.state.respError}`, });
          }
          
      })
      .catch((error) => {
          alert('ERROR interno API al actualizar BD:'+error)
          this.setState({ mensajeModalPwd : 'Error API', })
      })
    } else {
      this.setState({ mensajeModalPwd : 'Las password digitadas deben ser iguales' })
    }


  }

  enviarEmail(a_codigo){
    
    axios.post(`${URL_DBQUERY}sendMail/form`,{
      email  : this.state.email,
      asunto : 'Email enviado por el sistema',
      mensaje: `Debe tomar este codigo que le enviamos, e ingresarlo en el form que te lo está solicitando. 
      Codigo de verif: ${a_codigo}`,
      sistema: NOMBRE_SIST,
      detalle : ''
      });
    console.log(`${URL_DBQUERY}sendMail/form - email : ${this.state.email}`)
  
  }

  /****************************************************************************
  * MODAL 2 : El usuario ingresó el codig oenviado por mail y se crea o modifica usuario
  ****************************************************************************/
  handleGraboUsuario = (event) => {
  //event.preventDefault();

    if (Number(this.state.codigoVerificaDado) !== Number(this.state.codigoVerificaInput)) {

      this.setState({mensajeModalGrabo : 'El Código ingresado no es correcto'});

    } else {

      const sql =  `${URL_DB}M_USUARIO_PWD_NO_LOGUEADO('${this.state.email}','${this.state.password_1}')`  
      axios.get(sql)
      .then((response) => {
            this.setState({
              respuestaSp: response.data[0]
            })
            var obj = this.state.respuestaSp[0];
            this.setState({
              respError : obj.respuesta,
              codigo : obj.codigo,
              apenom : obj.apenom,
            })

            if (this.state.respError==='OK') {  
                this.setState({ mensajeModalGrabo : 'Registrado correctamente',  
                                showModalConfirma : false,
                                bienvenidoFin : true });

                sessionStorage.setItem('USUA_ID',obj.codigo);
                sessionStorage.setItem('USUA_APENOM',obj.apenom);

            } else {
                this.setState({ mensajeModalGrabo : this.state.respError, });
            } 
            
        })
        .catch((error) => {
            alert('ERROR interno API al actualizar BD:'+error)
            this.setState({ mensajeModalGrabo : 'Error API', })
        })

    }

  }

  finBienvenida = (event) => {
    this.setState({ bienvenidoFin : false }) 
    window.location = '/';

  }
  
  /****************************************************************************
  * RENDER
  ****************************************************************************/

  render(){

    if (this.state.login) {
      return <Redirect to={'/'} />      //window.location = '/'
    }

    return (
      <div className="Login">
        
          <form>
          <Table>
            <Row>
              <Col xs={4}>
                <div style={{ textAlign: "right"}}>
                  <img  src={logo} alt={'Logo img'} style={{ width: '100%' }}/>
                </div>
              </Col>
              <Col xs={6}>
                <h3>{`Login a ${NOMBRE_SIST}`}</h3>
                <FormGroup controlId="email" >
                  Email
                  <FormControl  autoFocus type="email" value={this.state.email}
                                onChange={e => this.setState({  email: e.target.value,
                                                                mensaje: ''})}
                  />
                </FormGroup>
                <FormGroup controlId="password" >
                  Password
                  <FormControl  type="password" value={this.state.password}
                                onChange={e => this.setState({  password : e.target.value,
                                                                mensaje : '' })}
                  />
                </FormGroup>
                </Col> 
            </Row>
            <Row>
              <Col xs={4}>
              </Col> 
              <Col xs={6}>
                <div className="d-grid gap-2">
                <Button  size="sm" onClick={this.login}>
                  Login
                </Button>
                </div>
                <b style={{ color:'#ff0000' }}>{this.state.mensaje}</b>
              </Col> 
            </Row>
            AdaClub
            <Row>

            </Row>
            <Alert key={1} variant={'light'}>
                    Si es nuevo o se olvidó su password {' '}
                      <Alert.Link href="#" onClick={() => { this.generaNuevapwd() }}>haga click aqui</Alert.Link>. Lo guiaremos para obtener un acceso válido
                  </Alert>
          </Table>   
          </form>
    


  {/* ################### Para recuperar o crear usuario, tomamos datos y enviamos mail  ###################  */}
          <Modal show={this.state.showModalUserNew}  onHide={()=>{ this.setState({showModalUserNew : false}) } } >
          <Modal.Header closeButton>
            <Modal.Title>
                  {`Crear o restaurar acceso a ${NOMBRE_SIST}`}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <FormGroup controlId="email" >
                  Email
                  <FormControl autoFocus type="email" name="email" value={this.state.email}
                                onChange={e => this.setState({ email : (e.target.value)})}
                                required />
                </FormGroup>
                <FormGroup>
                  Password Nueva
                  <FormControl  type="password" name="password_1"  
                                onChange={e => this.setState({ password_1 : (e.target.value)})}
                                required />
                </FormGroup>
                <FormGroup>
                  Reescriba Pwd Nueva
                  <FormControl  type="password" name="password_2" 
                                onChange={e => this.setState({ password_2 : (e.target.value)})}
                                required />
                </FormGroup>
       
                <p>{' '}</p>
                <b style={{ color:'#ff0000' }}>{this.state.mensajeModalPwd}</b>
                <Button block onClick={this.obtengoCodigoVerificacion}>
                    Confirmar estos datos
                </Button>
          </Modal.Body>
        </Modal>



  {/* ################### El usuario Recupera CodigoVerificacion y grabamos aca ###################  */}
        < Modal show={this.state.showModalConfirma} onHide={() => { this.setState({ showModalConfirma : false}) } } >
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
                <b>* Revise también en 'Correo no deseado'</b>
                <br />
                <Row>
                  <Col>
                    <Button variant="success" size="sm" onClick={this.handleGraboUsuario}>
                    Grabar
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => { this.setState({ showModalConfirma : false}) } }>
                    Cancelar
                    </Button>
                    <Alert key="1" variant="danger" show={this.state.mensajeModalGrabo.length >3 ? true : false} >
                        {this.state.mensajeModalGrabo}
                    </Alert>
                  </Col>
                </Row>
            </Form>
          </Modal.Body>
        </Modal>




 {/* ################### Mensaje de bienvenida y cierre alta de usuario ###################  */}
        < Modal show={this.state.bienvenidoFin} onHide={this.finBienvenida} >
          <Modal.Header closeButton>
            <Modal.Title>
              {`Bienvenido a ${NOMBRE_SIST}`}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>

                <img  src={logo} alt={'Profeapp img'} style={{ width: '30%' }}/>

                <Button block variant="success" size="sm" onClick={this.finBienvenida}>
                  {`Iniciar sesion con ${this.state.email} `}
                </Button>
         
            </Form>
          </Modal.Body>
        </Modal>

      </div>
    );
  }
}
