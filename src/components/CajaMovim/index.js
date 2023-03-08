import React  from 'react';
import { URL_DB } from './../../constants';
import axios from 'axios';
import { Table, Row, Col, Container, Button, Modal, Form, FormGroup, FormControl, Alert } from 'react-bootstrap';
import exportToCSV from '../../utils/functions/export-excel';
import Notifications from '../../components/Notifications';
import ordenarGrilla from './../../utils/functions/ordenar-grilla'
import '../../pages/stylePages.css';
import { FaRegEdit, FaTrashAlt, FaGlasses, FaLock, FaDownload} from "react-icons/fa";
import { DiDatabase } from "react-icons/di";
import swal from 'sweetalert';
import ShowLogElemento from '../ShowLogElemento';


// FaPlus
class CajaMovim extends React.Component {
  constructor(props) {
    super(props);

    var hoy = new Date(); 
    var primer = new Date(hoy.getFullYear(),hoy.getMonth(),1);

    this.state = {
      lee_mod : props.lee_mod,
      clubActi : props.clubActi,
      registros : [],
      actividades:[],
      subcuentas:[],
      motivosBaja:[],
      proveedores:[],
      fetchRegistros:false,
      expSql : '',
      expTitulo:'Movimientos de Caja',
      expSubtit: '',
      buscarGrillaValue: '',
      showModalEdit: false,
      showModalBaja: false,
      showLogElem: false,
      confirmaBaja:'',
      login_id: sessionStorage.getItem('USUA_ID'),
      acti : '000',
      desde : primer.toISOString().split('T')[0],
      hasta : hoy.toISOString().split('T')[0],
      hoy   : hoy.toISOString().split('T')[0],

      movi_id:0,
      actividad:'',
      movi_subc_id:'',
      movi_monto:0,
      movi_cpro_id:'',
      movi_fecha_f:'',
      movi_deno:'',
      movi_compro_tipo:'',
      movi_compro_nro:'',
      baja_motivo:'',

      filterGrilla: '',
      respuestaSp: [],
      respError: '',
      mensajeAlerta: '',
    };

    //this.ordenarGrilla   = this.ordenarGrilla.bind(this);
  
  }

  async getActividades() {

    const sql = `${URL_DB}SEL_ACTI_TEMPO_DD_ACTIVIDADES('A')`
    axios.get(sql)
    .then((response) => {
      this.setState({
        actividades: response.data[0]
      });    
    })
    .catch((error) => console.log(error));
  }
  
  async getConceptos() {

    const sql = `${URL_DB}SEL_CAJA_SUBCTA_DD('${this.state.clubActi}')`
    axios.get(sql)
    .then((response) => {
      this.setState({
        subcuentas: response.data[0]
      });    
    })
    .catch((error) => console.log(error));
  }

  async getMotivosBaja() {
    const sql =  `${URL_DB}SEL_BAJA_MOTIVOS_DD('MCAJA')`
    axios.get(sql)
      .then((response) => {
        this.setState({
          motivosBaja: response.data[0]
        })
      })
      .catch((error) => console.log(error))
  }

  async getProveedores() {
    const sql =  `${URL_DB}SEL_CAJA_PROVEEDORES('DD')`
    axios.get(sql)
      .then((response) => {
        this.setState({
          proveedores: response.data[0]
        })
      })
      .catch((error) => console.log(error))
  }

