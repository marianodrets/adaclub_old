import React from 'react';

const ConcepRecibo = (a_deta) => {
  //const deta = [];
  //console.log(a_deta.deta)
  //const filas = String(a_deta).split('|||')
  // console.log(a_deta)
//const xx = a_deta.deta;
  //console.log(xx.split('|||'))
  //const xx = '[{"concep":"social","detalle":"ener 06","valor":"20","color":"red"},{"concep":"social","detalle":"ener  o-06","valor":"20","color":"blue"}]';

  const deta = JSON.parse(a_deta.deta)

return (
  <>
  <div>
    { deta.map((regis, i) => {
            return (
              <div style={{display:'inline-block',textAlign: "right"}}>
                <div style={{display:'inline-block', width:"170px", 
                              backgroundColor: regis.color, textAlign: "left"}}>
                    {regis.concep}
                </div>
                <div style={{display:'inline-block', width:"230px",
                              backgroundColor: regis.color ,textAlign: "left"}}>
                    {regis.detalle}
                </div>
                <div style={{display:'inline-block', width:"100px",textAlign: "right"}}>
                    {regis.valor}
                </div>
              </div>
                
            ) 
          }) 
        }

  </div>
  </>
  )
};

export default ConcepRecibo;

