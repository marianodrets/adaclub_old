import React  from 'react';
import { URL_DB } from './../../constants';
import axios from 'axios';
//import ReactPlayer from 'react-player';
import { Table, Row, Col, Container, Button, Modal, Form, FormGroup, FormControl, Card, Alert } from 'react-bootstrap';
//import ExpGrillaExcelPDF from '../../components/ExpGrillaExcelPDF';
//import AyudaAdmi from '../../components/Ayuda-admi';
import Notifications from '../../components/Notifications';
import ordenarGrilla from './../../utils/functions/ordenar-grilla'
import '../../pages/stylePages.css';
import { FaUserPlus, FaUserEdit, FaTrashAlt, FaGlasses } from "react-icons/fa";
import swal from 'sweetalert';
import ShowAccesoMenues from '../ShowAccesoMenues';

// FaPlus
class Usuarios extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lee_mod : props.lee_mod,
      registros : [],

      buscarGrillaValue: '',
      showModalEdit: false,
      showHelpMenues: false,
      login_user_id: sessionStorage.getItem('USUA_ID'),
      usua_id : '',
      usua_usuario : '',
      usua_nombre : '',
      usua_apellido : '',
      usua_celular : '',
      usua_alta_f : '',
      usua_bloqueo_fe : '',
      usua_baja_f : '',
      rolesLista : [],

      help_usua_id: 0,
      help_rol: '',
      showhelp : false,
      filterGrilla: '',
      fetchingregistros: false,
      fetchRolesLista: false,
      respuestaSp: [],
      respError: '',
      mensajeAlerta: '',
    };

    this.ordenarGrilla   = this.ordenarGrilla.bind(this);
  
  }

  async getUsuarios() {
    const sql =  `${URL_DB}SEL_USUARIOS(null)`
    const response = await axios.get(sql)
    try {
      this.setState({ registros: response.data[0] })
    } catch(error) {
      console.log(error)
    }
  }
 
  async getInicio() {
    try{
      await Promise.all([this.getUsuarios() ])
    } catch(e) {
      console.log(e);
    }
  }

  getRolesLista = (p_usua_id) => {
    const sql =  `${URL_DB}SEL_USU_ROLES_ABM(${p_usua_id})`
    axios.get(sql)
      .then((response) => {
          this.setState({
          rolesLista: response.data[0],
          })
      })  
      .catch((error) => console.log(error))
      .finally(() => {
          this.setState({ fetchRolesLista: false })
      })
  }

  componentDidMount() {
    this.getInicio()
  }

  
  /*==========================================================================
   Utilidades de filtros y sort para la grilla ppal 
  *==========================================================================*/
  filtrarDatos() {
    const escapedValue = this.state.filterGrilla.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedValue, 'i');
    return this.state.registros.filter(filtro => 
      regex.test(filtro.usua_usuario) || 
      regex.test(filtro.usua_nombre) || 
      regex.test(filtro.usua_apellido) ||
      regex.test(filtro.usua_celular) || 
      regex.test(filtro.usua_nota) || 
      regex.test(filtro.roles) )
  }
      
  ordenarGrilla = (key) => {
    const registros = ordenarGrilla(key, this.state.registros);

    this.setState({ registros });
  }

  /*==========================================================================
   Abro modal para modificar : Cargo valores y combos
  *==========================================================================*/

  handleModalEdit(regis) {

    this.setState({
      showModalEdit: true,
      usua_id       : regis.usua_id,
      usua_usuario  : regis.usua_usuario,
      usua_nombre   : regis.usua_nombre,
      usua_apellido : regis.usua_apellido,
      usua_celular  : regis.usua_celular,
      usua_alta_f   : regis.usua_alta_f,
      usua_bloqueo_fe: regis.usua_bloqueo_fe,
  
      usua_baja_f   : regis.usua_baja_f,

      respError: '',
      mensajeAlerta: '',
      mensajeColor: 'N' 
    });
    this.getRolesLista(regis.usua_id);
  }

  handleModalAlta = () => {

    this.setState({
      showModalEdit: true,
      usua_id     : 0,
      usua_usuario  : '',
      usua_nombre   : '',
      usua_apellido : '',
      usua_celular  : '',
      usua_alta_f   : '',
      usua_bloqueo_fe: '',
      usua_baja_f   : '',

      respError: '',
      mensajeAlerta: '',
      mensajeColor: 'N' 
    });

    this.getRolesLista(0);
  }


 handleChangeRol = (event,ind) => {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
    
    var rolesLista = this.state.rolesLista
    rolesLista[ind].lee_mod_no = value;
    this.setState({ rolesLista });
  };

  handleChange = (event) => {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  };
  
  handleModalExit = () => {
   
    this.setState({ showModalEdit: false })
    this.setState({
      mensajeAlerta : 'No se aplicaron cambios',
      mensajeColor  : 'red',
    })
  }

  showHelpMenues = (p_usua_id, p_rol) => {
    this.setState({ showHelpMenues : true,
                    help_usua_id: p_usua_id,
                    help_rol: p_rol,
                  })
  }

  /*==========================================================================
   Actualizacion : Modificacion usuario y sus accesos
  *==========================================================================*/

  handleGrabarUsuario = (event) => {

   // '[ { "usro_rol" :"CAJA" },{ "usro_rol" :"ADMIN" }]')
  var rol_json = this.state.rolesLista.filter(function(item){
                return item.lee_mod_no !== 'N';
                }).map((item) => { 
                  var obj = {}
                  obj.usro_rol = item.usro_rol
                  obj.lee_mod  = item.lee_mod_no
                  return ( obj )
                })  

    const sql =  `${URL_DB}AM_USUARIO(${this.state.login_user_id},${this.state.usua_id},'${this.state.usua_usuario}',
'${encodeURIComponent(this.state.usua_apellido)}','${encodeURIComponent(this.state.usua_nombre)}','${this.state.usua_celular}',
'${this.state.usua_docum}','${encodeURIComponent(this.state.usua_nota)}','${this.state.usua_bloqueo_fe}',
'ADMINCLUB','${String(JSON.stringify(rol_json))}')`  
console.log(sql);
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
                  showModalEdit : false
              })
              this.getUsuarios()
          }    
      })
      .catch((error) => {
        alert('ERROR interno API al actualizar BD:'+error)
      })
  
  }


  handleModalBaja = (reg) => {
 
    swal({ 
        title : `Eliminar Usuario ${reg.usua_nombre} ${reg.usua_apellido}    (#ID ${reg.usua_id})`,
        text  : 'Al grabar se elimina definitivamente, confirma ?',
        icon : "warning",  
        buttons : ['No','Si'], 
        }).then( respuesta => {
          if ( respuesta===true ) {
            this.BorrarUsuario(reg)
          }
        });
  }

  BorrarUsuario = (reg) => {
    const sql =  `${URL_DB}B_USUARIO(${this.state.login_user_id},${reg.usua_id})` 
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
                  showModalEdit: false
              })
              this.getUsuarios();
          }    
      })
      .catch((error) => {
        alert('ERROR interno API al actualizar BD:'+error+' SQL:'+sql)
      })

  }

  /*==========================================================================
   RENDER
  *==========================================================================*/
  render() {  

    const respError = this.state.respError;
    const mensajeAlerta = this.state.mensajeAlerta;
    const mensajeColor = this.state.mensajeColor;
    const registrosFiltrados = this.filtrarDatos();

    return(
      <div>        
        {mensajeAlerta.length >1 ? <Notifications mensaje={mensajeAlerta}
                                                  mensajeColor={mensajeColor}
                                    /> : '' }

        <Container  fluid="true">
          <Row>
            <Col xs={4} style={{fontSize:"22px"}}>
                <b>Usuarios y Accesos</b>
            </Col>
            <Col xs={4}>
            <Form.Group>
                <FormControl type="text" name="buscar" placeholder="Texto a filtrar" className="mr-sm-2" 
                        onChange={(e) => { this.setState({ filterGrilla: e.target.value })} } /> 
              </Form.Group>
            </Col>
            <Col xs={2}>
      { this.state.lee_mod==='M' 
          ?    <Button variant="primary" size="sm" type="submit" onClick={this.handleModalAlta} >
                  <FaUserPlus /> Usuario
               </Button>
          :    <Button variant="outline-danger" size="sm" disabled>Solo Lectura</Button>
      }  
            </Col>
            <Col xs={2}>
            <Button  variant='outline-warning' size='sm' onClick={() => {this.setState({ showhelp : true}) } } > 
             Ayuda
            </Button>
           </Col>
          </Row>

          <Row>
            <Col>
              <Table striped bordered hover size="sm" id="data_table">
                <thead className="Grilla-header">
                <tr>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('usua_id')}>
                      #ID</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('usua_usuario')}>
                      Usuario</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('usua_apellido')}>
                      Apellido</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('usua_nombre')}>
                      Nombre</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('usua_celular')}>
                      Celular</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('roles')}>
                      Roles asignados</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('usua_alta_f')}>
                      Alta</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('usua_bloqueo_f')}>
                      Bloqueo</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('usua_baja_f')}>
                      Baja</Button>
                  </th>
                  <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {
                  this.state.fetchingregistros && 'Cargando...'
                }
                {
                  registrosFiltrados.map((regis) => {
                    return (
                      <tr key={regis.usua_id}>
                        <td style={{textAlign: "center"}}>{regis.usua_id}</td>
                        <td style={{textAlign: "left"}}>{regis.usua_usuario}</td>
                        <td style={{textAlign: "left"}}>{regis.usua_apellido}</td>
                        <td style={{textAlign: "left"}}>{regis.usua_nombre}</td>
                        <td style={{textAlign: "left"}}>{regis.usua_celular}</td>
                        <td style={{textAlign: "left"}}>{regis.roles}</td>
                        <td style={{textAlign: "center"}}>{regis.usua_alta_f}</td>
                        <td style={{textAlign: "center", backgroundColor: regis.usua_bloqueo_color}}>{regis.usua_bloqueo_f}</td>
                        <td style={{textAlign: "center"}}>{regis.usua_baja_f}</td>
                        <td>
       { this.state.lee_mod==='M' &&
       <>
                          <Button variant="primary" size="sm" 
                              onClick={() => this.handleModalEdit(regis)}>
                                <FaUserEdit /> Edit</Button>
                          <Button variant="danger" size="sm" 
                              onClick={() => this.handleModalBaja(regis)}>
                                <FaTrashAlt /></Button>
        </>}
                          <Button variant="secondary" size="sm" 
                              onClick={() => this.showHelpMenues(regis.usua_id,'')}>
                                <FaGlasses /></Button>
                        </td>
                      </tr>  
                    ) 
                  }) 
                }
                </tbody>
              </Table>
            </Col>
          </Row>
        </Container>



        <Modal show={this.state.showModalEdit} onHide={this.handleModalExit} dialogClassName="modal-90" >
          <Modal.Header closeButton>
            <Modal.Title>
            {this.state.usua_id ===0 ? 'Crear un Usuario ' : `Editar Usuario ID# ${this.state.usua_id}` }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                {/* =======panel izquierda (datos personales)======= */}
                <Col xs={4}>
                    <Card>
                    <Card.Body>
                      <Card.Title><b>Datos personales</b></Card.Title>
                          <FormGroup controlId="nombre" >
                            Usuario (mail activo)
                            <FormControl  type="text" value={this.state.usua_usuario}
                              onChange={e => this.setState({ usua_usuario : (e.target.value)})}
                            />
                          </FormGroup>
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
                    </Card.Body>
                    </Card>
                </Col>
                {/* =======panel derecha (roles y botones)======= */}
                <Col xs={8}>
                  <Row>
                    <Table striped bordered hover size="sm" id="data_table">
                      <thead>
                        <tr>
                        <th>#ID Rol</th>
                        <th>Descripción</th>
                        <th>Incl Rol</th>
                        <th>Menúes</th>
                        </tr>
                      </thead>
                      <tbody>
                      {
                        this.state.fetchRolesLista && 'Cargando...'
                      }
                      {
                        this.state.rolesLista.map((rol,i) => {
                          return (
                            <tr key={i}>
                              <td style={{textAlign: "left"}}>{rol.usro_rol}</td>
                              <td style={{textAlign: "left"}}>{rol.usro_obser}</td>
                              <td style={{textAlign: "center"}}>
                              <select className="form-control" 
                                      name="lee_mod_no" 
                                      value={rol.lee_mod_no}
                                      style={{fontWeight: "bold", backgroundColor: rol.lee_mod_no==='M'?"#66ff66":rol.lee_mod_no==='L'?"#ffff99":"#ff6666"}}
                                      onChange={(e) => {this.handleChangeRol(e,i)}} >
                                      <option key={1} value={'L'} style={{ backgroundColor: "#ffffff"}}   
                                      >Solo lectura</option>
                                      <option key={2} value={'M'} style={{ backgroundColor: "#ffffff"}}   
                                      >Perm modificar</option>
                                      <option key={3} value={'N'} style={{ backgroundColor: "#ffffff"}}
                                      >Sin acceso</option>
                              </select>
                              </td>
                              <td>
                                <Button variant="secondary" size="sm" 
                                    onClick={() => this.showHelpMenues('',rol.usro_rol)}>
                                <FaGlasses /></Button>
                              </td>

                            </tr>  
                          ) 
                        }) 
                      }
                      </tbody>
                    </Table>
                  </Row>
                  <Row>
                    <Col xs={5} style={{textAlign: "right"}}>
                      Para bloquear el acceso colocar fecha: 
                    </Col>
                    <Col xs={3}>
          { this.state.usua_id!==0 &&  
                    <Form.Group>
                      <Form.Control type="date" name="usua_bloqueo_fe" 
                                    value={this.state.usua_bloqueo_fe} 
                                    onChange={this.handleChange} />
    
                      </Form.Group>
          }
                    </Col>
                    <Col xs={2}>
          { this.state.usua_id!==0 && this.state.usua_bloqueo_fe!=='' &&
                      <Button variant="warning" size="sm"  
                              onClick={() => this.setState({usua_bloqueo_fe:''})}>
                          DesBloquear
                      </Button>
          }
                    </Col>
                    <Col xs={2}>
          { this.state.usua_id!==0 &&
                      <Button variant="secondary" size="sm" 
                              onClick={() => this.showHelpMenues(this.state.usua_id,'')}>
                          <FaGlasses /> Menúes</Button>
          }
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={4}>
                      <Button variant="success" size="sm" onClick={this.handleGrabarUsuario}>
                          Grabar
                      </Button>
                      <Button variant="secondary" size="sm" onClick={this.handleModalExit}>
                          Cancelar
                      </Button>
                      </Col>
                      <Col xs={6}>
                      <Alert key="1" variant="danger" show={respError.length >3 ? true : false} >
                        {respError}
                      </Alert>
                    </Col>
                  </Row>


                </Col>                
              </Row>
            </Form>
          </Modal.Body>
        </Modal>

        < Modal show={this.state.showHelpMenues} 
                onHide={() => { this.setState({ showHelpMenues : false}) } } 
                dialogClassName="modal-40">
            <Modal.Header closeButton >
              <strong >{this.state.help_usua_id===''
                          ? `Accesos de Rol ${this.state.help_rol}` 
                          : `Accesos de Usuario #ID ${this.state.help_usua_id}`}
              </strong>
            </Modal.Header>
            <ShowAccesoMenues help_usua_id={this.state.help_usua_id} 
                              help_apli={'ADMINCLUB'}
                              help_rol={this.state.help_rol} />
        </Modal>

      </div>
    );
  }
}

export default Usuarios;
