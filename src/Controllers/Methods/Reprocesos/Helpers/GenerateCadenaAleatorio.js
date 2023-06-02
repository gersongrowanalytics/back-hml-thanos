controller = {}

controller.MetGenerateCadenaAleatorio = async (longitud) => {
    let cadena = '';
    const caracteres = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const caracteresLength = caracteres.length;
  
    for (let i = 0; i < longitud; i++) {
      const indiceAleatorio = Math.floor(Math.random() * caracteresLength);
      const caracterAleatorio = caracteres.charAt(indiceAleatorio);
      cadena += caracterAleatorio;
    }
  
    return cadena;
}

module.exports = controller