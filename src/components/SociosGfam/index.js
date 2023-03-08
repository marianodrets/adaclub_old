import React  from 'react';
import { URL_DB } from '../../constants';
import axios from 'axios';
import { Row, Col, Container, Button, Form, Alert, Table, Modal, FormControl } from 'react-bootstrap';
//import Select from 'react-select';
import Notifications from '../Notifications';
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import ordenarGrilla from './../../utils/functions/ordenar-grilla'
//import swal from 'sweetalert';
import AutosuggestsComponent from '../Autosuggest/index.js';
import '../Autosuggest/autosuggest.css';
import '../../pages/stylePages.css';
import { FaUserPlus, } from "react-icons/fa";

class SociosGfam extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lee_mod : props.lee_mod,
      registros: [],
      filterGrilla:'',
      grupoFam:[],
      login_id: sessionStorage.getItem('USUA_ID'),

      sofa_grupo:0,
   
      autosuggestValue: '',
      soci_codi_ret : '',
      soci_razon_ret: '',

      fetchRegistros: false,
      showModalEdit: false,
      selectedOption: [],

      respuestaSp: [],
      respError: '',
      mensajeAlerta: '',
    };
    
  }
 
  componentDidMount = () => {
    
    this.poblarGrilla();
    
  }

  poblarGrilla = () => {
    
    this.setState({ fetchRegistros: true })

    const sql = `${URL_DB}SEL_SOCIOS_GRUPO_FAM()`
    axios.get(sql)
    .then((response) => {
      this.setState({
        registros: response.data[0]
      });   
    })
    .catch((error) => console.log(error))
    .finally(() => {
      this.setState({ fetchRegistros: false })
    })

  }

  traerGrupoFam = (a_socio_min) => {
    
    const sql = `${URL_DB}SEL_SOCIOS('soc',${a_socio_min},'','')`
    axios.get(sql)
    .then((response) => {
      this.setState({
        grupoFam: response.data[0]
      });   
    })
    .catch((error) => console.log(error));
  }


 /*==========================================================================
   Utilidades de filtros y sort para la grilla ppal 
  *==========================================================================*/
   filtrarDatos() {
    const escapedValue = this.state.filterGrilla.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedValue, 'i');
    return this.state.registros.filter(filtro => 
      regex.test(filtro.lista_socios) )
  }

  ordenarGrilla = (key) => {
    const registros = ordenarGrilla(key, this.state.registros);

    this.setState({ registros });

  }

  handleChange = (event) => {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    })
  }

  handleModalAlta = (a_cual) => {

    this.setState({
      showModalEdit: true,

      sofa_grupo:0,
      grupoFam:[],
  
      respError: '',
      mensajeAlerta: '',
      mensajeColor: 'N' 
    });
    
  }

  handleModalEdit(regis) {

    this.traerGrupoFam(regis.soci_codi_min)
 
          this.setState({
            showModalEdit: true,
            sofa_grupo:regis.sofa_grupo,
            // la funcion completa grupoFam[]
            respError: '',
            mensajeAlerta: '',
            mensajeColor: 'N' 
          });
  

    
  }

  handleModalBaja(regis) {

    this.setState({
      showModalBaja: true,
      sofa_grupo: regis.sofa_grupo,
      sofa_lista: regis.lista_socios,
      baja_motivo:'',

      respError: '',
      mensajeAlerta: '',
      mensajeColor: 'N' 
    });

  }

  handleModalExit = () => {
   
    this.setState({ showModalEdit: false })
    this.setState({
      mensajeAlerta : 'No se aplicaron cambios',
      mensajeColor  : 'red',
    })
  }

  handleChangeSugg_soci_codi = (suggestion) => {

    this.setState({
      soci_codi_ret : suggestion.codigo,
      soci_razon_ret: suggestion.apenom
    });

  };

  agregarSociGFam = () => {
    if(this.state.soci_codi_ret!=='') {

      var obj = {}
      obj.soci_codi=this.state.soci_codi_ret;
      obj.apenom  = this.state.soci_razon_ret;
      obj.edad    = 0;
      var grupoFam = this.state.grupoFam;
      grupoFam.push(obj)
     
      this.setState({ grupoFam });
    }
  }

  quitarSociGFam = (a_soci) => {

    var grupoFam = this.state.grupoFam;
    grupoFam = grupoFam.filter((soc)=>{return soc.soci_codi!==a_soci})
    
    this.setState({ grupoFam });
  
  }
