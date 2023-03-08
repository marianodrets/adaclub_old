import React from 'react';
import { URL_DB } from './../../constants';
import axios from 'axios';
import { Table, Row, Col, Container, Button, Form, FormControl,FormGroup, Alert, Modal } from 'react-bootstrap';
import exportToCSV from '../../utils/functions/export-excel';
import { FaRegEdit, FaTrashAlt, FaGlasses, FaDownload } from "react-icons/fa";
import swal from 'sweetalert';
import ordenarGrilla from './../../utils/functions/ordenar-grilla'
import '../../pages/stylePages.css';

class AdmiTari extends React.Component {
  constructor(props) {
    super(props);

    var hoy = new Date();

    this.state = {
      lee_mod : props.lee_mod,
      registros: [],
      sociCateg:[],
      actiCateg:[],
      motivosBaja:[],
      hoy : hoy.toISOString().split('T')[0],
      login_id: sessionStorage.getItem('USUA_ID'),
      fecha: hoy.toISOString().split('T')[0],
      acti_alta:'',

      tari_id : 0, 
      tari_vigen: '',
      tari_cate: '', 
      tari_cuota_mensual : '',
      tari_inscrip: '',

      filterGrilla: '',
      fetchRegistros: false,
      expSql : '',
      expTitulo:'Reporte de Administración',
      expSubtit: '',
      showModalEdit: false,
      showModalBaja: false,
      showAvisoMod: true,
      showHisto: true, 

      respuestaSp: [],
      respError: '',
      mensajeAlerta: '',
    };
  }

  async getActiCateg() {
    const sql =  `${URL_DB}SEL_ACTI_DD_CATEGORIAS(null)`
    axios.get(sql)
      .then((response) => {
        this.setState({
          actiCateg: response.data[0]
        })
      })
      .catch((error) => console.log(error))
  }

  async getSociCateg() {
    const sql =  `${URL_DB}SEL_SOCIOS_CATEGORIAS('T')`
    axios.get(sql)
      .then((response) => {
        this.setState({
          sociCateg: response.data[0]
        })
      })
      .catch((error) => console.log(error))
  }

