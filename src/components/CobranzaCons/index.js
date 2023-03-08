import React from 'react';
import { URL_DB } from './../../constants';
import axios from 'axios';
import { Table, Row, Col, Container, Button, Form, FormControl, Modal, Alert } from 'react-bootstrap';
import exportToCSV from '../../utils/functions/export-excel';
import ConcepRecibo from '../ConcepRecibo';
import Recibo from '../Recibo';
import swal from 'sweetalert';
import printJS from 'print-js';
import ordenarGrilla from './../../utils/functions/ordenar-grilla';
import { DiDatabase } from "react-icons/di";
import { FaDownload } from "react-icons/fa";
import '../../pages/stylePages.css';

class CobranzaCons extends React.Component {
  constructor(props) {
    super(props);

    var currentdate = new Date();

    this.state = {
      lee_mod : props.lee_mod,
      opcion: 'soc',
      opcRepo: [{ opc:'soc', deno:'Por socio/grupo'},
                { opc:'rec', deno:'Por N° Recibo'},
                { opc:'fec', deno:'Entre fechas'},
                { opc:'anu', deno:'Anular Recibo'}],
      desde : currentdate.toISOString().split('T')[0],
      hasta : currentdate.toISOString().split('T')[0],
      socio : 0,
      punto : 0,
      reci  : 0,
      detalle:[],
      showRecibo: false,
      handleShowRecibo: false,
      showAnula: false,
      handleShowAnula: false,
      ret_reci_punto:'',
      ret_reci_reci:'',
      confirmaBaja:'',

      registros: [],
      motivosBaja: [],
      login_id: sessionStorage.getItem('USUA_ID'),

      filterGrilla: '',
      fetchRegistros: false,
      expSql : '',
      expTitulo:'Reporte de Recibos',
      expSubtit: '',
      respuestaSp: [],
      respError: '',
      mensajeAlerta: '',
    };

  }

  componentDidMount() {

    const sql =  `${URL_DB}SEL_BAJA_MOTIVOS_DD('RECIB')`
    axios.get(sql)
    .then((response) => {
      this.setState({
        motivosBaja: response.data[0]
      })
    })
    .catch((error) => console.log(error))
  
    //this.poblarGrilla();
   
  }

  /*==========================================================================
   Utilidades de filtros y sort para la grilla ppal 
  *==========================================================================*/
  filtrarDatos() {
    const escapedValue = this.state.filterGrilla.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedValue, 'i');
    return this.state.registros.filter(filtro => 
      regex.test(filtro.reci_punto) || 
      regex.test(filtro.reci_reci) ||
      regex.test(filtro.reci_fecha) ||
      regex.test(filtro.reci_anulado) ||
      regex.test(filtro.tot_valor) ||
      regex.test(filtro.socios) )
  }

  ordenarGrilla = (key) => {
    const registros = ordenarGrilla(key, this.state.registros);

    this.setState({ registros });
  }
  
  /*==========================================================================
   Completo datos de grilla principal 
  *==========================================================================*/
  poblarGrilla = () => {

    this.setState({registros: []});

    if (this.state.opcion==='fec') {
        if(this.state.desde.length<8) {
          swal({ 
            title : `Consulta entre fechas `,
            text  : ' complete fecha <desde>',});
        }
        if(this.state.hasta.length<8) {
          swal({ 
            title : `Consulta entre fechas `,
            text  : ' complete fecha <hasta>',});
        }
        if(this.state.hasta < this.state.desde) {
          swal({ 
            title : `Consulta entre fechas `,
            text  : ' <hasta> no puede ser menor que <desde>',});
        } else {

            const sql = `${URL_DB}SEL_COBRANZA_CONS('fec',0,0,0,'${this.state.desde}','${this.state.hasta}')`
            axios.get(sql)
              .then((response) => {
                this.setState({
                  registros: response.data[0],
                  expSql: sql,
                  expSubtit: `Recibos entre ${this.state.desde} y ${this.state.hasta}`
                })
              })
              .catch((error) => console.log(error))
              .finally(() => {
                this.setState({ fetchRegistros: false })
              })
  
        }
    } else {

        const sql = `${URL_DB}SEL_COBRANZA_CONS('${this.state.opcion}',${this.state.socio},${this.state.punto},${this.state.reci},'','')`
        axios.get(sql)
          .then((response) => {
            this.setState({
              registros: response.data[0],
              expSql: sql,
              expSubtit: this.state.opcRepo.find(f => f.opc===this.state.opcion).deno
            },() => {
              if (this.state.opcion==='anu' && this.state.registros[0].es_ultimo==='N')
                swal({ 
                  title : `Error al intentar anular Recibo`,
                  text  : 'Solo se puede anular el ultimo Recibo, en el mismo dia de la emisión del mismo',});
            })
          })
          .catch((error) => console.log(error))
          .finally(() => {
            this.setState({ fetchRegistros: false })
          })
    }  
  }

  /* Opciones del menu, trato hombres, mujeres o todos */
  handleChange = (event) => {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({[name]: value}, () => { 
      /*this.poblarGrilla(this.state.opcion)*/ 
    });

  };
  
  handleShowRecibo = (a_reg) => {

    this.setState({ showRecibo : true,
                    ret_reci_punto :a_reg.reci_punto,
                    ret_reci_reci : a_reg.reci_reci
                 })
  }

  printForm = () => {
    printJS({ printable:"recibo",
            type:"html",
            targetStyles:['*'],
            header : 'Recibo oficial'

    })
  }

  handleShowAnula = (a_reg) => {

    this.setState({ showAnula : true,
                    reci_baja_moti : '',
                    ret_reci_punto :a_reg.reci_punto,
                    ret_reci_reci : a_reg.reci_reci
                 })
  }