/*==========================================================================
   Actualizacion : Alta / Modificacion
*==========================================================================*/
handleGrabar = (event) => {
    event.preventDefault();

    var grupoFam_json = this.state.grupoFam.map((item) => { 
      var obj = {}
      obj.soci_codi = item.soci_codi;
      return ( obj )
    })  
    
const sql =  `${URL_DB}AM_SOCIOS_GRUPO_FAM(${this.state.login_id},
  ${this.state.sofa_grupo===''?0:this.state.sofa_grupo},'${String(JSON.stringify(grupoFam_json))}')`;
  console.log(sql);    
  axios.get(sql)
    .then((response) => {
          this.setState({
            respuestaSp: response.data[0]
          })
          var obj = this.state.respuestaSp[0];
          console.log(obj)
          this.setState({
            respError : obj.respuesta
          })
          if (this.state.respError==='OK') {
              this.setState({
                  mensajeAlerta : 'Registrado correctamente',
                  mensajeColor  : 'green',
                  showModalEdit : false
              })
              this.poblarGrilla()
          }    
      })
      .catch((error) => {
        alert('ERROR interno API al actualizar BD:'+error)
      })

  }

  handleEliminar = (event) => {
    event.preventDefault();
    
const sql =  `${URL_DB}B_SOCIOS_GRUPO_FAM(${this.state.login_id},${this.state.sofa_grupo},'${encodeURIComponent(this.state.baja_motivo)}')`;
console.log(sql)
    axios.get(sql)
    .then((response) => {
          this.setState({
            respuestaSp: response.data[0]
          })
          var obj = this.state.respuestaSp[0];
          console.log(obj)
          this.setState({
            respError : obj.respuesta
          })
          if (this.state.respError==='OK') {
              this.setState({
                  mensajeAlerta : 'Registrado correctamente',
                  mensajeColor  : 'green',
                  showModalBaja : false
              })
              this.poblarGrilla()
          }    
      })
      .catch((error) => {
        alert('ERROR interno API al actualizar BD:'+error)
      })

  }

