import React  from 'react';
import { URL_DB } from './../../constants';
import axios from 'axios';
import { Table, Row, Col, Container, Button, Form, FormControl, Alert } from 'react-bootstrap';
import exportToCSV from '../../utils/functions/export-excel';
import Notifications from '../../components/Notifications';
import ordenarGrilla from './../../utils/functions/ordenar-grilla'
import '../../pages/stylePages.css';
import { FaGlasses, FaDownload, FaDollarSign } from "react-icons/fa";
import swal from 'sweetalert';

class CobranzaLiqui extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lee_mod : props.lee_mod,
      consGenera : props.consGenera,
      registros : [],
      regLiqui:[],
      actividades:[],
      motivosBaja:[],
      fetchLiquida:false,
      generandoLiqui:false,
      fetchRegistros:false,
      expSql : '',
      expTitulo:'Liquidaciones internas',
      expSubtit: '',
      expSqlDeta : '',
      buscarGrillaValue: '',
      confirmaBaja:'',
      login_id: sessionStorage.getItem('USUA_ID'),
      acti : '000',
 
      msg_liqui:'Seleccione Actividad para generar liquidación',
      ok_liqui: false,
   
      filterGrilla: '',
      respuestaSp: [],
      respError: '',
      mensajeAlerta: '',
    };
  
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
  
  async getLiquiActual() {

    if (this.state.consGenera==='G') {

      const sql = `${URL_DB}A_CAJA_LIQUI_INTERNA(${this.state.login_id},'${this.state.acti}','C')`
      axios.get(sql)
        .then((response) => {
          this.setState({
            msg_liqui: response.data[0][0].mensaje,
            ok_liqui: response.data[0][0].respuesta==='OK'?true:false,
          })
        })
        .catch((error) => console.log(error))
    }
  }

  async getLiquiHisto() {

    this.setState({ fetchLiquida: true })

    const sql = `${URL_DB}SEL_CAJA_LIQUI_INTERNA('${this.state.acti}')`
    axios.get(sql)
      .then((response) => {
        this.setState({
          regLiqui: response.data[0],
          expSql: sql,
          expSubtit: this.state.actividades.find(f => f.acti_acti===this.state.acti).acti_deno
        })
      })
      .catch((error) => console.log(error))
      .finally(() => {
        this.setState({ fetchLiquida: false })
      })

  }

 
  async getliquiActi() {
    try{
      await Promise.all([ this.getLiquiActual(), this.getLiquiHisto() ])
    } catch(e) {
      console.log(e);
    }
  }

  componentDidMount() {
    this.getActividades()
  }
  
  /*==========================================================================
   Utilidades de filtros y sort para la grilla ppal 
  *==========================================================================*/
  filtrarDatos() {
    const escapedValue = this.state.filterGrilla.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedValue, 'i');
    return this.state.registros.filter(filtro => 
      regex.test(filtro.lqit_id) || 
      regex.test(filtro.recibo) || 
      regex.test(filtro.lqit_valor) ||
      regex.test(filtro.lqit_soci_codi) || 
      regex.test(filtro.apenom) || 
      regex.test(filtro.lqit_mes_cuota) || 
      regex.test(filtro.lqit_acti_cate) ||
      regex.test(filtro.concepto) )
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
    }, () => { if (name==='acti') { this.getliquiActi() }; } );

  };
  
  poblarGrilla = (a_reg) => {

    this.setState({ fetchRegistros: true })
    const sql =  `${URL_DB}SEL_CAJA_LIQUI_INTERNA_ITEMS('${a_reg.liqu_id}')`;
    axios.get(sql)
    .then((response) => {
      this.setState({
        registros: response.data[0],
        expSqlDeta :sql,
        expSubtit: this.state.actividades.find(f => f.acti_acti===this.state.acti).acti_deno + `: #Liquidacion ${a_reg.liqu_id}`
      });
    })
    .finally(() => {
      this.setState({ fetchRegistros: false })
    })  
    
  }

  /*==========================================================================
   Actualizacion : Modificacion usuario y sus accesos
  *==========================================================================*/

  handleGenerarLiqui = (event) => {

  swal({ 
    title : 'Generacion de Liquidación, este proceso no es reversible' ,
    text  : ' confirma esta acción ?',
    icon : "warning",  
    buttons : ['No','Si'], 
    }).then( respuesta => {
      if ( respuesta===true ) {
 
        this.setState({ generandoLiqui :true });

        const sql = `${URL_DB}A_CAJA_LIQUI_INTERNA(${this.state.login_id},'${this.state.acti}','G')`;
        axios.get(sql)
        .then((response) => {
              this.setState({
                respuestaSp: response.data[0],
                expSql: sql,
                expSubtit: this.state.actividades.find(f => f.acti_acti===this.state.acti).acti_deno
              })
              var obj = this.state.respuestaSp[0];
              this.setState({
                respError : obj.respuesta
              })

              if (this.state.respError==='OK') {

                  this.setState({
                      mensajeAlerta : 'Registrado correctamente',
                      mensajeColor  : 'green',
                      generandoLiqui : false
                  })
                  this.getliquiActi();
              } else {
                  alert('ERROR interno API al actualizar BD:'+this.state.respError)
              }   
          })
          .catch((error) => {
            alert('ERROR interno API al actualizar BD:'+error)
          })

        } else {
          this.setState({
            mensajeAlerta : 'No se genereró Liquidación',
            mensajeColor  : 'red',
          })
      }

    });       
  }
