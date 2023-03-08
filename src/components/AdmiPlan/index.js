import React from 'react';
import { URL_DB } from './../../constants';
import axios from 'axios';
import { Table, Row, Col, Container, Button, Form, FormControl, Modal, FormGroup, Alert } from 'react-bootstrap';
import exportToCSV from '../../utils/functions/export-excel';
import swal from 'sweetalert';
import { FaTimes, FaCheck, FaRegEdit, FaTrashAlt, FaUserCheck, FaWhmcs, FaDownload } from "react-icons/fa";
import ordenarGrilla from './../../utils/functions/ordenar-grilla'
import '../../pages/stylePages.css';

class AdmiPlan extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lee_mod : props.lee_mod,
      registros: [],
      login_id: sessionStorage.getItem('USUA_ID'),
      cuen_id:0,
      subc_id:0,
      deno :'',
      cuen_debi_credi :'',
      habilitada:'',

      showModalEdit: false,
      expSql : '',
      expTitulo:'Reporte de Administración',
      expSubtit: '',
      filterGrilla: '',
      fetchRegistros: false,
      respuestaSp: [],
      respError: '',
      mensajeAlerta: '',
    };

  }

  handleChange = (event) => {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });

  };
 
  poblarGrilla = () => {

    const sql = `${URL_DB}SEL_CAJA_CUENTAS_SUBCTA_ABM()`
    axios.get(sql)
    .then((response) => {
      this.setState({
        registros: response.data[0],
        expSql: sql,
        expSubtit: 'Conceptos y Subconcep para adm Club y Actividades'

      });   
    })
    .catch((error) => console.log(error));

  }

  componentDidMount() {

    this.poblarGrilla()

  }

  /*==========================================================================
   Utilidades de filtros y sort para la grilla ppal 
  *==========================================================================*/
  filtrarDatos() {
    const escapedValue = this.state.filterGrilla.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedValue, 'i');
    return this.state.registros.filter(filtro => 
      regex.test(filtro.cuen_deno) || 
      regex.test(filtro.subc_deno) )
  }

  ordenarGrilla = (key) => {
    const registros = ordenarGrilla(key, this.state.registros);

    this.setState({ registros });
  }
  
  handleModalEdit(regis,a_cuen_subc) {

    this.setState({
      showModalEdit: true,
      cuen_subc: a_cuen_subc,
      tituloModal: a_cuen_subc ==='C' ? `Editar Cuenta ID#${regis.cuen_id}` : `Editar Subcuenta ID#${regis.subc_id}` ,
      cuen_id: regis.cuen_id,
      subc_id: regis.subc_id,
      deno :a_cuen_subc==='C'?regis.cuen_deno:regis.subc_deno,
      cuen_debi_credi :regis.cuen_debi_credi,
      habilitada:regis.subc_habilitada,

      respError: '',
      mensajeAlerta: '',
      mensajeColor: 'N' 
    });
  
  }

  handleModalAlta(a_cuen_subc,a_cuen_id,a_cuen_deno) {

    this.setState({
      showModalEdit: true,
      cuen_subc: a_cuen_subc,
      tituloModal: a_cuen_subc ==='C' ? `Nuevo Concepto` : `Nuevo SubConcepto para ${a_cuen_deno}` ,
      cuen_id: a_cuen_subc ==='C'?0:a_cuen_id,
      subc_id: 0,
      deno :'',
      cuen_debi_credi :'D',
      habilitada:'S',

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

handleGrabar = (a_cuen_subc) => {

    if (a_cuen_subc==='C') {

      const sql =  `${URL_DB}AM_CAJA_CUENTAS(${this.state.login_id},${this.state.cuen_id},'${encodeURIComponent(this.state.deno)}','${this.state.cuen_debi_credi}')`     
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

    } else {

      const sql =  `${URL_DB}AM_CAJA_CUENTAS_SUB(${this.state.login_id},${this.state.subc_id},${this.state.cuen_id},'${encodeURIComponent(this.state.deno)}','${this.state.habilitada}')`  
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
  }
  
  handleBorrar = (a_cuen_subc, a_cuen_id, a_subc_id) => {

    swal({ 
      title : `Eliminar ${a_cuen_subc==='C'?'Concepto':'SubConcepto'} `,
      text  : ' confirma esta acción ?',
      icon : "warning",  
      buttons : ['No','Si'], 
      }).then( respuesta => {
        if ( respuesta===true ) {
      
          const sql =  `${URL_DB}B_CAJA_CUENTAS_SUBCTA(${this.state.login_id},'${a_cuen_subc}',
          ${a_cuen_id},${a_subc_id})`;
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
              
        } else {
            this.setState({
              mensajeAlerta : 'No se aplico baja',
              mensajeColor  : 'red',
            })
        }

      });

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
            <Col xs={4} style={{fontSize:"22px"}}>
                <b>Definir conceptos</b>
            </Col>
            <Col xs={3}>
              <Form.Group>
                <FormControl type="text" name="buscar" placeholder="Texto a filtrar" className="mr-sm-2" 
                        onChange={(e) => { this.setState({ filterGrilla: e.target.value })} } /> 
              </Form.Group>
            </Col>
            <Col xs={2}>

     { this.state.lee_mod==='M' 
          ?    <Button variant="primary" size="sm" onClick={() => {this.handleModalAlta('C',0,'')}}>
                  + Concepto
                </Button>
          :    <Button variant="outline-danger" size="sm" disabled>Solo Lectura</Button>
      }   
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
              <Table striped bordered hover size="sm" id="data_table">
                <thead className="Grilla-header">
                <tr>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('cuen_id')}>
                      #Cta</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('subc_id')}>
                      #Subc</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('cuen_club_acti')}>
                      Maneja</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('cuen_deno')}>
                      Concepto</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('subc_deno')}>
                      SubConcepto</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('debi_credi')}>
                      Signo</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('cuen_es_sys')}>
                      Uso</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('subc_habilitada')}>
                      Habilitado</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('canti')}>
                      Cant Mov</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('cuen_alta_f')}>
                      Alta</Button>
                  </th>
                  <th>Acc Concep</th>
                  <th>Acc Subc</th>
                </tr>
                </thead>
                <tbody>
                {
                  this.state.fetchRegistros && 'Cargando...'
                }
                {
                  registrosFiltrados.map((regis,i) => {
                    return (
                      <tr key={i}>
                        <td style={{ backgroundColor:regis.db_color }}>{regis.cuen_id}</td>
                        <td style={{ backgroundColor:regis.db_color }}>{regis.subc_id}</td>
                        <td style={{ backgroundColor: regis.cuen_club_acti==='C'?regis.db_color:"#cce6ff", textAlign:"center" }}>
                            {regis.cuen_club_acti==='A' && regis.subc_id===0 && 'Activ' }
                            {regis.cuen_club_acti==='C' && regis.subc_id===0 && 'Club' }
                        </td>
                        <td style={{ backgroundColor:regis.db_color, fontWeight:'bold' }}>{regis.cuen_deno}</td>
                        <td style={{ backgroundColor:regis.db_color }}>{regis.subc_deno}</td>
                        <td style={{ backgroundColor:regis.db_color }}>{regis.debi_credi}</td>
                        <td style={{ backgroundColor: regis.cuen_es_sys==='N'?regis.db_color:"#ff0000", textAlign:"center" }}>
                            {regis.cuen_es_sys==='S' && <FaWhmcs /> }
                            {regis.cuen_es_sys==='N' && <FaUserCheck /> }
                        </td>
                        <td style={{ backgroundColor:regis.db_color, textAlign:"center" }}>
                            {regis.subc_habilitada==='S' && <FaCheck style={{ color: "#006600" }}></FaCheck> }
                            {regis.subc_habilitada==='N' && <FaTimes style={{ color: "red" }}></FaTimes> }
                        </td>
                        <td style={{ textAlign:"center" }}>{regis.canti}</td>
                        <td>{regis.cuen_alta_f}</td>
                        <td>
                  { regis.subc_id===0 && regis.cuen_es_sys==='N' && this.state.lee_mod==='M' &&
                  <>
                            <Button variant="primary" size="sm" onClick={() => this.handleModalEdit(regis,'C')}>
                              <FaRegEdit /> 
                            </Button>                      
                            <Button variant="primary" size="sm" onClick={() => {this.handleModalAlta('S',regis.cuen_id, regis.cuen_deno)}}>
                              + SubC
                            </Button>
                  </>}
                  { regis.subc_id===0 && regis.canti===0 && regis.cuen_es_sys==='N' && regis.canti_subc===0 && this.state.lee_mod==='M' &&
                            <Button variant="danger" size="sm"
                                    onClick={() => {this.handleBorrar('C',regis.cuen_id, 0)}} >
                              <FaTrashAlt />
                            </Button>
                  }
                        </td>
                        <td>
                  { regis.subc_id>0 && regis.cuen_es_sys==='N' && this.state.lee_mod==='M' &&
                 
                            <Button variant="primary" size="sm" onClick={() => this.handleModalEdit(regis,'S')}>
                              <FaRegEdit /> 
                            </Button>
                  }
                  { regis.subc_id>0 && regis.canti===0 && regis.cuen_es_sys==='N' && this.state.lee_mod==='M' &&
                            <Button variant="danger" size="sm" 
                                    onClick={() => {this.handleBorrar('S',0, regis.subc_id)}} >
                              <FaTrashAlt />
                            </Button>
                  }
                  { regis.cuen_es_sys==='S' &&
                            <p>No se altera, propio del sistema</p>
                  }
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



        <Modal show={this.state.showModalEdit} onHide={this.handleModalExit} dialogClassName="modal-40" >
          <Modal.Header closeButton>
            <Modal.Title>
                  {this.state.tituloModal}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Col md={7}>      
                  <FormGroup>
                    Denominación
                    <FormControl  type="text" name={'deno'} value={this.state.deno}
                      onChange={this.handleChange}
                    />
                  </FormGroup>
                </Col>
                <Col md={5}>    
    { this.state.cuen_subc==='C' && 
                  <FormGroup>
                    Es Ingreso / Egreso
                    <select className="form-control" name="cuen_debi_credi" value={this.state.cuen_debi_credi} 
                        onChange={this.handleChange} >
                        <option key={1} value={'D'}> Debita</option>
                        <option key={2} value={'A'}> Acredita</option>
                    </select>
                  </FormGroup>
    }
    { this.state.cuen_subc==='S' && 
                  <FormGroup>
                    Esta habilitado para cargar
                    <select className="form-control" name="habilitada" value={this.state.habilitada} 
                        onChange={this.handleChange} >
                        <option key={1} value={'S'}>Si</option>
                        <option key={2} value={'N'}>No</option>
                    </select>
                  </FormGroup>
    }
                </Col>
              </Row>
                <br />
                <Row>
                    <Col>
                      <Button variant="success" size="sm" onClick={() => {this.handleGrabar(this.state.cuen_subc)}} >
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


      </div>
    );
  }
}

export default AdmiPlan;