  async getInicio() {
    try{
      await Promise.all([ this.getActividades(), this.getConceptos(), this.getMotivosBaja(), this.getProveedores() ])
    } catch(e) {
      console.log(e);
    }
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
      regex.test(filtro.movi_id) || 
      regex.test(filtro.actividad) || 
      regex.test(filtro.cuen_deno) ||
      regex.test(filtro.subc_deno) || 
      regex.test(filtro.movi_deno) || 
      regex.test(filtro.movi_monto) || 
      regex.test(filtro.cpro_razon) ||
      regex.test(filtro.movi_compro_tipo) || 
      regex.test(filtro.movi_compro_nro) )
  }
      
  ordenarGrilla = (key) => {
    const registros = ordenarGrilla(key, this.state.registros);

    this.setState({ registros });
  }

  /*==========================================================================
   Abro modal para modificar : Cargo valores y combos
  *==========================================================================*/
  handleModalAlta = () => {

    if (this.state.clubActi==='A' && this.state.acti==='000') {
      swal({ 
        title : `Error al agregar un movimiento`,
        text  : ' Seleccione una actividad y Reintente',});
   
    } else {

      this.setState({
        showModalEdit: true,
        movi_id:0,
        movi_acti: this.state.clubActi==='C'?'000':this.state.acti,
        actividad: this.state.clubActi==='C'?'Adm Club':this.state.actividades.filter((e)=>{ return e.acti_acti===this.state.acti})[0].acti_deno,
        movi_subc_id:'',
        movi_monto:0,
        movi_cpro_id:'',
        movi_fecha_fe: this.state.hoy,
        movi_deno:'',
        movi_compro_tipo:'RC',
        movi_compro_nro:'',

        respError: '',
        mensajeAlerta: '',
        mensajeColor: 'N' 
      });
    }
  }

  handleModalEdit(regis) {

    this.setState({
      showModalEdit: true,
      movi_id:      regis.movi_id,
      movi_acti: this.state.clubActi==='C'?'000':this.state.acti,
      actividad: this.state.clubActi==='C'?'Adm Club':this.state.actividades.filter((e)=>{ return e.acti_acti===this.state.acti})[0].acti_deno,
      movi_subc_id: regis.movi_subc_id,
      movi_monto:   regis.movi_monto,
      color:        regis.color,
      movi_cpro_id: regis.movi_cpro_id,
      movi_fecha_f: regis.movi_fecha_f,
      movi_fecha_fe:regis.movi_fecha_fe,
      movi_deno:    regis.movi_deno,
      movi_compro_tipo: regis.movi_compro_tipo,
      movi_compro_nro:  regis.movi_compro_nro,

      respError: '',
      mensajeAlerta: '',
      mensajeColor: 'N' 
    });
  
  }

  handleModalBaja(regis) {

    this.setState({
      showModalBaja: true,
      movi_id:      regis.movi_id,
      movi_acti: this.state.clubActi==='C'?'000':this.state.acti,
      actividad: this.state.clubActi==='C'?'Adm Club':this.state.actividades.filter((e)=>{ return e.acti_acti===this.state.acti})[0].acti_deno,
      movi_baja_moti: '',
      baja_motivo:  '',
      movi_deno:    regis.movi_deno,
      movi_compro_tipo: regis.movi_compro_tipo,
      movi_compro_nro:  regis.movi_compro_nro,

      respError: '',
      mensajeAlerta: '',
      mensajeColor: 'N' 
    });
  
  }
  
  handleShowLog = (regis) => {
    
    this.setState({
      showLogElem : true,
      movi_id     : regis.movi_id,
    });
  
  }


  handleChange = (event) => {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });

    // si cambio el concepto refresh de color
    if (name==='movi_subc_id') {
      this.setState({ color: this.state.subcuentas.find(c => c.subc_id===Number(value)).color });
    }

  };
  
  poblarGrilla = (e) => {


    if (this.state.acti==='000' && this.state.clubActi==='A') {
      
      swal({ 
        title : `Error`,
        text  : ' Seleccione una actividad y Reintente',});

    } else {

      this.setState({registros: [],
                    fetchRegistros: true,});

      const sql = `${URL_DB}SEL_CAJA_MOVIMIENTOS('${this.state.acti}','${this.state.desde}','${this.state.hasta}')`
      axios.get(sql)
        .then((response) => {
          this.setState({
            registros: response.data[0],
            expSql: sql,
            expSubtit: this.state.clubActi==='C'?'Adm Club':this.state.actividades.find(f => f.acti_acti===this.state.acti).acti_deno
          })
        })
        .catch((error) => console.log(error))
        .finally(() => {
          this.setState({ fetchRegistros: false })
        })
    }
  }

  handleModalExit = () => {
   
    this.setState({ showModalEdit: false })
    this.setState({
      mensajeAlerta : 'No se aplicaron cambios',
      mensajeColor  : 'red',
    })
  }


  /*==========================================================================
   Actualizacion : Modificacion usuario y sus accesos
  *==========================================================================*/

  handleGrabarMovim = (event) => {

const sql =  `${URL_DB}AM_CAJA_MOVIMIENTOS(${this.state.login_id},${this.state.movi_id},'${this.state.movi_acti}',
${this.state.movi_cpro_id===''?0:this.state.movi_cpro_id},'${this.state.movi_fecha_fe}','${encodeURIComponent(this.state.movi_deno)}',
${this.state.movi_subc_id===''?0:this.state.movi_subc_id},${this.state.movi_monto===''?0:this.state.movi_monto},
'${this.state.movi_compro_tipo}','${this.state.movi_compro_nro}')`  

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
        alert('ERROR interno API al actualizar BD:'+error)
      })

  }

  BorrarMovimiento = (reg) => {
    const sql =  `${URL_DB}B_CAJA_MOVIMIENTOS(${this.state.login_id},'${this.state.movi_id}',
    '${this.state.movi_baja_moti}','${encodeURIComponent(this.state.baja_motivo)}')`;
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
            <Col xs={2} style={{fontSize:"22px"}}>
                <b>{`Mov caja ${this.state.clubActi==='C'?'Club':'Activ'}`}</b>
            </Col>
            <Col md={2} >
  { this.state.clubActi==='A' && 
                <Form.Group>
                <Form.Label><b>Seleccione Actividad</b></Form.Label>
                <select className="form-control" name="acti" value={this.state.acti} style={{fontWeight: "bold" }}
                        onChange={this.handleChange} >
                    { this.state.acti==='000' &&  // Cuando esta vacio ponemos un reg de 'Seleccion' para que haga el change
                                  <option key={'-1'} value={'000'} disabled >( Selec Actividad )</option>
                  }
                    { this.state.actividades.map((act) => { 
                        return (
                                <option key={act.acti_acti} 
                                        value={act.acti_acti}
                                > {act.acti_deno}
                                </option>
                                ) 
                      }) }

                </select>
                </Form.Group>
  }
              </Col>
              <Col xs={2}>
                <Form.Group>
                  <Form.Label><b>Desde</b></Form.Label>
                  <Form.Control type="date" name="desde" value={this.state.desde} onChange={this.handleChange}
                                          style={{ fontWeight: "bold" }} />
                </Form.Group>
              </Col>
              <Col xs={2}>
                <Form.Group>
                  <Form.Label><b>Hasta</b></Form.Label>
                  <Form.Control type="date" name="hasta" value={this.state.hasta} onChange={this.handleChange}
                                          style={{ fontWeight: "bold" }} />
                </Form.Group>
              </Col>
              <Col xs={1}>
                  <Button  variant='outline-primary' size='sm' onClick={this.poblarGrilla} > 
                  <DiDatabase />Consultar
                  </Button>
              </Col>
              <Col xs={1}>
                <Form.Group>
                <Form.Label><b>Buscar...</b></Form.Label>
                <FormControl type="text" name="buscar" placeholder="Texto a filtrar" className="mr-sm-2" 
                        onChange={(e) => { this.setState({ filterGrilla: e.target.value })} } /> 
              </Form.Group>
            </Col>
            <Col xs={1}>
  { this.state.lee_mod==='M' 
            ?  <Button variant="primary" size="sm" type="submit" 
                        onClick={this.handleModalAlta} >+ Agregar
               </Button>
            :  <Button variant="outline-danger" size="sm" disabled>Solo Lectura</Button>
  }
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
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('movi_id')}>
                      #ID</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('actividad')}>
                      Actividad</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('cuen_deno')}>
                      Concepto</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('subc_deno')}>
                      SubConcepto</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('cpro_razon')}>
                      Proveedor</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('movi_fecha_f')}>
                      Fecha</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('movi_deno')}>
                      Denominación</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('ingreso')}>
                      Ingreso</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('egreso')}>
                      Egreso</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('movi_compro_tipo')}>
                      Tipo</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('movi_compro_nro')}>
                      Comprobante</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('movi_alta_f')}>
                      Alta</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('movi_baja_f')}>
                      Baja</Button>
                  </th>              
                  <th>Acciones</th>
                </tr>
                </thead>
                {
                  this.state.fetchRegistros && 'Cargando...'
                }
                <tbody>
                {
                  registrosFiltrados.map((regis, i) => {
                    return (
                      <tr key={i} style={{backgroundColor: regis.color_row}}>
                        <td style={{textAlign: "center"}}>{regis.movi_id}</td>
                        <td style={{textAlign: "left"}}>{regis.actividad}</td>
                        <td style={{textAlign: "left"}}>{regis.cuen_deno}</td>
                        <td style={{textAlign: "left"}}>{regis.subc_deno}</td>
                        <td style={{textAlign: "center"}}>{regis.cpro_razon}</td>
                        <td style={{textAlign: "center"}}>{regis.movi_fecha_f}</td>
                        <td style={{textAlign: "left"}}>{regis.movi_deno}</td>
                        <td style={{textAlign: "right", backgroundColor: regis.color}}>{regis.ingreso}</td>
                        <td style={{textAlign: "right", backgroundColor: regis.color}}>{regis.egreso}</td>
                        <td style={{textAlign: "left"}}>{regis.movi_compro_tipo}</td>
                        <td style={{textAlign: "center"}}>{regis.movi_compro_nro}</td>
                        <td style={{textAlign: "center"}}>{regis.movi_alta}</td>
                        <td style={{textAlign: "center"}}>{regis.movi_baja}</td>
                        <td>
  {        regis.tiene_modi==='S' &&
                          <Button variant="secondary" size="sm" 
                              onClick={() => this.handleShowLog(regis)}>
                                <FaGlasses /></Button>
  }
  {        regis.movi_baja==='' && regis.cuen_es_sys==='N' &&
                          <Button variant="primary" size="sm" 
                              onClick={() => this.handleModalEdit(regis)}>
                                <FaRegEdit /></Button>
  }
  {        regis.movi_baja==='' && regis.cuen_es_sys==='N' && this.state.lee_mod==='M' && 
                          <Button variant="danger" size="sm" 
                              onClick={() => this.handleModalBaja(regis)}>
                                <FaTrashAlt /></Button>
  }
  {        regis.cuen_es_sys==='S' &&
                                <FaLock />
  }
                        </td>
                        <td style={{textAlign: "center"}}>{regis.movi_subc_id}</td>
                      </tr>  
                    ) 
                  }) 
                }
                </tbody>
        { registrosFiltrados.length>0 &&      
                <tfoot className="Grilla-header">
                  <tr>
                  <td style={{textAlign:"center"}}>{`${registrosFiltrados.length} Reg`}</td>
                  <td colSpan={5} />
                  <td>{`Total = ${registrosFiltrados.reduce((acum, act) => acum + Number(act.movi_monto),0)}`}</td>
                  <td style={{textAlign:"right"}}>{registrosFiltrados.reduce((acum, act) => acum + Number(act.ingreso),0)}</td>
                  <td style={{textAlign:"right"}}>{registrosFiltrados.reduce((acum, act) => acum + Number(act.egreso),0)}</td>
                  <td colSpan={5} />
                  </tr>
                </tfoot>
        }
              </Table>
            </Col>
          </Row>
        </Container>





        <Modal show={this.state.showModalEdit} onHide={this.handleModalExit} dialogClassName="modal-60" >
          <Modal.Header closeButton>
            <Modal.Title>
            {this.state.movi_id ===0 ? 'Nuevo Movimiento ' : `Editar Mov ID# ${this.state.movi_id}` }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Col md={3}>
                  <FormGroup>
                    Actividad
                    <FormControl  type="text" name={'actividad'} value={this.state.actividad} readOnly
                    />
                    </FormGroup>
                </Col>
                <Col md={9}>                
                  <FormGroup>
                  Concepto
                  <select className="form-control" name="movi_subc_id" value={this.state.movi_subc_id} 
                        style={{backgroundColor: this.state.color}}
                        onChange={this.handleChange} >
                        { this.state.movi_subc_id==='' &&  // Cuando esta vacio ponemos un reg de 'Seleccion' para que haga el change
                                      <option key={'0'} value={''} disabled >( Seleccione concepto )</option>
                      }
                        { this.state.subcuentas.map((con) => { 
                            return (
                                    <option key={con.subc_id} 
                                            value={con.subc_id}
                                            style={{backgroundColor:con.color}}
                                    > {con.deno}
                                    </option>
                                    ) 
                          }) }

                  </select>
                </FormGroup>
              </Col>
            </Row>
      
            <Row>
              <Col md={3}>                
                  <FormGroup>
                    Fecha
                    <FormControl  type="date" name={'movi_fecha_fe'} value={this.state.movi_fecha_fe}
                                  onChange={this.handleChange}
                    />
                  </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  Proveedor
                  <select className="form-control" name="movi_cpro_id" value={this.state.movi_cpro_id} 
                        onChange={this.handleChange} >
                        { this.state.movi_cpro_id==='' &&  // Cuando esta vacio ponemos un reg de 'Seleccion' para que haga el change
                                      <option key={'0'} value={''} disabled >( Seleccione proveedor )</option>
                      }
                        { this.state.proveedores.map((pro, i) => { 
                            return (
                                    <option key={i} 
                                            value={pro.cpro_id}
                                            style={{backgroundColor:pro.color}}
                                    > {pro.cpro_razon}
                                    </option>
                                    ) 
                          }) }

                  </select>
                </FormGroup>
              </Col>
              <Col md={3}>
                  <FormGroup>
                    Importe
                    <FormControl  type="number" name={'movi_monto'} value={this.state.movi_monto}
                                  onChange={this.handleChange}
                    />
                  </FormGroup>
                </Col>
            </Row>
            <Row>
              <Col md={12}>
                <FormGroup>
                    Detalle del comprobante
                    <FormControl as="textarea" rows={3} name={'movi_deno'} value={this.state.movi_deno}
                                  onChange={this.handleChange}
                    />
                </FormGroup>
              </Col>
            </Row>
            <Row>
                <Col md={2}>
                <FormGroup>
                    Tipo Comp
                  <select className="form-control" name="movi_compro_tipo" value={this.state.movi_compro_tipo} 
                        onChange={this.handleChange} >
                        <option key={1} value={'RC'}>Recibo</option>
                        <option key={2} value={'FC'}>Factura</option>
                        <option key={3} value={'NC'}>N Cred</option>
                        <option key={4} value={'ND'}>N Deb</option>
                  </select>
                </FormGroup>
                </Col>
                <Col md={4}>      
                  <FormGroup controlId="usua_celular" >
                    Comprobante
                    <FormControl  type="text" name={'movi_compro_nro'} value={this.state.movi_compro_nro}
                      onChange={this.handleChange}
                    />
                  </FormGroup>
                </Col>
  
                </Row>
                <br />
                <Row>
                    <Col>
  { this.state.lee_mod==='M' 
                ?     <Button variant="success" size="sm" onClick={this.handleGrabarMovim}>
                          Grabar</Button>
                :     <Button variant="outline-danger" size="sm" disabled>Solo Lectura</Button>
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
              {`Eliminar movimiento #${this.state.movi_id} - ${this.state.actividad}`}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <Form>
            <Row>
              <Col>
              {`Comprobante ${this.state.movi_compro_tipo} ${this.state.movi_compro_nro} : ${this.state.movi_deno}`}
              </Col>
            </Row>
            <br />
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Seleccione motivo de baja</Form.Label>
                  <select className="form-control" name="movi_baja_moti" value={this.state.movi_baja_moti}
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
                          onClick={() => {this.BorrarMovimiento('B')}}>
                    Eliminar Movimiento
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
            <ShowLogElemento  ulog_clave={'MCAJA'} 
                              ulog_id_number={this.state.movi_id}
                              />
        </Modal>

      </div>
    );
  }
}

export default CajaMovim;
