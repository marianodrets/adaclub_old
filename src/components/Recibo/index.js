import React  from 'react';
import { URL_DB, NOMBRE_INSTITUCION } from '../../constants';
import axios from 'axios';
import logo from './../../assets/images/logoClub.jpg';
import './recibo.css';

class Recibo extends React.Component{   

    constructor(props) {
        super();
    
        this.state = {
            punto : props.punto,
            reci : props.reci,
            items: [],
            login_id: sessionStorage.getItem('USUA_ID'),
            totrec: 0,
            fetchRegistros : false,
            fecha:'',
            socios:'',
            estado:'',
            alta_linea:'',
            baja_linea:'',
            color_reci:'',
        };
      }
        
    async getRecibo() {
        const sql =  `${URL_DB}SEL_COBXCAJA_RECIBO(${this.state.punto},${this.state.reci})`;
        axios.get(sql)
        .then((response) => {
            this.setState({
                items: response.data[0],
                fecha: response.data[0][0].reci_fecha,
                socios: response.data[0][0].socios,
                estado: response.data[0][0].estado,
                alta_linea: response.data[0][0].alta_linea,
                baja_linea: response.data[0][0].baja_linea,
                color_reci: response.data[0][0].color_reci,
                totrec: response.data[0][0].totrec,
            })
        })      
        .catch((error) => console.log(error))
        .finally(() => {
            this.setState({ fetchRegistros: false })
        })
    }

    async getInicio() {
        try{
          await Promise.all([ this.getRecibo() ])
        } catch(e) {
          console.log(e);
        } finally {
    
        }
    }
    
    componentDidMount = () => {
        this.getInicio()
    }

    render() {
        
        return( <>
        <div id="div_recibo" name='div_recibo'>
        <form   id={"recibo"}>
            <div id={"reciboborde"}>
                <div style={{width:"820px", height:"60px" }} >
                    <div style={{float:"left", width:"10%" }} >
                        <img  style={{ width: '40px' }} 
                                src={logo} 
                                alt={'logo_hlp'} />
                              
                    </div>
                    <div style={{float:"left", width:"30%" }} >
                       <p>{NOMBRE_INSTITUCION}</p>
                     
                    </div>
                    <div style={{float:"left", width:"55%", textAlign:"right", fontSize:"25px", fontWeight:"bold", padding:"10px" }} >
                        {`Recibo ${this.state.punto} - ${this.state.reci} `}
                    </div>
                </div>
                <div style={{textAlign:"left"}}>
                    <table className='reciboitems'>
                        <thead className='fondoCelda'>
                        <tr>
                            <th>Fecha</th>
                            <th colSpan={3} style={{backgroundColor:"#d1d1e0"}}>{this.state.fecha}</th>
                        </tr>
                        <tr>
                            <th>Socio/s</th>
                            <th colSpan={3} style={{backgroundColor:"#d1d1e0"}}>{this.state.socios}</th>
                        </tr>
                        <tr>
                            <th style={{width:'30px', textAlign:"center"}}>Item</th>
                            <th style={{ width: '250px' }} >Concepto</th>
                            <th style={{ width: '360px' }} >Detalle</th>
                            <th style={{ width: '100px' }} >Importe</th>
                        </tr>
                        </thead>
                        <tbody>
                    {
                    this.state.fetchRegistros && 'Cargando...'
                    }
                    {  this.state.items.map((elem,i) => {
                        return (
                            <tr key={i}>
                            <td>{elem.reit_item}</td>
                            <td>{elem.reit_concep_deno}</td>
                            <td>{elem.reit_deno}</td>
                            <td style={{textAlign : "right"}}>{elem.reit_valor}</td>
                            </tr> 
                        ) 
                        }) 
                    }  
                    <tr key={1000}>
                            <td colSpan={3} style={{textAlign:"right", fontWeight:"bold"}}>
                                Total a pagar
                            </td>
                            <td style={{textAlign:"right", fontWeight:"bold"}}>
                                {this.state.totrec}</td>
                            </tr> 
                    </tbody>
                    </table>
                </div>
                <div>
                    {this.state.alta_linea}
                </div>
                <div>
                    {this.state.baja_linea}
                </div>
                <div>
                    {this.state.estado}
                </div>
            </div>
        </form>
        </div>
        </> )
    }
}

export default Recibo;