  async getMotivosBaja() {
    const sql =  `${URL_DB}SEL_BAJA_MOTIVOS_DD('ARANC')`
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
      await Promise.all([ this.getActiCateg(), this.getSociCateg(), this.getMotivosBaja(), ])
    } catch(e) {
      console.log(e);
    }
  }


  componentDidMount() {

    this.getInicio();
    this.poblarGrilla('N');

  }

  handleChange = (event) => {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({[name]: value}, ()=>{
      if (name==='fecha' && isNaN(this.state.fecha)) 
          { this.poblarGrilla('N') }  // Si cambio fecha muetrp toda la pantalla de uevo
      if (name==='tari_cate' && this.state.cual==='AC') 
          { const valores = this.state.tari_cate.split('#')
            this.setState({ acti_alta: valores[0],
                            tari_cate: valores[1]})  } 
    });



  };

  poblarGrilla = (a_histo) => {
    
    this.setState({showHisto: a_histo==='S'?false:true});

    const sql = `${URL_DB}SEL_TARIFAS('${this.state.fecha}','${a_histo}')`
    axios.get(sql)
    .then((response) => {
      this.setState({
        registros: response.data[0],
        expSql: sql,
        expSubtit: a_histo==='S'?'Historial de aranceles':'Aranceles Vigentes'
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
      regex.test(filtro.acti_deno) || 
      regex.test(filtro.cate_deno) )
  }

  ordenarGrilla = (key) => {
    const registros = ordenarGrilla(key, this.state.registros);

    this.setState({ registros });

  }
  
  handleModalAlta = (a_cual) => {

    this.setState({
      showModalEdit: true,
      cual: a_cual,    // CS=cuota social AC=cuota actividad
      tari_id : 0, 
      tari_vigen: '',
      tari_acti: '', 
      tari_acti_cate: '', 
      tari_cuota_mensual : '',
      tari_inscrip: '',
      tari_liga: '',

      respError: '',
      mensajeAlerta: '',
      mensajeColor: 'N' 
    });
    
  }

  handleModalEdit(regis) {

    if (this.state.showAvisoMod) {
      swal({ 
        title : `Aviso:`,
        text  : 'Si hay un aumento de valor, haga click en boton "+Nuevo Valor ..." la opción de modificar es solo para corregir un error de carga'});
    }

    this.setState({
      showModalEdit: true,
      showAvisoMod : false,
      cual:           regis.tari_acti==='000'?'CS':'AC',
      tari_id :       regis.tari_id, 
      tari_vigen:     regis.vigen_de,
      tari_acti:      regis.tari_acti, 
      tari_acti_cate: regis.tari_acti, 
      tari_cuota_mensual : regis.tari_cuota_mensual,
      tari_inscrip:   regis.tari_inscrip,
      tari_liga:      regis.tari_liga,
      acti_deno:      regis.acti_deno,
      cate_deno:      regis.cate_deno,

      respError: '',
      mensajeAlerta: '',
      mensajeColor: 'N' 
    });
  
  }

  handleModalBaja(regis) {

    this.setState({
      showModalBaja: true,
      cual:           regis.tari_acti==='000'?'CS':'AC',
      tari_id :       regis.tari_id, 
      tari_vigen:     regis.vigen_de,
      tari_acti:      regis.tari_acti, 
      tari_acti_cate: regis.tari_acti, 
      tari_cuota_mensual : regis.tari_cuota_mensual,
      tari_inscrip:   regis.tari_inscrip,
      tari_liga:      regis.tari_liga,
      acti_deno:      regis.acti_deno,
      cate_deno:      regis.cate_deno,
      tari_baja_moti:'',
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

  /*==========================================================================
   Actualizacion : Modificacion a base de datos
  *==========================================================================*/

  handleGrabarTarifa = (event) => {

      if(this.state.tari_vigen.length<8) {
        swal({ 
          title : `Error`,
          text  : 'Complete vigencia',});
      } else {

const sql =  `${URL_DB}AM_TARIFAS(${this.state.login_id},'${this.state.cual}','${this.state.acti_alta}','${this.state.tari_id}',
'${this.state.tari_vigen}','${this.state.tari_acti_cate}',${this.state.tari_cuota_mensual||0},${this.state.tari_inscrip||0},${this.state.tari_liga||0})`  
console.log(sql)
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
                  this.poblarGrilla('N')
              }    
          })
          .catch((error) => {
            alert('ERROR interno API al actualizar BD:'+error+sql)
          })
      
      }
    }
    
    BorrarTarifa = (reg) => {

        const sql =  `${URL_DB}B_TARIFAS(${this.state.login_id},'${this.state.cual}','${this.state.tari_id}',
        '${this.state.tari_baja_moti}','${encodeURIComponent(this.state.baja_motivo)}')`;
  
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
                  this.poblarGrilla('N');
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

    const registrosFiltrados = this.filtrarDatos();
    const respError = this.state.respError;

    return(
      <div>        
       
        <Container  fluid="true">
          <Row>
            <Col xs={2} style={{fontSize:"22px"}}>
                <b>Aranceles</b>
            </Col>
            <Col xs={2}>
              <Form.Group>
                <Form.Control type="date" name="fecha" value={this.state.fecha} onChange={this.handleChange}
                                        style={{ fontWeight: "bold" }}/>
              </Form.Group>
            </Col>
{ this.state.showHisto &&
<>
            <Col xs={3}>

      { this.state.lee_mod==='M' 
          ?     <>
                <Button variant="primary" size="sm"
                        onClick={() => {this.handleModalAlta('CS')}} >+ Nuevo Valor Social
                </Button>
                <Button variant="primary" size="sm"
                        onClick={() => {this.handleModalAlta('AC')}} >+ Nuevo valor Actividad
                </Button>
                </>
          :    <Button variant="outline-danger" size="sm" disabled>Solo Lectura</Button>
      }   
            </Col>
</>}
            <Col xs={1}>
  { this.state.showHisto &&
                <Button variant="secondary" size="sm"
                        onClick={() => {this.poblarGrilla('S')}}> <FaGlasses/> Val Hist
                </Button>
  }
   { !this.state.showHisto &&
                <Button variant="secondary" size="sm"
                        onClick={() => {this.poblarGrilla('N')}}> <FaGlasses/> Reset
                </Button>
  }
            </Col>
            <Col xs={2}>
              <Form.Group>
                <FormControl type="text" name="buscar" placeholder="Texto a filtrar" className="mr-sm-2" 
                        onChange={(e) => { this.setState({ filterGrilla: e.target.value })} } /> 
              </Form.Group>
            </Col>
            <Col xs={1}>
                <Button  variant='outline-warning' size='sm' onClick={() => {this.setState({ showhelp : true}) } } > 
                Ayuda
                </Button>
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
              <Table bordered hover size="sm" id="data_table">
                <thead className="Grilla-header">
                <tr>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('tari_id')}>
                      #ID</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('acti_deno')}>
                      Concepto</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('cate_deno')}>
                      Categoria</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('vigen')}>
                      Vig desde</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('mensual')}>
                      Cuota mensual</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('inscrip')}>
                      Inscripción</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('liga')}>
                      Liga anual</Button>
                  </th>
                  <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {
                  this.state.fetchRegistros && 'Cargando...'
                }
                {
                  registrosFiltrados.map((regis,i) => {
                    return (
                      <tr key={i} style={{ backgroundColor:regis.color_row }}>
                        <td>{`#${regis.tari_id}`}</td>
                        <td>{regis.acti_deno}</td>
                        <td>{regis.cate_deno}</td>
                        <td style={{ textAlign:"center"}}>{regis.vigen}</td>
                        <td style={{ textAlign:"right"}}>{regis.tari_cuota_mensual}</td>
                        <td style={{ textAlign:"right"}}>{regis.tari_inscrip}</td>
                        <td style={{ textAlign:"right"}}>{regis.tari_liga}</td>
  { regis.histo==='N' && this.state.lee_mod==='M' &&            
                        <td>
                        <Button variant="primary" size="sm" 
                              onClick={() => this.handleModalEdit(regis)}>
                                <FaRegEdit /></Button>
                          <Button variant="danger" size="sm" 
                              onClick={() => this.handleModalBaja(regis)}>
                                <FaTrashAlt /></Button>
                        </td>
    }
  { regis.histo==='S' &&    
                        <td>{regis.ulog_fecha_hora}</td>
    }
  { regis.histo==='S' &&    
                        <td>{regis.ulog_acciones}</td>
    }
                      </tr>  
                    ) 
                  }) 
                }
                </tbody>
              </Table>
            </Col>
          </Row>
        </Container>



        <Modal show={this.state.showModalEdit} onHide={this.handleModalExit} dialogClassName="modal-40" >
          <Modal.Header closeButton>
            <Modal.Title>
            {this.state.tari_id ===0 ? `Nuevo Valor para ${this.state.cual==='CS'?'Cuota Social':'Actividad'} ` : `Editar Valor actual ID# ${this.state.tari_id}` }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
  { this.state.tari_id===0 && this.state.cual==='CS' &&
                <Col md={6}>                
                  <FormGroup>
                  <select className="form-control" name="tari_acti_cate" value={this.state.tari_acti_cate} 
                        onChange={this.handleChange} >
                        { this.state.tari_cate==='' &&  // Cuando esta vacio ponemos un reg de 'Seleccion' para que haga el change
                                      <option key={'0'} value={''} disabled >( Seleccione categ )</option>
                      }
                        { this.state.sociCateg.map((cat) => { 
                            return (
                                    <option key={cat.cate_codi} 
                                            value={cat.cate_codi}> {cat.cate_deno}</option>
                                    ) 
                          }) }
                    </select>
                  </FormGroup>
                  </Col>
  }
  { this.state.tari_id===0 && this.state.cual==='AC' &&
                <Col md={6}>                
                  <FormGroup>
                  <select className="form-control" name="tari_cate" value={this.state.tari_cate} 
                        onChange={this.handleChange} >
                        { this.state.tari_cate==='' &&  // Cuando esta vacio ponemos un reg de 'Seleccion' para que haga el change
                                      <option key={'0'} value={''} disabled >( Seleccione categ )</option>
                      }
                        { this.state.actiCateg.map((cat,i) => { 
                            return (
                                    <option key={i} 
                                            value={`${cat.cata_acti}#${cat.cata_acti_cate}`}> {`${cat.acti_deno} : ${cat.cata_acti_cate}`}</option>
                                    ) 
                          }) }
                    </select> 
                  </FormGroup>
                  </Col>
  }

                </Row>
                <Row>
{ this.state.tari_id!==0  &&
                  <Col>
                     <b>{this.state.tari_cate_deno}</b>
                  </Col>
  }
                </Row>
                <Row> 
                  <Col md={6}> 
                    <Form.Group>
                      <Form.Label>Vigente desde</Form.Label>
                      <Form.Control type="date" name="tari_vigen" value={this.state.tari_vigen}
                                    onChange={this.handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={6}> 
                    <Form.Group>
                      <Form.Label>Valor cuota mensual</Form.Label>
                      <Form.Control type="number" name="tari_cuota_mensual" value={this.state.tari_cuota_mensual}
                                    onChange={this.handleChange} />
                    </Form.Group>
                  </Col>
                </Row>
                <Row> 
                  <Col md={6}> 
                  </Col>
                  <Col md={6}> 
  {this.state.cual==='CS' &&          
                    <Form.Group>
                      <Form.Label>Valor Inscripción</Form.Label>
                      <Form.Control type="number" name="tari_inscrip" value={this.state.tari_inscrip}
                                    onChange={this.handleChange} />
                    </Form.Group>
  }
   {this.state.cual==='AC' &&          
                    <Form.Group>
                      <Form.Label>Valor anual Liga</Form.Label>
                      <Form.Control type="number" name="tari_liga" value={this.state.tari_liga}
                                    onChange={this.handleChange} />
                    </Form.Group>
  }
                  </Col>
                </Row>
                <br />
                <Row>
                    <Col>
                      <Button variant="success" size="sm" onClick={this.handleGrabarTarifa}>
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
            </Form>
          </Modal.Body>
        </Modal>



        <Modal show={this.state.showModalBaja} onHide={() =>{this.setState({showModalBaja:false})}} dialogClassName="modal-40">
          <Modal.Header closeButton style={{ backgroundColor: "#ff6666" }}>
            <Modal.Title>
            {`Eliminar registro de Valor para ${this.state.cual==='CS'?'Cuota Social':'Actividad'} ` }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <Form>
            <Row>
              <Col>
                <b>{`${this.state.acti_deno} => ${this.state.cate_deno}`}</b>
              </Col>
            </Row>
            <br />
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Seleccione motivo de baja</Form.Label>
                  <select className="form-control" name="tari_baja_moti" value={this.state.tari_baja_moti}
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
                          onClick={() => {this.BorrarTarifa('B')}}>
                    Eliminar Registro Arancel
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

export default AdmiTari;
