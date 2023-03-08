import React  from 'react';
import { URL_DB } from './../../constants';
import axios from 'axios';
import { Table, Row, Col, Container, } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import '../../pages/stylePages.css';


ChartJS.register(ArcElement, Tooltip, Legend);

class CobranEstado extends React.Component {
  constructor(props) {
    super(props);

    const data = {
      labels: ['Cobrado Mes Actual', 'Pend de cobro'],
      datasets: [
        {
          label: '# of Votes',
          data: [50,50],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

    
    this.state = {
        lee_mod : props.lee_mod,
        mesPasado: [],
        mesActual: [],
        pendCobro: [],
        mesPasadoCount:0,
        mesPasadoSum:0,
        mesActualCount:0,
        mesActualSum:0,
        pendCobroCount:0,
        pendCobroSum:0,
        fetchRegistros: false,
        data: data,
        login_id: sessionStorage.getItem('USUA_ID'),
    };

  }


  componentDidMount() {

    this.poblarGrilla();  

  }
  
  poblarGrilla = () => {

    this.setState({ fetchRegistros: true })
  
    const sql = `${URL_DB}SEL_CAJA_ESTADO()`
    axios.get(sql)
    .then((response) => {
        this.setState({ 
          mesPasado : response.data[0].filter((e) => { return e.orden===Number(1)}),
          mesActual : response.data[0].filter((e) => { return e.orden===Number(2)}),
          pendCobro: response.data[0].filter((e) => { return e.orden===Number(3)}),
        },()=>{
            this.setState({
              mesPasadoCount: this.state.mesPasado.length>0?this.state.mesPasado[0].tot_canti:0,
              mesPasadoSum:   this.state.mesPasado.length>0?this.state.mesPasado[0].tot_suma:0,
              mesActualCount: this.state.mesActual.length>0?this.state.mesActual[0].tot_canti:0,
              mesActualSum:   this.state.mesActual.length>0?this.state.mesActual[0].tot_suma:0,
              pendCobroCount: this.state.pendCobro.length>0?this.state.pendCobro[0].tot_canti:0,
              pendCobroSum:   this.state.pendCobro.length>0?this.state.pendCobro[0].tot_suma:0,
            },()=>{
              var data = this.state.data;
              data.datasets[0].data = [this.state.mesActualSum, this.state.pendCobroSum];
              this.setState({ data });
            })
        });
        
    })
    .catch((error) => console.log(error))
    .finally(() => {
    this.setState({ fetchRegistros: false })
    })

  }

  /*==========================================================================
   RENDER
  *==========================================================================*/

  render() {  

    //const respError = this.state.respError;
    //const mensajeAlerta = this.state.mensajeAlerta;
    //const mensajeColor = this.state.mensajeColor;

    return(
      <div>        
      

        <Container  fluid="true">
        
          <Row>
            <Col md={5} style={{fontSize:"22px"}}>
                <b>{`Estado cobranza cuotas`}</b>
            </Col> 
          </Row>
          <br />
          <Row>
            <Col xs={4}>
              <Table  size="sm" id="data_table">
                <thead>
                <tr>
                <th colSpan={4} style={{textAlign:"center"}}>Cobrado Mes Pasado</th>
                </tr>
                <tr>
                  <th>Pago</th>
                  <th>Concepto</th>
                  <th>Cantidad</th>
                  <th>Importe</th>
                </tr>
                </thead>
                <tbody>
                {
                  this.state.mesPasado.map((reg,i) => {
                    return (
                      <tr key={i} style={{ backgroundColor:'' }}>
                        <td style={{ backgroundColor:reg.color_f}}>{reg.mes_d}</td>
                        <td style={{ backgroundColor:reg.color_cs}}>{reg.concep_d}</td>
                        <td style={{ backgroundColor:reg.color_cs, textAlign:"center"}}>{reg.canti}</td>
                        <td style={{ backgroundColor:reg.color_cs, textAlign:"right"}}>{reg.suma}</td>
                      </tr>  
                    ) 
                  }) 
                }
                </tbody>
                <tfoot style={{fontWeight:"bold"}}>
                  <td colSpan={2}>Total Cuota social</td>
                  <td style={{textAlign:"center"}}>{this.state.mesPasadoCount}</td>
                  <td style={{textAlign:"right"}}>{this.state.mesPasadoSum}</td>
                </tfoot>
              </Table>
            </Col>

            <Col xs={4}>
              <Table size="sm" id="data_table">
                <thead>
                <tr>
                <th colSpan={4} style={{textAlign:"center"}}>Cobrado Mes Actual</th>
                </tr>
                <tr>
                  <th>Pago</th>
                  <th>Concepto</th>
                  <th>Cantidad</th>
                  <th>Importe</th>
                </tr>
                </thead>
                <tbody>
                {
                  this.state.mesActual.map((reg,i) => {
                    return (
                      <tr key={i} style={{ backgroundColor:'' }}>
                        <td style={{ backgroundColor:reg.color_f}}>{reg.mes_d}</td>
                        <td style={{ backgroundColor:reg.color_cs}}>{reg.concep_d}</td>
                        <td style={{ backgroundColor:reg.color_cs, textAlign:"center"}}>{reg.canti}</td>
                        <td style={{ backgroundColor:reg.color_cs, textAlign:"right"}}>{reg.suma}</td>
                      </tr>  
                    ) 
                  }) 
                }
                </tbody>
                <tfoot style={{fontWeight:"bold"}}>
                  <td colSpan={2}>Total Cuota social</td>
                  <td style={{textAlign:"center"}}>{this.state.mesActualCount}</td>
                  <td style={{textAlign:"right"}}>{this.state.mesActualSum}0</td>
                </tfoot>
              </Table>
            </Col>

            <Col xs={4}>
              <Row>
                <Col>
                <Table  size="sm" id="data_table">
                    <thead>
                    <tr>
                    <th colSpan={3} style={{textAlign:"center"}}>Pendiente de Cobro de este mes</th>
                    </tr>
                    <tr>
                      <th>Concepto</th>
                      <th>Cantidad</th>
                      <th>Importe</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                      this.state.pendCobro.map((reg,i) => {
                        return (
                          <tr key={i} style={{ backgroundColor:'' }}>
                            <td style={{ backgroundColor:'' }}>{reg.concep_d}</td>
                            <td style={{ backgroundColor:'', textAlign:"center" }}>{reg.canti}</td>
                            <td style={{ backgroundColor:'', textAlign:"right" }}>{reg.suma}</td>
                          </tr>  
                        ) 
                      }) 
                    }
                    </tbody>
                    <tfoot style={{fontWeight:"bold"}}>
                      <td>Total cuota social</td>
                      <td style={{textAlign:"center"}}>{this.state.pendCobroCount}</td>
                      <td style={{textAlign:"right"}}>{this.state.pendCobroSum}</td>
                    </tfoot>
                  </Table>    
                  </Col>
              </Row>
              <Row>
                <Col>
                  <div style={{ width: "200px"}}>
        { !this.state.fetchRegistros &&
                    <Doughnut data={this.state.data} />  
        }
                  </div>
                </Col>
              </Row>  
            </Col>
          </Row>

        
        </Container>

      </div>
    );
  }
}

export default CobranEstado;
