import React from 'react';
// import { Toast  } from 'react-bootstrap';
import { URL_DB } from '../../constants';
import axios from 'axios';
import { FaRegEdit, FaGlasses } from "react-icons/fa";

class AccesoMenues extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      help_usua_id: props.help_usua_id,
      help_apli   : props.help_apli,
      help_rol    : props.help_rol,
      showToast   : props.showToast,
      renglones:[],
      fetchRegistros: true,
    }; 

  }

  leeMenues = () => {
    var sql
    if (this.state.help_usua_id==='') {
      sql = `${URL_DB}SEL_USU_ROLES_SHOW_MENU(null,'${this.state.help_apli}','${this.state.help_rol}')`
    } else {
      sql = `${URL_DB}SEL_USU_ROLES_SHOW_MENU(${this.state.help_usua_id},null,null)`
    }

    axios.get(sql)
      .then((response) => {
        this.setState({
          renglones: response.data[0]
        }) 
      })
      .catch((error) => console.log(error))
      .finally(() => {
        this.setState({ fetchRegistros: false })
      })
  }


  componentDidMount = () => {
    this.leeMenues()
  }

  render() {    

      // let locShowtoast = this.props.showToast;
      //const { handleShowToast } = this.props;

      return (
        <>
            <div style={{ backgroundColor: '#ffff99', textAlign:'left' }}>
            <thead />
            <tbody>
            {
                  this.state.fetchRegistros && 'Cargando...'
            }
            {
                this.state.renglones.map((regis, ind) => {
                  return (
                    <tr key={ind}>
                  {  regis.usma_item==='CAB' &&
                      <td style={{ backgroundColor:"#5c5c8a", color:"#ffffff"}} >
                          {regis.usma_des_item}
                      </td>
                  }
                  {  regis.usma_item!=='CAB' &&
                      <td>
                          {regis.usma_des_item}
                      </td>
                  }
                    <td>
                        {regis.lee_mod==='L' &&  <FaGlasses />}
                        {regis.lee_mod==='M' &&  <FaRegEdit />}
                    </td>
                  </tr>
                  ) 
                })                 
            }
            </tbody>
          </div>
        </>
      )  
  }
}

export default AccesoMenues;

