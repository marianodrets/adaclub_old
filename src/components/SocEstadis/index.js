import React  from 'react';
import { URL_DB } from './../../constants';
import axios from 'axios';
import { Form, Row, Col, Container, } from 'react-bootstrap';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import '../../pages/stylePages.css';


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

class SocEstadis extends React.Component {
  constructor(props) {
    super(props);

    const data = {
        labels : [],
        datasets: [
          {
            label: 'Alta de socios',
            data: [],
            backgroundColor: 'rgba(77, 255, 77, 0.5)',
          },    
          {
            label: 'Baja de socios',
            data: [],
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
          {
            label: 'Cant Vigente',
            data:  [],
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
        ],
    };
    
    const options = {
        type: 'bar',
        data: data,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Altas y Bajas'
            }
          }
        },
    };
    
    this.state = {
        lee_mod : props.lee_mod,
        registros: [],
        fetchRegistros: false,
        opcion: 'socanu',
        data: data,
        options: options,
        login_id: sessionStorage.getItem('USUA_ID'),
    };

  }


  componentDidMount() {

    this.poblarGrilla();  
  }
  
  poblarGrilla = () => {
    
    this.setState({ fetchRegistros: true })
    
    if(this.state.opcion==='socmes' || this.state.opcion==='socanu') {

        const opcSp = this.state.opcion==='socmes'?'M':'A';

        const sql = `${URL_DB}SEL_SOCIOS_ESTAD_ALTBAJ('${opcSp}')`
        axios.get(sql)
        .then((response) => {
       
            const data = {
                labels : response.data[0].map((elem) => elem.label),
                datasets: [
                  {
                    label: 'Alta de socios',
                    data: response.data[0].map((elem) => elem.canti_a),
                    backgroundColor: 'rgba(77, 255, 77, 0.5)',
                  },    
                  {
                    label: 'Baja de socios',
                    data: response.data[0].map((elem) => elem.canti_b),
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                  },
                  {
                    label: 'Cant Vigente',
                    data:  response.data[0].map((elem) => elem.canti_v),
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                  },
                ],
            };
            
            const options = {
                type: 'bar',
                data: data,
                options: {
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: 'Altas y Bajas'
                    }
                  }
                },
            };

            this.setState({ data, options });

        })
        .catch((error) => console.log(error))
        .finally(() => {
        this.setState({ fetchRegistros: false })
        })
    }
  }

  handleChange = (event) => {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({[name]: value}, () => { 
      this.poblarGrilla()
    });

  };
  
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
            <Col md={2} style={{fontSize:"22px"}}>
                <b>{`Estadisticas`}</b>
            </Col>
            <Col xs={3}>
                <Form.Group>
                  <select className="form-control" name="opcion" 
                          onChange={this.handleChange} value={this.state.opcion}>
                      <option key={1}  value={'socmes'}> Altas/Bajas de socios Mensual </option>
                      <option key={2}  value={'socanu'}> Altas/Bajas de socios Anual </option>
            
                  </select>
                </Form.Group>
            </Col>
 
          </Row>

         <Row>
              <Col>
                  <Bar data={this.state.data} options={this.state.options} height="100px" /> 
              </Col>
            </Row>

        
        </Container>

      </div>
    );
  }
}

export default SocEstadis;
