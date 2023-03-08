import React from 'react';
import { URL_DB } from './../../constants';
import axios from 'axios';
import { Table, Row, Col, Container, Button, Form, FormControl, Alert, Modal, FormGroup } from 'react-bootstrap';
import exportToCSV from '../../utils/functions/export-excel';
import { FaRegEdit, FaTrashAlt, FaRedoAlt, FaDownload } from "react-icons/fa";
import ordenarGrilla from './../../utils/functions/ordenar-grilla';
import swal from 'sweetalert';
import '../../pages/stylePages.css';

class ActiAbm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lee_mod : props.lee_mod,
      registros: [],
      proveedores:[],
      login_id: sessionStorage.getItem('USUA_ID'),

      filterGrilla:'',
      showModalEdit: false,
      fetchRegistros: false,
      expSql : '',
      expTitulo:'Reporte de Administración',
      expSubtit: '',
      respuestaSp: [],
      respError: '',
      mensajeAlerta: '',
    };

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
      await Promise.all([ this.getProveedores() ])
    } catch(e) {
      console.log(e);
    }
  }

  poblarGrilla = () => {

    const sql = `${URL_DB}SEL_ACTIVIDADES_ABM()`
    axios.get(sql)
    .then((response) => {
      this.setState({
        registros: response.data[0],
        expSql: sql,
        expSubtit: 'Actividades Vigentes y dadas de baja'
      });   
    })
    .catch((error) => console.log(error));

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
      regex.test(filtro.acti_acti ) || 
      regex.test(filtro.acti_deno) || 
      regex.test(filtro.cpro_razon) )
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
    });

  };
 
  handleModalEdit = (regis) => {

    this.setState({
      showModalEdit: true,
      acti_id : regis.acti_id, 
      acti_acti: regis.acti_acti,
      acti_deno: regis.acti_deno, 
      acti_aranceles: regis.acti_aranceles,
      acti_cpro_id: regis.acti_cpro_id,

      respError: '',
      mensajeAlerta: '',
      mensajeColor: 'N' 
    });
  
  }

  handleModalAlta = () => {

    this.setState({
      showModalEdit: true,
      acti_id : 0, 
      acti_acti:'',
      acti_deno:'', 
      acti_aranceles:'N',
      acti_cpro_id:0,

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

handleGrabar = (e) => {

  const sql =  `${URL_DB}AM_ACTIVIDADES(${this.state.login_id},${this.state.acti_id},'${this.state.acti_acti}','${encodeURIComponent(this.state.acti_deno)}','${this.state.acti_aranceles}','${this.state.acti_cpro_id}')`     
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


  handleElimRehab = (a_bajReh, a_reg) => {

    swal({
      title: `${a_bajReh==='B'?'Baja':'Rehabilita'} de ${a_reg.acti_deno} `,
      text: `Para confirmar escriba la palabra:"${a_bajReh==='B'?'BAJA':'REHAB'}"`,
      content: 'input',
      button: {
        text:"Grabar",
        closeModal: true
      }       
    }).then((result) => {
        if ((a_bajReh==='B' && result.toUpperCase() ==='BAJA') || (a_bajReh==='R' && result.toUpperCase() ==='REHAB')) {
      
            const sql =  `${URL_DB}B_ACTIVIDADES(${this.state.login_id},'${a_bajReh}','${a_reg.acti_acti}')`      
            axios.get(sql)
            .then((response) => {
                this.setState({
                  respuestaSp: response.data[0][0].respuesta
                },() => {             
                    if (this.state.respuestaSp==='OK') {
                        this.setState({
                            mensajeAlerta : 'Registrado correctamente',
                            mensajeColor  : 'green',
                            respError     : ''
                        })    
                        this.poblarGrilla(this.state.acti);
                    } else {
                      this.setState({
                        respError     : this.state.respuestaSp
                      })    
                    }    
                })
              })
              .catch((error) => {
                alert('ERROR interno API al actualizar BD:'+error)
              });

        } else {
    
          this.setState({
            mensajeAlerta : 'No se aplico baja',
            mensajeColor  : 'red',
          })
        }
  });

/*
    swal("Write something here:", {
      content: "input",
    })
    .then((value) => {
     //swal(`You typed: ${value}`);
      if (value==='BAJA') {
        alert('mariano')
      }
    });
*/
  }
  /*==========================================================================
   RENDER
  *==========================================================================*/

  render() {  

    const registrosFiltrados = this.filtrarDatos();
    const respError = this.state.respError;
    //const mensajeAlerta = this.state.mensajeAlerta;
    //const mensajeColor = this.state.mensajeColor;

    return(
      <div>        
       
        <Container  fluid="true">
          <Row>
            <Col xs={4} style={{fontSize:"22px"}}> 
                <b>Definir Actividades</b>
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
                  + Actividad
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
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('acti_id')}>
                      #ID</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('acti_acti')}>
                      Cod activ</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('acti_deno')}>
                      Denominación</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('acti_aranceles')}>
                      Tiene arancel?</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('cpro_razon')}></Button>
                      #Provee
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('cpro_razon')}></Button>
                      Proveedor
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('prim_tempo')}>
                      Primer temp</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('ult_tempo')}>
                      Ult temp</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('acti_alta_f')}>
                      Alta</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('acti_baja_f')}>
                      Baja</Button>
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
                        <td style={{ backgroundColor:regis.db_color }}>{regis.acti_id}</td>
                        <td style={{ backgroundColor:regis.db_color }}>{regis.acti_acti}</td>
                        <td style={{ backgroundColor:regis.db_color, fontWeight:'bold' }}>{regis.acti_deno}</td>
                        <td style={{ backgroundColor:regis.db_color }}>{regis.acti_aranceles}</td>
                        <td>{regis.acti_cpro_id!==null?regis.acti_cpro_id:''}</td>
                        <td>{regis.cpro_razon}</td>
                        <td style={{ backgroundColor:regis.db_color }}>{regis.prim_tempo}</td>
                        <td style={{ backgroundColor:regis.db_color }}>{regis.ult_tempo}</td>
                        <td>{regis.acti_alta_f}</td>
                        <td>{regis.acti_baja_f}</td>  
                        <td>
                  { regis.vigen==='S' && this.state.lee_mod==='M' &&
                  <>
                            <Button variant="primary" size="sm" onClick={() => this.handleModalEdit(regis)}>
                              <FaRegEdit /> 
                            </Button>
                            <Button variant="danger" size="sm" onClick={()=>{this.handleElimRehab('B',regis)}}>
                              <FaTrashAlt />
                            </Button>
                  </>}
                  { regis.vigen==='N' && this.state.lee_mod==='M' &&
                            <Button variant="success" size="sm" onClick={()=>{this.handleElimRehab('R',regis)}}>
                              <FaRedoAlt />
                            </Button>
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





        <Modal show={this.state.showModalEdit} onHide={this.handleModalExit} dialogClassName="modal-40">
          <Modal.Header closeButton >
            <Modal.Title>
              {this.state.acti_id===0?'Alta de Actividad':`Modifica Actividad #${this.state.acti_id}`}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <Form>
            <Row>
              <Col md={3}>
                  <FormGroup>
                    Cod interno
                    <FormControl  type="text" name={'acti_acti'} value={this.state.acti_acti}
                                  onChange={this.handleChange}
                    />
                  </FormGroup>
              </Col>
              <Col md={9}>
                  <FormGroup>
                    Denominación
                    <FormControl  type="text" name={'acti_deno'} value={this.state.acti_deno}
                                  onChange={this.handleChange}
                    />
                  </FormGroup>
              </Col>     
           </Row>
           <Row>
              <Col md={3}>    
                  <FormGroup>
                    Arancel/Temp
                    <select className="form-control" name="acti_aranceles" value={this.state.acti_aranceles} 
                        onChange={this.handleChange} >
                        <option key={1} value={'S'}>Si</option>
                        <option key={2} value={'N'}>No</option>
                    </select>
                  </FormGroup>
              </Col>
              <Col md={9}>
                <FormGroup>
                  Proveedor
                  <select className="form-control" name="acti_cpro_id" value={this.state.acti_cpro_id} 
                        onChange={this.handleChange} >
                        { this.state.acti_cpro_id==='' &&  // Cuando esta vacio ponemos un reg de 'Seleccion' para que haga el change
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
            </Row>
            <br />
            <Row>
              <Col xs={8} style={{textAlign: "right"}}>
                  <Button variant="danger" size="sm" onClick={this.handleGrabar}>
                    Grabar
                  </Button>
                  <Button variant="secondary" size="sm" onClick={this.handleModalExit}>
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

export default ActiAbm;
