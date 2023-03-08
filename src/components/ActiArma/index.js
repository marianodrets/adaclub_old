import React  from 'react';
import { URL_DB } from '../../constants';
import axios from 'axios';
import { Row, Col, Container, Table, Button, Form, Alert, Modal } from 'react-bootstrap';
import Notifications from '../Notifications';
import AutosuggestsComponent from '../Autosuggest/index.js';
import '../Autosuggest/autosuggest.css';
import {  FaTimes, FaCheck, FaThumbsUp, FaGlasses, FaTrashAlt, FaUserPlus } from "react-icons/fa";
import swal from 'sweetalert';
import '../../pages/stylePages.css';
import ShowLogElemento from '../ShowLogElemento';
import exportToCSV from '../../utils/functions/export-excel';
import Ayuda from '../../components/Ayuda';
import { FaDownload } from "react-icons/fa";

class ActiArma extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lee_mod : props.lee_mod,
      registros: [],
      filterGrilla:'',
      grilla:[],
      actividades:[],
      categorias:[],
      categActi:[],
      login_id: sessionStorage.getItem('USUA_ID'),
      tempo_d: '',
      tempo_f: '',
      acti: '',
      color_s:'',

      autosuggestValue: '',
      soci_codi: '',
      soci_nombre: '',
      soci_edad: '',
      showModalAlta: false,
      fetchRegistros: false,
      expSql : '',
      expTitulo:'Armado temporada actual',
      expSubtit: '',
      showLogElem: false,
      showhelp: false,

      respuestaSp: '',
      respError: '',
      mensajeAlerta: '',
    };
   
  }

  async getActiCategorias() {

    const sql =  `${URL_DB}SEL_ACTI_DD_CATEGORIAS(null)`; 
    axios.get(sql)
    .then((response) => {
        this.setState({
          categorias: response.data[0]
        })
    })      
    .catch((error) => console.log(error))
  }
 
  async getActividades() {

    const sql = `${URL_DB}SEL_ACTI_TEMPO_DD_INSERT(${this.state.login_id})`
    axios.get(sql)
    .then((response) => {
      this.setState({
        actividades: response.data[0]
      },() => {
        if(this.state.actividades.length>0){
          this.setState({ tempo_d : this.state.actividades[0].tempo_d,
                          tempo_f : this.state.actividades[0].tempo_f  
                        })
        }
      });    
    })
    .catch((error) => console.log(error));
  }
       
  async getInicio() {
    try{
      await Promise.all([ this.getActividades(), this.getActiCategorias() ])
    } catch(e) {
      console.log(e);
    } finally {

    }
  }

  filtrarDatos = () => {
    const escapedValue = this.state.filterGrilla.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedValue, 'i');
    return this.state.registros.filter(filtro => 
   
      regex.test(filtro.soci_ape) || 
      regex.test(filtro.soci_nom) ||
      regex.test(filtro.soci_id) )
  }
  

  componentDidMount = () => {
    this.getInicio()
  }

  poblarGrilla = (a_acti) => {

    this.setState({ fetchRegistros: true,
                    acti : a_acti,
                    categActi: this.state.categorias.filter(function(elem){
                                return elem.cata_acti === a_acti;
                                })
                  });

    const sql =  `${URL_DB}SEL_ACTI_TEMPORADA_ARMA_RS('${this.state.tempo_f}','${a_acti}')`;
    axios.get(sql)
    .then((response) => {
      this.setState({
        grilla: response.data[0],
        expSql: sql,
        expSubtit: this.state.actividades.find(f => f.acti_acti===this.state.acti).acti_deno
      },() => {
        if(this.state.grilla.length>0){
          this.setState({ color_s : this.state.grilla[0].color_s})
        }
      });
    })      
    .catch((error) => console.log(error))
    .finally(() => {
      this.setState({ fetchRegistros: false })
    })

  }


  modiGrilla = (a_i, a_col, a_val) => {
    
    const grilla = this.state.grilla

    grilla[a_i].aux_modi = 'S'  // Marco el reg para ser enviado en grabar

    if(a_val==='N' || a_val==='S') {
        
        if (a_col==='01') { grilla[a_i].t_mes01       = a_val==='S'?'N':'S';
                            grilla[a_i].t_mes01_col_f = a_val==='S'?'':this.state.color_s;
                            grilla[a_i].t_mes01_col   = a_val==='S'?'black':'white';};
        if (a_col==='02') { grilla[a_i].t_mes02       = a_val==='S'?'N':'S';
                            grilla[a_i].t_mes02_col_f = a_val==='S'?'':this.state.color_s;
                            grilla[a_i].t_mes02_col   = a_val==='S'?'black':'white';};
        if (a_col==='03') { grilla[a_i].t_mes03       = a_val==='S'?'N':'S';
                            grilla[a_i].t_mes03_col_f = a_val==='S'?'':this.state.color_s;
                            grilla[a_i].t_mes03_col   = a_val==='S'?'black':'white';};
        if (a_col==='04') { grilla[a_i].t_mes04       = a_val==='S'?'N':'S';
                            grilla[a_i].t_mes04_col_f = a_val==='S'?'':this.state.color_s;
                            grilla[a_i].t_mes04_col   = a_val==='S'?'black':'white';};
        if (a_col==='05') { grilla[a_i].t_mes05       = a_val==='S'?'N':'S';
                            grilla[a_i].t_mes05_col_f = a_val==='S'?'':this.state.color_s;
                            grilla[a_i].t_mes05_col   = a_val==='S'?'black':'white';};
        if (a_col==='06') { grilla[a_i].t_mes06       = a_val==='S'?'N':'S';
                            grilla[a_i].t_mes06_col_f = a_val==='S'?'':this.state.color_s;
                            grilla[a_i].t_mes06_col   = a_val==='S'?'black':'white';};
        if (a_col==='07') { grilla[a_i].t_mes07       = a_val==='S'?'N':'S';
                            grilla[a_i].t_mes07_col_f = a_val==='S'?'':this.state.color_s;
                            grilla[a_i].t_mes07_col   = a_val==='S'?'black':'white';};
        if (a_col==='08') { grilla[a_i].t_mes08       = a_val==='S'?'N':'S';
                            grilla[a_i].t_mes08_col_f = a_val==='S'?'':this.state.color_s;
                            grilla[a_i].t_mes08_col   = a_val==='S'?'black':'white';};
        if (a_col==='09') { grilla[a_i].t_mes09       = a_val==='S'?'N':'S';
                            grilla[a_i].t_mes09_col_f = a_val==='S'?'':this.state.color_s;
                            grilla[a_i].t_mes09_col   = a_val==='S'?'black':'white';};
        if (a_col==='10') { grilla[a_i].t_mes10       = a_val==='S'?'N':'S';
                            grilla[a_i].t_mes10_col_f = a_val==='S'?'':this.state.color_s;
                            grilla[a_i].t_mes10_col   = a_val==='S'?'black':'white';};
        if (a_col==='11') { grilla[a_i].t_mes11       = a_val==='S'?'N':'S';
                            grilla[a_i].t_mes11_col_f = a_val==='S'?'':this.state.color_s;
                            grilla[a_i].t_mes11_col   = a_val==='S'?'black':'white';};
        if (a_col==='12') { grilla[a_i].t_mes12       = a_val==='S'?'N':'S';
                            grilla[a_i].t_mes12_col_f = a_val==='S'?'':this.state.color_s;
                            grilla[a_i].t_mes12_col   = a_val==='S'?'black':'white';};
        if (a_col==='LG') { grilla[a_i].t_paga_liga   = a_val==='S'?'N':'S';
                            grilla[a_i].t_liga_col_f  = a_val==='S'?'':this.state.color_s;
                            grilla[a_i].t_liga_col    = a_val==='S'?'black':'white';};
      }

      if(a_col==='PP') {
        grilla[a_i].tema_porcen_pago   = a_val;
      }

      if(a_col==='CT') {
        grilla[a_i].tema_acti_cate   = a_val;
      }

      this.setState({
        grilla, 
      })

  }
 
  handleModalAlta = () => {

    this.setState({
          showModalAlta: true,
          soci_codi : '',
          soci_apenom : '',
          soci_edad : ''
        })
  }

  handleChangeSugg_soci_codi = (suggestion) => {

    this.setState({
      soci_codi : suggestion.codigo,
      soci_nombre: suggestion.apenom,
      soci_edad: suggestion.edad,
    });

  };

  handleShowLog = (regis) => {
    
    this.setState({
      showLogElem : true,
      soci_codi   : regis.soci_codi,
    });
  
  }
  /*==========================================================================
   Actualizacion : Modificacion global de grilla
  *==========================================================================*/
  handleGrabarGrilla = (event) => {
    event.preventDefault();

   var grilla_json = this.state.grilla.filter(function(fila){
    return fila.aux_modi === 'S';
  }).map((item) => { 
    var obj = {}
    obj.tema_id = item.tema_id;
    obj.soci_codi = item.soci_codi;
    obj.acti_cate = item.tema_acti_cate;
    obj.porcen_pago = item.tema_porcen_pago;
    obj.paga_liga = item.t_paga_liga;
    obj.tirameses = item.t_mes01+item.t_mes02+item.t_mes03+item.t_mes04+item.t_mes05+item.t_mes06+item.t_mes07+item.t_mes08+item.t_mes09+item.t_mes10+item.t_mes11+item.t_mes12;
    return ( obj )
  })  


    const sql = `${URL_DB}AM_ACTI_TEMPORADA_ARMA(${this.state.login_id},'${this.state.tempo_f}',
'${this.state.acti}','${String(JSON.stringify(grilla_json))}')` 
    axios.get(sql)
      .then((response) => {
        this.setState({
          respuestaSp: response.data[0][0].respuesta
        },() => {             
            if (this.state.respuestaSp==='OK') {
                this.setState({
                    mensajeAlerta : 'Registrado correctamente',
                    mensajeColor  : 'green',
                    respError     : '',
                    showModalAlta : false
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
      })

  
  }
 /*==========================================================================
   Abro modal para ALTA : Cargo solo socio y luego retrieve de todo 
  *==========================================================================*/
  handleGrabarNuevo = (a_soci_codi) => {
  
    const sql =  `${URL_DB}A_ACTI_TEMPO_SOCIOS(${this.state.login_id},'${this.state.tempo_f}','${this.state.acti}',${a_soci_codi})`  
    axios.get(sql)
    .then((response) => {
      this.setState({
        respuestaSp: response.data[0][0].respuesta
      },() => {             
          if (this.state.respuestaSp==='OK') {
              this.setState({
                  mensajeAlerta : 'Registrado correctamente',
                  mensajeColor  : 'green',
                  respError     : '',
                  showModalAlta : false
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
    })

  }

/*==========================================================================
   Abro modal para ALTA : Copio la temporada anterior en la nueva 
  *==========================================================================*/
   handleCopiarTemporada = (a_opc) => {
  
    const sql =  `${URL_DB}A_ACTI_TEMPO_SOCIOS_AMASIVA(${this.state.login_id},'${a_opc}','${this.state.tempo_f}','${this.state.acti}')`  
    axios.get(sql)
    .then((response) => {
      this.setState({
        respuestaSp: response.data[0][0].respuesta
      },() => {             
          if (this.state.respuestaSp==='OK') {
              this.setState({
                  mensajeAlerta : 'Registrado correctamente',
                  mensajeColor  : 'green',
                  respError     : '',
                  showModalAlta : false
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
    })

  }

 /*==========================================================================
   Abro modal para BAJA : Cargo solo valores 
  *==========================================================================*/
  handleGrabarEliminar = (reg) => {

    swal({ 
        title : `Eliminar a #${reg.soci_codi}:${reg.apenom} de la nómina`,
        text  : ' confirma esta acción ?',
        icon : "warning",  
        buttons : ['No','Si'], 
        }).then( respuesta => {
          if ( respuesta===true ) {
        
            const sql =  `${URL_DB}B_ACTI_TEMPO_SOCIOS(${this.state.login_id},${reg.tema_id},${reg.soci_codi})`      
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
  
  }
  /*==========================================================================
   RENDER
  *==========================================================================*/

  render() {  

    //const registrosFiltrados = this.filtrarDatos();
    const respError = this.state.respError;
    const mensajeAlerta = this.state.mensajeAlerta;
    const mensajeColor = this.state.mensajeColor;

    return(
      <div>        
        {mensajeAlerta.length >1 ? <Notifications mensaje={mensajeAlerta}
                                                  mensajeColor={mensajeColor}
                                    /> : '' }

        <Container fluid="true">
          <Form>
            <Row>
              <Col md={2} style={{fontSize:"22px"}}>
                  <b>{`Arma T-${this.state.tempo_d}`}</b>
              </Col>
              <Col md={2} >
                <Form.Group>
                <select className="form-control" name="acti" value={this.state.acti} 
                    style={{fontWeight: "bold" }}
                    onChange={(e) => {this.poblarGrilla(e.target.value)}} >
                    { this.state.acti==='' &&  // Cuando esta vacio ponemos un reg de 'Seleccion' para que haga el change
                                  <option key={'0'} value={''} disabled >( Seleccione Actividad )</option>
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
              <Col xs={2}>
  { this.state.acti!=='' &&
                  <Button variant="primary" size="sm" 
                          onClick={this.handleModalAlta} ><FaUserPlus /> Socio
                  </Button>
  }
              </Col>  
              <Col xs={2}>
{ this.state.lee_mod==='M' && this.state.acti!=='' &&
                  <Button variant="success" size="sm" onClick={this.handleGrabarGrilla}>
                    Grabar Grilla</Button>
  }
{ this.state.lee_mod==='L' && this.state.acti!=='' &&
                  <Button variant="outline-danger" size="sm" disabled>Solo Lectura</Button>
  }
                  <Button variant="secondary" size="sm" onClick={() => { this.poblarGrilla(this.state.acti) } }>
                    Cancelar</Button>
              </Col>
              <Col xs={2}>
                    <Alert key="1" variant="danger" show={respError.length >3 ? true : false} >
                    {respError}</Alert>
              </Col>
              <Col xs={1}>
                <Button  variant='outline-warning' size='sm' onClick={() => {this.setState({ showhelp : true}) } } > 
                Ayuda
                </Button>
              </Col>
              <Col xs={1}>
  { this.state.grilla.length > 0 &&
                <Button variant='outline-success' size='sm' 
                        onClick={(e) => exportToCSV(this.state.expTitulo,this.state.expSubtit,this.state.expSql) } > 
                        <FaDownload /> Excel
                </Button>
  }
            </Col>
            </Row>
            <Row>
              <Col>
              <Table  bordered hover size="sm" id="data_table">
              <thead className="Grilla-header">
                <tr>
                  <th>#Soc</th>
                  <th>Apelido y nombre</th>
                  <th>Edad</th>
                  <th>Categ</th>
                  <th style={{textAlign: "center"}}>Ene</th>
                  <th style={{textAlign: "center"}}>Feb</th>
                  <th style={{textAlign: "center"}}>Mar</th>
                  <th style={{textAlign: "center"}}>Abr</th>
                  <th style={{textAlign: "center"}}>May</th>
                  <th style={{textAlign: "center"}}>Jun</th>
                  <th style={{textAlign: "center"}}>Jul</th>
                  <th style={{textAlign: "center"}}>Ago</th>
                  <th style={{textAlign: "center"}}>Sep</th>
                  <th style={{textAlign: "center"}}>Oct</th>
                  <th style={{textAlign: "center"}}>Nov</th>
                  <th style={{textAlign: "center"}}>Dic</th>
                  <th>% Pago</th>
                  <th>Liga</th>
                  <th>Ingreso</th>
                  <th>Baja</th>
                  <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {
                  this.state.fetchRegistros && 'Cargando...'
                }
                {  this.state.grilla.map((lis,i) => {
  
                      return (
                        <tr key={i}>
                          <td>{`#${lis.soci_codi}`}</td>
                          <td style={{backgroundColor: lis.color_b}}>{lis.apenom}</td>
                          <td style={{backgroundColor: lis.color_b, textAlign : "center"}}>{lis.edad}</td>
                          <td style={{width: "120px", backgroundColor: lis.color_b}}>
                          <select className="form-control" name="acti" value={lis.tema_acti_cate}  
                                  onChange={(e) => this.modiGrilla(i,'CT',e.target.value)} >
                        { lis.tema_acti_cate==='' &&  // Cuando esta vacio ponemos un reg de 'Seleccion' para que haga el change
                                      <option key={'0'} value={''} disabled >(Selecc)</option>
                        }
                          { this.state.categActi.map((act) => { 
                              return (
                                      <option key={act.cata_acti_cate} 
                                              value={act.cata_acti_cate}
                                      > {act.cata_acti_cate}
                                      </option>
                                      ) 
                            }) }
                          </select>
                          </td>
                          <td style={{backgroundColor: lis.t_mes01_col_f, color:lis.t_mes01_col, textAlign: "center", cursor: "pointer"}}
                                      onClick={() => this.modiGrilla(i,'01',lis.t_mes01)}>
                              { lis.t_mes01 === 'S' && <FaCheck /> }
                              { lis.t_mes01 === 'N' && <FaTimes /> }
                              { lis.t_mes01 === 'P' && <FaThumbsUp /> }
                          </td>
                          <td style={{backgroundColor: lis.t_mes02_col_f, color:lis.t_mes02_col, textAlign: "center", cursor: "pointer"}}
                                      onClick={() => this.modiGrilla(i,'02',lis.t_mes02)}>
                              { lis.t_mes02 === 'S' && <FaCheck /> }
                              { lis.t_mes02 === 'N' && <FaTimes /> }
                              { lis.t_mes02 === 'P' && <FaThumbsUp /> }
                          </td>
                          <td style={{backgroundColor: lis.t_mes03_col_f, color:lis.t_mes03_col, textAlign: "center", cursor: "pointer"}}
                                      onClick={() => this.modiGrilla(i,'03',lis.t_mes03)}>
                              { lis.t_mes03 === 'S' && <FaCheck /> }
                              { lis.t_mes03 === 'N' && <FaTimes /> }
                              { lis.t_mes03 === 'P' && <FaThumbsUp /> }
                          </td>
                          <td style={{backgroundColor: lis.t_mes04_col_f, color:lis.t_mes04_col, textAlign: "center", cursor: "pointer"}}
                                      onClick={() => this.modiGrilla(i,'04',lis.t_mes04)}>
                              { lis.t_mes04 === 'S' && <FaCheck /> }
                              { lis.t_mes04 === 'N' && <FaTimes /> }
                              { lis.t_mes04 === 'P' && <FaThumbsUp /> }
                          </td>
                          <td style={{backgroundColor: lis.t_mes05_col_f, color:lis.t_mes05_col, textAlign: "center", cursor: "pointer"}}
                                      onClick={() => this.modiGrilla(i,'05',lis.t_mes05)}>
                              { lis.t_mes05 === 'S' && <FaCheck /> }
                              { lis.t_mes05 === 'N' && <FaTimes /> }
                              { lis.t_mes05 === 'P' && <FaThumbsUp /> }
                          </td>
                          <td style={{backgroundColor: lis.t_mes06_col_f, color:lis.t_mes06_col, textAlign: "center", cursor: "pointer"}}
                                      onClick={() => this.modiGrilla(i,'06',lis.t_mes06)}>
                              { lis.t_mes06 === 'S' && <FaCheck /> }
                              { lis.t_mes06 === 'N' && <FaTimes /> }
                              { lis.t_mes06 === 'P' && <FaThumbsUp /> }
                          </td>
                          <td style={{backgroundColor: lis.t_mes07_col_f, color:lis.t_mes07_col, textAlign: "center", cursor: "pointer"}}
                                      onClick={() => this.modiGrilla(i,'07',lis.t_mes07)}>
                              { lis.t_mes07 === 'S' && <FaCheck /> }
                              { lis.t_mes07 === 'N' && <FaTimes /> }
                              { lis.t_mes07 === 'P' && <FaThumbsUp /> }
                          </td>
                          <td style={{backgroundColor: lis.t_mes08_col_f, color:lis.t_mes08_col, textAlign: "center", cursor: "pointer"}}
                                      onClick={() => this.modiGrilla(i,'08',lis.t_mes08)}>
                              { lis.t_mes08 === 'S' && <FaCheck /> }
                              { lis.t_mes08 === 'N' && <FaTimes /> }
                              { lis.t_mes08 === 'P' && <FaThumbsUp /> }
                          </td>
                          <td style={{backgroundColor: lis.t_mes09_col_f, color:lis.t_mes09_col, textAlign: "center", cursor: "pointer"}}
                                      onClick={() => this.modiGrilla(i,'09',lis.t_mes09)}>
                              { lis.t_mes09 === 'S' && <FaCheck /> }
                              { lis.t_mes09 === 'N' && <FaTimes /> }
                              { lis.t_mes09 === 'P' && <FaThumbsUp /> }
                          </td>
                          <td style={{backgroundColor: lis.t_mes10_col_f, color:lis.t_mes10_col, textAlign: "center", cursor: "pointer"}}
                                      onClick={() => this.modiGrilla(i,'10',lis.t_mes10)}>
                              { lis.t_mes10 === 'S' && <FaCheck /> }
                              { lis.t_mes10 === 'N' && <FaTimes /> }
                              { lis.t_mes10 === 'P' && <FaThumbsUp /> }
                          </td>
                          <td style={{backgroundColor: lis.t_mes11_col_f, color:lis.t_mes11_col, textAlign: "center", cursor: "pointer"}}
                                      onClick={() => this.modiGrilla(i,'11',lis.t_mes11)}>
                              { lis.t_mes11 === 'S' && <FaCheck /> }
                              { lis.t_mes11 === 'N' && <FaTimes /> }
                              { lis.t_mes11 === 'P' && <FaThumbsUp /> }
                          </td>
                          <td style={{backgroundColor: lis.t_mes12_col_f, color:lis.t_mes12_col, textAlign: "center", cursor: "pointer"}}
                                      onClick={() => this.modiGrilla(i,'12',lis.t_mes12)}>
                              { lis.t_mes12 === 'S' && <FaCheck /> }
                              { lis.t_mes12 === 'N' && <FaTimes /> }
                              { lis.t_mes12 === 'P' && <FaThumbsUp /> }
                          </td>

                          <td>
                            <input  type="number" value={lis.tema_porcen_pago}
                                    style={{width: "60px", backgroundColor: lis.porcen_color_b}}
                              onChange={(e) => this.modiGrilla(i,'PP',e.target.value)}></input>
                          </td>
                          
                          <td style={{backgroundColor: lis.t_liga_col_f, color:lis.t_liga_col, textAlign: "center", cursor: "pointer"}}
                                      onClick={() => this.modiGrilla(i,'LG',lis.t_paga_liga)}>
                              { lis.t_paga_liga === 'S' && <FaCheck /> }
                              { lis.t_paga_liga === 'N' && <FaTimes /> }
                              { lis.t_paga_liga === 'P' && <FaThumbsUp /> }
                          </td>
                          <td>{lis.soci_ingre_f}</td>
                          <td style={{backgroundColor: lis.color_b}}>
                              {lis.soci_baja_f}</td>
                          <td>
                           <Button variant="secondary" 
                                  onClick={() => this.handleShowLog(lis)}>
                                <FaGlasses />
                            </Button>
                  { this.state.lee_mod==='M' &&
                            <Button variant="danger" 
                                  onClick={() => this.handleGrabarEliminar(lis)}>
                                <FaTrashAlt />
                            </Button>
                  }
                          </td>
                        </tr> 
                      ) 
                    }) 
                  }  
                  </tbody>
        { this.state.grilla.length>0 &&      
                <tfoot className="Grilla-header">
                  <td />
                  <td style={{textAlign:"center"}}>{`${this.state.grilla.length} Reg`}</td>
                  <td colSpan={19} />
                </tfoot>
        }
                </Table>
              </Col>
            </Row>
          </Form>
        </Container>



        <Modal show={this.state.showModalAlta} onHide={()=>{this.setState({ showModalAlta : false})}} >
          <Modal.Header closeButton>
            <Modal.Title>
              Agregar persona a la nómina
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <Form>
          <Row>
              <Col xs={6}>
              <Form.Group>
                  <AutosuggestsComponent  tabla={'socio'}
                                    placeholder={'Digite Apellido y nombre'} 
                                    denoValue={this.state.autosuggestValue}
                                    onSubmitFunction={this.handleChangeSugg_soci_codi}
                                  />
                  </Form.Group>  

              </Col>
            </Row>
            <br />
            <Row>
              <Col xs={6}>
                <Form.Group>
                  <Form.Label>Nombre</Form.Label>
                  {this.state.soci_nombre}
                </Form.Group>
              </Col>    
              <Col xs={6}>
                <Form.Group>
                  <Form.Label>Edad</Form.Label>
                  {this.state.soci_edad} 
                </Form.Group>
              </Col>          
      
            </Row>
            <br />
            <Row>
                <Col xs={8} style={{textAlign: "right"}}>
                  <Button variant="primary" size="sm" 
                          onClick={() => {this.handleGrabarNuevo(this.state.soci_codi)}}>
                    Agregar por socio
                  </Button>
                  <Button variant="secondary" size="sm" 
                          onClick={()=>{this.setState({ showModalAlta : false})}}>
                    Cancelar
                  </Button>
                </Col>
            </Row>
            <Row>
              <br />
            </Row>
    { this.state.grilla.length===0 &&  
      <> 
            <Row>
            <hr size="8px" color="black" />
            (*) Estas opciones de alta masiva, solo salen cuando la grilla esta vacía
            </Row>
            <Row>
                <Col xs={6}>
                <Button variant="primary" size="sm" 
                          onClick={() => {this.handleCopiarTemporada('T')}}>
                    Copiar toda la temporada anterior</Button>                
                </Col>             
                <Col xs={6}>
                  <Button variant="primary" size="sm" 
                          onClick={() => {this.handleCopiarTemporada('A')}}>
                    Todos los socios vig con esta actividad en "socios"</Button>
                </Col>
            </Row>
      </>}
          </Form>
          </Modal.Body>
        </Modal>




        < Modal show={this.state.showLogElem} 
                onHide={() => { this.setState({ showLogElem : false}) } } 
                dialogClassName="modal-60">
            <ShowLogElemento  ulog_clave={'SOCIOS'} 
                              ulog_id_number={this.state.soci_codi}
                              />
        </Modal>


        < Modal show={this.state.showhelp} onHide={() => { this.setState({ showhelp : false}) } } dialogClassName="modal-90">
            <Ayuda clave={'config-actividad'}/>
        </Modal>


      </div>
    );
  }
}

export default ActiArma;