/*==========================================================================
   Actualizacion : Baja / Rehab
*==========================================================================*/
handleAnular = () => {

  const sql = `${URL_DB}B_RECIBO(${this.state.login_id},${this.state.ret_reci_punto},${this.state.ret_reci_reci},
  '${this.state.reci_baja_moti}')`;
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
                showAnula :false,
            })
            this.poblarGrilla();
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
    //const mensajeAlerta = this.state.mensajeAlerta;
 

    return(
      <div>        
       
        <Container  fluid="true">
          <Row>
            <Col xs={2} style={{fontSize:"22px"}}>
                <b>Recibos</b>
            </Col>
            <Col xs={2}>
                <Form.Group>
                <Form.Label><b>Seleccione consulta</b></Form.Label>
                  <select className="form-control" name="opcion" onChange={this.handleChange} >
                      <option key={1}  value={'soc'}> Por socio/grupo </option>
                      <option key={2}  value={'rec'}> Por N° Recibo </option>
                      <option key={3}  value={'fec'}> Entre fechas </option>
                      <option key={4}  value={'anu'}> Anular Recibo </option>
                  </select>
                </Form.Group>
            </Col> 
          { this.state.opcion==='soc' &&
            <Col xs={1}>
              <Form.Group>
                <Form.Label><b>Socio</b></Form.Label>
                <Form.Control type="text" name="socio" value={this.state.socio} 
                              onChange={this.handleChange}
                              style={{ fontWeight: "bold" }} />
              </Form.Group>
            </Col>
          }
          { this.state.opcion==='fec' &&          
            <Col xs={2}>
              <Form.Group>
                <Form.Label><b>Desde</b></Form.Label>
                <Form.Control type="date" name="desde" value={this.state.desde} onChange={this.handleChange}
                                        style={{ fontWeight: "bold" }} />
              </Form.Group>
            </Col>
          }
          { this.state.opcion==='fec' &&  
            <Col xs={2}>
              <Form.Group>
                <Form.Label><b>Hasta</b></Form.Label>
                <Form.Control type="date" name="hasta" value={this.state.hasta} onChange={this.handleChange}
                                        style={{ fontWeight: "bold" }} />
              </Form.Group>
            </Col>
          }
          { (this.state.opcion==='rec' || this.state.opcion==='anu') &&   
            <Col xs={1}>
              <Form.Group>
                <Form.Label><b>Punto</b></Form.Label>
                <Form.Control type="number" name="punto" value={this.state.punto} onChange={this.handleChange}
                                        style={{ fontWeight: "bold" }} />
              </Form.Group>
            </Col>
          }
          { (this.state.opcion==='rec' || this.state.opcion==='anu') && 
            <Col xs={2}>
              <Form.Group>
                <Form.Label><b>N°Recibo</b></Form.Label>
                <Form.Control type="number" name="reci" value={this.state.reci} onChange={this.handleChange}
                                        style={{ fontWeight: "bold" }} />
              </Form.Group>
            </Col>
          }
            <Col xs={1}>
                <Button  variant='outline-primary' size='sm' onClick={this.poblarGrilla} > 
                <DiDatabase />Consultar
                </Button>
            </Col>
            <Col xs={2}>
              <Form.Group>
              <Form.Label><b>Buscar en esta grilla</b></Form.Label>
                <FormControl type="text" name="buscar" placeholder="Texto a filtrar" className="mr-sm-2" 
                        onChange={(e) => { this.setState({ filterGrilla: e.target.value })} } /> 
              </Form.Group>      
           </Col>
           <Col>
           { this.state.lee_mod==='L' &&
                <Button variant="outline-danger" size="sm" disabled>Solo Lectura</Button>
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
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('reci_punto')}>
                      Punto</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('reci_reci')}>
                      Recibo</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('reci_fecha')}>
                      Fecha</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('reci_anulado')}>
                      Anulado</Button>
                  </th>
                  <th>
                      Concepto
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('tot_valor')}>
                      Importe</Button>
                  </th>
                  <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('socios')}>
                      Socio/Grupo</Button>
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
                      <tr key={i}>
                        <td style={{ textAlign: "center" }}>{regis.reci_punto}</td>
                        <td style={{ textAlign: "right" }}>{regis.reci_reci}</td>
                        <td>{regis.reci_fecha}</td>
                        <td style={{ backgroundColor: regis.color_anu }}>{regis.reci_anulado}</td>
                        <td style={{ width: "530px" }}> 
                          <ConcepRecibo deta={regis.reit_deno}/> 
                        </td>
                        <td style={{ textAlign: "right" }}>{regis.tot_valor}</td>
                        <td>{regis.socios}</td>
                        <td>
        {   regis.es_ultimo ==='S' && this.state.lee_mod==='M' &&
                          <Button variant="danger" onClick={()=>{this.handleShowAnula(regis)}}>
                            Anular Recibo</Button>
        }
                          <Button variant="secondary" onClick={()=>{this.handleShowRecibo(regis)}}>
                            Imprim</Button>
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




        < Modal show={this.state.showRecibo}  onHide={() => { this.setState({ showRecibo : false}) } } 
                dialogClassName="modal-60">
          <Modal.Header closeButton>
          <Modal.Title>
              {`Recibo ${this.state.ret_reci_punto} - ${this.state.ret_reci_reci}`}
          </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
            <Button variant="primary"    onClick={()=>{ this.printForm() }}>
              Imprimir Recibo</Button>    
            <Button variant="secondary"  onClick={()=>{  this.setState({ showRecibo : false}) }}>
              Cerrar</Button>  
            <br/>
            <Recibo punto={this.state.ret_reci_punto}
                    reci={this.state.ret_reci_reci} 
                  />
            </Form>
          </Modal.Body>
        </Modal>



        <Modal show={this.state.showAnula} onHide={() =>{this.setState({showAnula:false})}} dialogClassName="modal-40">
          <Modal.Header closeButton style={{ backgroundColor: "#ff6666" }}>
            <Modal.Title>
              {`Anular Recibo ${this.state.ret_reci_punto}-${this.state.ret_reci_reci}`}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <Form>
            <Row> 
              <Col>
                <Form.Group>
                  <Form.Label>Seleccione motivo de baja</Form.Label>
                  <select className="form-control" name="reci_baja_moti" value={this.state.reci_baja_moti}
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
            <br />
            <Row>
              <Col xs={8} style={{textAlign: "right"}}>
                  <Button variant="danger" size="sm"
                          onClick={this.handleAnular}>
                    Eliminar Recibo
                  </Button>
                  <Button variant="secondary" size="sm" 
                          onClick={() => {this.setState({showAnula:false})}}>
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

export default CobranzaCons;