/*==========================================================================
   RENDER
*==========================================================================*/

  render() {  

    const registrosFiltrados = this.filtrarDatos();
    const respError = this.state.respError;
    const mensajeAlerta = this.state.mensajeAlerta;
    const mensajeColor = this.state.mensajeColor;

    return(
      <div>        
        {mensajeAlerta.length >1 ? <Notifications mensaje={mensajeAlerta}
                                                  mensajeColor={mensajeColor}
                                    /> : '' }

        <Container fluid="true">
       
          <Row>
            <Col md={3} style={{fontSize:"22px"}}>
                <b>{`Grupos Familiares`}</b>
            </Col>
            <Col xs={3}>
              <Form.Group>
                <FormControl type="text" name="buscar" placeholder="Texto a filtrar" className="mr-sm-2" 
                        onChange={(e) => { this.setState({ filterGrilla: e.target.value })} } /> 
              </Form.Group>
            </Col>
            <Col xs={2}>

 { this.state.lee_mod==='M' 
              ?    <Button variant="primary" size="sm" onClick={this.handleModalAlta} >
                      <FaUserPlus /> Grupo Nuevo</Button>
              :    <Button variant="outline-danger" size="sm" disabled>Solo Lectura</Button>
  }    
            </Col>
          </Row>

          <Row>
            <Col>
              <Table bordered hover size="sm" id="data_table">
                <thead className="Grilla-header">
                <tr>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('sofa_grupo')}>
                      #ID</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('sofa_alta_f')}>
                      F.Alta</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('lista_socios')}>
                      Lista socios</Button>
                  </th>
                  <th>Acciones</th>
                </tr>
                </thead>
                {
                  this.state.fetchRegistros && 'Cargando...'
                }
                <tbody>
                {
                  registrosFiltrados.map((regis,i) => {
                    return (
                      <tr key={i}>
                        <td>{`#${regis.sofa_grupo}`}</td>
                        <td>{regis.sofa_alta_f}</td>
                        <td>{regis.lista_socios}</td>             
                        <td>
                        <Button variant="primary" size="sm" 
                              onClick={() => this.handleModalEdit(regis)}>
                                <FaRegEdit /></Button>
                          <Button variant="danger" size="sm" 
                              onClick={() => this.handleModalBaja(regis)}>
                                <FaTrashAlt /></Button>
                        </td>
 
                      </tr>  
                    ) 
                  }) 
                }
                </tbody>
      { registrosFiltrados.length>0 &&      
                <tfoot className="Grilla-header">
                  <tr>
                  <td colSpan={2}/>
                  <td style={{textAlign:"center"}}>{`${registrosFiltrados.length} Reg`}</td>
                  <td />
                  </tr>
                </tfoot>
      }
              </Table>
            </Col>
          </Row>
        </Container>



        <Modal show={this.state.showModalEdit} onHide={this.handleModalExit} dialogClassName="modal-40" >
          <Modal.Header closeButton>
            <Modal.Title>
            {this.state.sofa_grupo===0 ? `Nuevo Grupo Familiar` : `Modificar Grupo Familiar ID# ${this.state.sofa_grupo}` }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
                <Row>
                  <Col xs={9}>
                  <Form.Group>
                  <AutosuggestsComponent  tabla={'socio'}
                                    placeholder={'Digite Apellido a incluir en grupo'} 
                                    denoValue={this.state.autosuggestValue}
                                    onSubmitFunction={this.handleChangeSugg_soci_codi}
                                  />
                  </Form.Group>  
                  </Col>
                  <Col xs={3}>
                      <Button variant="primary" size="sm" 
                              onClick={this.agregarSociGFam}>
                                    <FaRegEdit /> + Socio</Button>
                  </Col>
                </Row>
                <br />
                <Row> 
                  <Col> 
                    <thead className="Grilla-header">
                    <tr>
                      <th>Socio</th>
                      <th>Apellido y nombre</th>
                      <th>Edad</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                      this.state.grupoFam.map((regsoc,i) => {
                        return (
                          <tr key={i}>
                            <td style={{textAlign:"center"}}>{regsoc.soci_codi}</td>
                            <td>{regsoc.apenom}</td>
                            <td style={{textAlign:"center"}}>{regsoc.edad}</td>             
                            <td>
                              <Button variant="danger" size="sm" 
                                  onClick={() => this.quitarSociGFam(regsoc.soci_codi)}>
                                    <FaTrashAlt /></Button>
                            </td>
    
                          </tr>  
                        ) 
                      }) 
                    }
                    </tbody>
                  </Col>
                </Row>
                <br />
                <Row>
                    <Col xs={5}>

  { this.state.lee_mod==='M' 
                ?    <Button variant="success" size="sm" onClick={this.handleGrabar}>
                        Grabar</Button>
                :    <Button variant="outline-danger" size="sm" disabled>Solo Lectura</Button>
  }  
                      <Button variant="secondary" size="sm" onClick={this.handleModalExit}>
                          Cancelar
                      </Button>
                    </Col>
                    <Col xs={7}>
                      <Alert key="1" variant="danger" show={respError.length >3 ? true : false} >
                        {respError}
                      </Alert>
                    </Col>
                  </Row>
            </Form>
          </Modal.Body>
        </Modal>



        <Modal show={this.state.showModalBaja} onHide={() =>{this.setState({showModalBaja:false})}} dialogClassName="modal-40">
          <Modal.Header closeButton style={{ backgroundColor: "#ff6666" }}>
            <Modal.Title>
            {`Eliminar Grupo Fam (NO elimina socios, elimina solo la agrupación)` }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <Form>
            <Row>
              <Col>
                <b>{this.state.sofa_lista}</b>
              </Col>
            </Row>
            <br />
            <Row> 
              <Col>
                <Form.Group>
                  <Form.Label>Motivo de eliminar el beneficio</Form.Label>
                  <Form.Control as="textarea" rows={3} name="baja_motivo" value={this.state.baja_motivo}
                                onChange={this.handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <br />
            <Row>
              <Col xs={8} style={{textAlign: "right"}}>
                  <Button variant="danger" size="sm"
                          onClick={this.handleEliminar}>
                    Eliminar Grupo
                  </Button>
                  <Button variant="secondary" size="sm" 
                          onClick={() => {this.setState({showModalBaja:false})}}>
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


      </div>
    );
  }
}

export default SociosGfam;
