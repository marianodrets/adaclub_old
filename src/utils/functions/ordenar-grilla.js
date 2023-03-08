function ordenarGrilla(key, data, scope) {
    var orden =  'asc';
    var oJSON = data.sort(function (a, b) {
      var x = a[key], y = b[key];
      if (orden === 'asc') {
          return ((x < y) ? -1 : ((x > y) ? 1 : 0));
      }
      if (orden === 'desc') {
          return ((x > y) ? -1 : ((x < y) ? 1 : 0));
      }
      return false;
    });

    return oJSON;
}

export default ordenarGrilla;