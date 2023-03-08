function getColorRandom(a_ind) {
    /* devuelvo colores random pero controlados (los primeros 10)
       colores mas primarios y que se distingan 
       son colores fuertes , como para lineas y fonts, los sig de 10 son random 100% */
    var color = [];
    color[0] = '#ff0000'
    color[1] = '#99cc00'
    color[2] = '#0066ff'
    color[3] = '#cc0066'
    color[4] = '#666633'
    color[5] = '#339966'
    color[6] = '#cc0099'
    color[7] = '#cc3300'
    color[8] = '#999966'
    color[9] = '#666699'
    

    if (a_ind < color.length) {
        return color[a_ind];
    } else {
        var letters = '0123456789ABCDEF';
        var colorR = '#';
        for (var i = 0; i < 6; i++) {
          colorR += letters[Math.floor(Math.random() * 16)];
        }
        return colorR;
    }

}

export default getColorRandom;