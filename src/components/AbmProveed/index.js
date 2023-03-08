import React  from 'react';
import { URL_DB } from './../../constants';
import axios from 'axios';
import { Table, Row, Col, Container, Button, Modal, Form, FormGroup, FormControl, Alert } from 'react-bootstrap';
import exportToCSV from '../../utils/functions/export-excel';
import Notifications from '../../components/Notifications';
import ordenarGrilla from './../../utils/functions/ordenar-grilla'
import '../../pages/stylePages.css';
import { FaRegEdit, FaTrashAlt, FaGlasses, FaDownload} from "react-icons/fa";
import ShowLogElemento from '../ShowLogElemento';

class AbmProveed extends React.Component {

  constructor(props) {
    super(props);

    var hoy = new Date();  

    this.state = {
      lee_mod : props.lee_mod,
      registros : [],
      categIva:[],
      motivosBaja:[],
      fetchRegistros:'',
      buscarGrillaValue: '',
      showModalEdit: false,
      showModalBaja: false,
      showLogElem: false,
      confirmaBaja:'',
      login_id: sessionStorage.getItem('USUA_ID'),
      hoy   : hoy.toISOString().split('T')[0],

      cpro_id :'',
      cpro_razon:'',
      cpro_mail:'',
      cpro_tele:'',
      cpro_nota:'',
      cpro_cuit:'',
      cpro_ivac_id:'',
      cpro_domi:'',
      cpro_baja_moti:'',
      baja_motivo:'',

      filterGrilla: '',
      fetchingregistros: false,
      expSql : '',
      expTitulo:'Reporte de Socios',
      expSubtit: '',
      respuestaSp: [],
      respError: '',
      mensajeAlerta: '',
    };
  
  }

  async getCategIva() {

    const sql = `${URL_DB}SEL_IVA_CATEGORIAS_DD()`
    axios.get(sql)
    .then((response) => {
      this.setState({
        categIva: response.data[0]
      });    
    })
    .catch((error) => console.log(error));
  }
  

  async getMotivosBaja() {
    const sql =  `${URL_DB}SEL_BAJA_MOTIVOS_DD('PROVE')`
    axios.get(sql)
      .then((response) => {
        this.setState({
          motivosBaja: response.data[0]
        })
      })
      .catch((error) => console.log(error))
  }

  async getInicio() {
    try{
      await Promise.all([ this.getCategIva(), this.getMotivosBaja(), ])
    } catch(e) {
      console.log(e);
    }
  }

  componentDidMount() {

    this.getInicio()
    this.poblarGrilla()
  }

  /*==========================================================================
   Utilidades de filtros y sort para la grilla ppal 
  *==========================================================================*/
  filtrarDatos() {
    const escapedValue = this.state.filterGrilla.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedValue, 'i');
    return this.state.registros.filter(filtro => 
      regex.test(filtro.cpro_razon) || 
      regex.test(filtro.cpro_cuit ) || 
      regex.test(filtro.cuen_deno) ||
      regex.test(filtro.cpro_mail) ||
      regex.test(filtro.cpro_tele) ||
      regex.test(filtro.cpro_nota) ||
      regex.test(filtro.ivac_deno) || 
      regex.test(filtro.cpro_domi) || 
      regex.test(filtro.baja_deno) )
  }
      
  ordenarGrilla = (key) => {
    const registros = ordenarGrilla(key, this.state.registros);

    this.setState({ registros });
  }

  /*==========================================================================
   Abro modal para modificar : Cargo valores y combos
  *==========================================================================*/
  handleModalAlta = () => {

    this.setState({
      showModalEdit: true,
      cpro_id :0,
      cpro_razon:'',
      cpro_mail:'',
      cpro_tele:'',
      cpro_nota:'',
      cpro_cuit:'',
      cpro_ivac_id:'',
      cpro_domi:'',

      respError: '',
      mensajeAlerta: '',
      mensajeColor: 'N' 
    });
    
  }

  handleModalEdit(regis) {

    this.setState({
      showModalEdit: true,
      cpro_id : regis.cpro_id,
      cpro_razon: regis.cpro_razon,
      cpro_mail: regis.cpro_mail,
      cpro_tele: regis.cpro_tele,
      cpro_nota: regis.cpro_nota,
      cpro_cuit: regis.cpro_cuit,
      cpro_ivac_id: regis.cpro_ivac_id,
      cpro_domi: regis.cpro_domi,

      respError: '',
      mensajeAlerta: '',
      mensajeColor: 'N' 
    });
  
  }

  handleModalBaja(regis) {

    this.setState({
      showModalBaja: true,
      cpro_id : regis.cpro_id,
      cpro_razon: regis.cpro_razon,
      baja_motivo:'',

      respError: '',
      mensajeAlerta: '',
      mensajeColor: 'N' 
    });
  
  }
  
  handleShowLog = (regis) => {
    
    this.setState({
      showLogElem : true,
      cpro_id     : regis.cpro_id,
    });
  
  }


  handleChange = (event) => {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });

  };
  
  poblarGrilla = (e) => {

    this.setState({registros: [],
                  fetchRegistros: true,
    });

    const sql = `${URL_DB}SEL_CAJA_PROVEEDORES(null)`
    axios.get(sql)
      .then((response) => {
        this.setState({
          registros: response.data[0],
          expSql: sql,
          expSubtit: 'Todos los registrados'
        })
      })
      .catch((error) => console.log(error))
      .finally(() => {
        this.setState({ fetchRegistros: false })
      })

  }

  handleModalExit = () => {
   
    this.setState({ showModalEdit: false })
    this.setState({
      mensajeAlerta : 'No se aplicaron cambios',
      mensajeColor  : 'red',
    })
  }