/*
  BorrarMovimiento = (reg) => {
    const sql =  `${URL_DB}B_CAJA_LIQUI_INTERNA(${this.state.login_id},'${this.state.movi_id}',
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
              //this.poblarGrilla();
          }    
      })
      .catch((error) => {
        alert('ERROR interno API al actualizar BD:'+error+' SQL:'+sql)
      })
  }
*/
  /*==========================================================================
   RENDER
  *==========================================================================*/
  render() {  

    //const respError = this.state.respError;
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
            <Col xs={3} style={{fontSize:"22px"}}>
                <b>{this.state.consGenera==='C'?'Consulta Liquidación Interna':'Genera Liquid Interna'}</b>
            </Col>
            <Col md={2} >

                <Form.Group>
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

              </Col>
              <Col xs={3}>
                <Form.Group>
                <FormControl type="text" name="buscar" placeholder="Texto a filtrar" className="mr-sm-2" 
                        onChange={(e) => { this.setState({ filterGrilla: e.target.value })} } /> 
              </Form.Group>
            </Col>
            <Col xs={1}>
              {/*
            <Button  variant='outline-warning' size='sm' onClick={() => {this.setState({ showhelp : true}) } } > 
             Ayuda
            </Button>*/}
           </Col> 
            <Col xs={1}>
  { this.state.regLiqui.length > 0 &&
                <Button variant='outline-success' size='sm' 
                        onClick={(e) => exportToCSV(this.state.expTitulo,this.state.expSubtit,this.state.expSql) } > 
                        <FaDownload /> Excel
                </Button>
  }
            </Col>
            <Col xs={1}>
  { this.state.registros.length > 0 &&
                <Button variant='outline-success' size='sm' 
                        onClick={(e) => exportToCSV(this.state.expTitulo,this.state.expSubtit,this.state.expSqlDeta) } > 
                        <FaDownload /> Excel
                </Button>
  }
            </Col>

          </Row>
          <br />
{ this.state.consGenera==='G' &&
<>
          <Row>
            <Col md={7}>
                <Alert variant="primary" style={{ height:"30px", padding:"6px" }}>
                  {this.state.msg_liqui}
                </Alert>
            </Col>
            <Col md={2}>
            { this.state.lee_mod==='M' 
                ?    <Button variant="primary" size="sm" disabled={!this.state.ok_liqui} onClick= {this.handleGenerarLiqui}>
                      <FaDollarSign />Generar Lquidación
                      </Button>
                :    <Button variant="outline-danger" size="sm" disabled>Solo Lectura</Button>
            }                  
            </Col>
            <Col md={3}>
                { this.state.generandoLiqui && 'Generando liquidacion...' }
            </Col>
          </Row>
  </>}
          <Row>
            {/* ======= grila de liquidaciones ==========*/}
            <Col md={6}>
              <Table  bordered hover size="sm" id="data_table"  
                      style={{border: "2px solid #aaa"}} >
              <thead className="Grilla-header-primary">
                <tr>
                  <th>#ID</th>
                  <th>Fecha</th>
                  <th>Beneficiario</th>
                  <th>Total</th>
                  <th>Cantid</th>
                  <th>Alta</th>
                  <th>Acciones</th>
                </tr>
                </thead>
          {
              this.state.fetchLiquida && 'Cargando...'
          }
                <tbody>
                {
                  this.state.regLiqui.map((regis, i) => {
                    return (
                      <tr key={i}>
                        <td style={{textAlign: "center"}}>{regis.liqu_id}</td>
                        <td style={{textAlign: "center"}}>{regis.liqu_fecha}</td>
                        <td style={{textAlign: "left"}}>{regis.cpro_razon}</td>
                        <td style={{textAlign: "center"}}>{regis.total}</td>
                        <td style={{textAlign: "center"}}>{regis.canti}</td>
                        <td style={{textAlign: "left"}}>{regis.alta}</td>
                        <td>
         {/* this.state.consGenera==='G' &&
                          <Button variant="danger" size="sm" 
                                  onClick={() => this.handleModalBaja(regis)}>
                                <FaTrashAlt /></Button>
                    */}
                          <Button variant="secondary" size="sm" 
                                  onClick={() => this.poblarGrilla(regis)}>
                                <FaGlasses /></Button>
                        </td>
                      </tr>  
                    ) 
                  }) 
                }
                </tbody>
        { this.state.regLiqui.length>0 &&      
                <tfoot className="Grilla-header">
                  <td />
                  <td style={{textAlign:"center"}}>{`${this.state.regLiqui.length} Reg`}</td>
                  <td colSpan={6} />
                </tfoot>
        }
              </Table>
            </Col>

            {/* ======= grila detalle derecha ==========*/}
            <Col md={6}>
            <Table striped bordered hover size="sm" id="data_table">
              <thead className="Grilla-header">
              <tr>
                <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('lqit_id')}>
                    #ID</Button>
                </th>
                <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('recibo')}>
                    Recibo</Button>
                </th>
                <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('lqit_valor')}>
                    Monto</Button>
                </th>
                <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('lqit_soci_codi')}>
                    #Socio</Button>
                </th>
                <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('apenom')}>
                    Apellido nombre</Button>
                </th>
                <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('lqit_mes_cuota')}>
                    Mes Cuota</Button>
                </th>
                <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('lqit_acti_cate')}>
                    Categ</Button>
                </th>
                <th><Button variant="dark" size="sm" onClick={() => this.ordenarGrilla('concepto')}>
                    Concep</Button>
                </th>
              </tr>
              </thead>
          {
                this.state.fetchRegistros && 'Cargando...'
          }
              <tbody>
              {
                registrosFiltrados.map((regis, i) => {
                  return (
                    <tr key={i}>
                      <td style={{textAlign: "center"}}>{regis.lqit_id}</td>
                      <td style={{textAlign: "left"}}>{regis.recibo}</td>
                      <td style={{textAlign: "right"}}>{regis.lqit_valor}</td>
                      <td style={{textAlign: "center"}}>{regis.lqit_soci_codi}</td>
                      <td style={{textAlign: "left"}}>{regis.apenom}</td>
                      <td style={{textAlign: "center"}}>{regis.lqit_mes_cuota}</td>
                      <td style={{textAlign: "left"}}>{regis.lqit_acti_cate}</td>
                      <td style={{textAlign: "left"}}>{regis.concepto}</td>
                    </tr>  
                  ) 
                }) 
              }
              </tbody>
        { registrosFiltrados.length>0 &&      
                <tfoot className="Grilla-header">
                  <td />
                  <td colSpan={6} style={{textAlign:"center"}}>{`${registrosFiltrados.length} Reg`}</td>
                  <td  />
                </tfoot>
        }
            </Table>
          </Col>

          </Row>
        </Container>


  

      </div>
    );
  }
}

export default CobranzaLiqui;