/*==========================================================================
   Actualizacion : Modificacion a base de datos
*==========================================================================*/

handleGrabarProvee = (event) => {

const sql =  `${URL_DB}AM_CAJA_PROVEEDORES(${this.state.login_id},${this.state.cpro_id},'${encodeURIComponent(this.state.cpro_razon)}',
'${this.state.cpro_mail}','${this.state.cpro_tele}','${this.state.cpro_cuit}',${this.state.cpro_ivac_id===''?0:this.state.cpro_ivac_id},'${encodeURIComponent(this.state.cpro_domi)}',
'${encodeURIComponent(this.state.cpro_nota)}')`  
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
              this.poblarGrilla()
          }    
      })
      .catch((error) => {
        alert('ERROR interno API al actualizar BD:'+error+sql)
      })
  
}

BorrarProveedor = (reg) => {
    const sql =  `${URL_DB}B_CAJA_PROVEEDORES(${this.state.login_id},'${this.state.cpro_id}',
    '${this.state.cpro_baja_moti}','${encodeURIComponent(this.state.baja_motivo)}')`;
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
                  showModalBaja: false
              })
              this.poblarGrilla();
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
            <Col xs={5} style={{fontSize:"22px"}} >
                <b>ABM Proveedores</b>
            </Col>
              <Col xs={3}>
                <Form.Group>
                <FormControl type="text" name="buscar" placeholder="Texto a filtrar" className="mr-sm-2" 
                        onChange={(e) => { this.setState({ filterGrilla: e.target.value })} } /> 
              </Form.Group>
            </Col>
            <Col xs={2}>
      { this.state.lee_mod==='M' 
          ?    <Button variant="primary" size="sm"  onClick={this.handleModalAlta} >
                + Agregar
               </Button>
          :    <Button variant="outline-danger" size="sm" disabled>Solo Lectura</Button>
      }   
            </Col>
            <Col xs={1}>
     {/*        <Button  variant='outline-warning' size='sm' onClick={() => {this.setState({ showhelp : true}) } } > 
             Ayuda
            </Button>*/}
           </Col> 
            <Col xs={1}>
  { this.state.registros.length > 0 &&
                <Button variant='outline-success' size='sm' 
                        onClick={(e) => exportToCSV(this.state.expTitulo,this.state.expSubtit,this.state.expSql) } > 
                        <FaDownload /> Excel
                </Button>
  }
            </Col>
          </Row>

          <Row>
            <Col>
              <Table striped bordered hover size="sm" id="data_table">
                <thead className="Grilla-header">
                <tr>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('cpro_id')}>
                      #ID</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('cpro_razon')}>
                      Razon social</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('cpro_mail')}>
                      Mail</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('cpro_tele')}>
                      Telef/Celu</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('cpro_nota')}>
                      Nota</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('cpro_cuit')}>
                      CUIT</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('ivac_deno')}>
                      Categ IVA</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('cpro_domi')}>
                      Domicilio</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('alta')}>
                      Alta</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('baja')}>
                      Baja</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('baja_deno')}>
                      Mot Baja</Button>
                  </th>
                  <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {
                  this.state.fetchingregistros && 'Cargando...'
                }
                {
                  registrosFiltrados.map((regis, i) => {
                    return (
                      <tr key={i} style={{backgroundColor: regis.color_row}}>
                        <td style={{textAlign: "center"}}>{regis.cpro_id}</td>
                        <td style={{textAlign: "left"}}>{regis.cpro_razon}</td>
                        <td style={{textAlign: "left"}}>{regis.cpro_mail}</td>
                        <td style={{textAlign: "left"}}>{regis.cpro_tele}</td>
                        <td style={{textAlign: "left"}}>{regis.cpro_nota}</td>
                        <td style={{textAlign: "left"}}>{regis.cpro_cuit}</td>
                        <td style={{textAlign: "left"}}>{regis.ivac_deno}</td>
                        <td style={{textAlign: "left"}}>{regis.cpro_domi}</td>
                        <td style={{textAlign: "center"}}>{regis.alta}</td>
                        <td style={{textAlign: "center"}}>{regis.baja}</td>
                        <td style={{textAlign: "left"}}>{regis.baja_deno}</td>
                        <td>
  {        regis.tiene_modi==='S' &&
                          <Button variant="secondary" size="sm" 
                              onClick={() => this.handleShowLog(regis)}>
                                <FaGlasses /></Button>
  }
  {        regis.baja==='' &&
                          <Button variant="primary" size="sm" 
                              onClick={() => this.handleModalEdit(regis)}>
                                <FaRegEdit /></Button>
  }
  {        regis.baja==='' && this.state.lee_mod==='M' &&
                          <Button variant="danger" size="sm" 
                              onClick={() => this.handleModalBaja(regis)}>
                                <FaTrashAlt /></Button>
  }
                        </td>
                        <td style={{textAlign: "center"}}>{regis.movi_subc_id}</td>
                      </tr>  
                    ) 
                  }) 
                }
                </tbody>
              </Table>
            </Col>
          </Row>
        </Container>





        <Modal show={this.state.showModalEdit} onHide={this.handleModalExit} dialogClassName="modal-60" >
          <Modal.Header closeButton>
            <Modal.Title>
            {this.state.cpro_id ===0 ? 'Nuevo Proveedor ' : `Editar Proveed ID# ${this.state.cpro_id}` }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Col md={7}>      
                  <FormGroup>
                    Razon social
                    <FormControl  type="text" name={'cpro_razon'} value={this.state.cpro_razon}
                      onChange={this.handleChange} style={{ textTransform: 'capitalize'}}
                    />
                  </FormGroup>
                </Col>
                <Col md={5}>      
                  <FormGroup>
                    Mail
                    <FormControl  type="text" name={'cpro_mail'} value={this.state.cpro_mail}
                      onChange={this.handleChange}
                    />
                  </FormGroup>
                </Col>

              </Row>
              <Row>
                <Col md={8}>      
                  <FormGroup>
                    Domicilio completo
                    <FormControl  type="text" name={'cpro_domi'} value={this.state.cpro_domi}
                      onChange={this.handleChange}  style={{ textTransform: 'capitalize'}}
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>      
                  <FormGroup>
                    Telef/ Celular
                    <FormControl  type="text" name={'cpro_tele'} value={this.state.cpro_tele}
                      onChange={this.handleChange}
                    />
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col md={4}>      
                  <FormGroup>
                    CUIT
                    <FormControl  type="text" name={'cpro_cuit'} value={this.state.cpro_cuit}
                      onChange={this.handleChange}
                    />
                  </FormGroup>
                </Col>
                <Col md={8}>                
                  <FormGroup>
                  Categoría Iva
                  <select className="form-control" name="cpro_ivac_id" value={this.state.cpro_ivac_id} 
                        onChange={this.handleChange} >
                        { this.state.movi_subc_id==='' &&  // Cuando esta vacio ponemos un reg de 'Seleccion' para que haga el change
                                      <option key={'0'} value={''} disabled >( Seleccione categ )</option>
                      }
                        { this.state.categIva.map((cat) => { 
                            return (
                                    <option key={cat.ivac_id} 
                                            value={cat.ivac_id}
                                    > {cat.ivac_deno}
                                    </option>
                                    ) 
                          }) }

                    </select>
                  </FormGroup>
                  </Col>
                </Row>
                <Row> 
                  <Col>
                    <Form.Group>
                      <Form.Label>Notas</Form.Label>
                      <Form.Control as="textarea" rows={3} name="cpro_nota" value={this.state.cpro_nota}
                                    onChange={this.handleChange} />
                    </Form.Group>
                  </Col>
                </Row>
                <br />
                <Row>
                    <Col>

            { this.state.lee_mod==='M' 
                ?    <Button variant="success" size="sm" onClick={this.handleGrabarProvee}>
                        Grabar
                     </Button>
                :    <Button variant="outline-danger" size="sm" disabled>Solo Lectura</Button>
            }    
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
            </Form>
          </Modal.Body>
        </Modal>




        <Modal show={this.state.showModalBaja} onHide={() =>{this.setState({showModalBaja:false})}} dialogClassName="modal-40">
          <Modal.Header closeButton style={{ backgroundColor: "#ff6666" }}>
            <Modal.Title>
              {`Eliminar Proveedor #${this.state.cpro_id}`}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <Form>
            <Row>
              <Col>
                {this.state.cpro_razon}
              </Col>
            </Row>
            <br />
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Seleccione motivo de baja</Form.Label>
                  <select className="form-control" name="cpro_baja_moti" value={this.state.cpro_baja_moti}
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
                  <Form.Label>Puede describir el motivo de la baja</Form.Label>
                  <Form.Control as="textarea" rows={3} name="baja_motivo" value={this.state.baja_motivo}
                                onChange={this.handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <br />
            <Row>
              <Col xs={8} style={{textAlign: "right"}}>
                  <Button variant="danger" size="sm"
                          onClick={() => {this.BorrarProveedor('B')}}>
                    Eliminar Proveedor
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


        < Modal show={this.state.showLogElem} 
                onHide={() => { this.setState({ showLogElem : false}) } } 
                dialogClassName="modal-60">
            <ShowLogElemento  ulog_clave={'PROVE'} 
                              ulog_id_number={this.state.cpro_id}
                              />
        </Modal>

      </div>
    );
  }
}

export default AbmProveed;
