// variabile globale visibile a tutte le funzioni java
var xmlHttp = createXmlHttpObject();

// funzione per creare un oggetto XML
function createXmlHttpObject() {
  if (window.XMLHttpRequest) {
    xmlHttp = new XMLHttpRequest();
  }
  else {
    xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  return xmlHttp;
}

// Funzione che gestisce la pressione del pulsante dal codice html precedente:
// invia una stringa di elaborazione al server che verrà utilizzata nel metodo .on
function ButtonPress0() {
  var xhttp = new XMLHttpRequest();

  // se si vuole gestire una risposta immediata (come lo stato dell'ESP e della pressione del pulsante)
  // utilizzare questo codice, poiché lo stato del pulsante dell'ESP è nel codice XML principale
  // non abbiamo bisogno di cio', ricordando che se si vuole un'elaborazione immediata del feedback
  // è necessario inviarla nella funzione di gestione dell'ESP e qui.

  /*
  var message;
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      message = this.responseText;
      // aggiornare alcuni dati del codice html
    }
  }
  */

  xhttp.open("GET", "BUTTON_0", true);
  xhttp.send();
}

function ButtonPress1() {
  var xhttp = new XMLHttpRequest();
  /*
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("button1").innerHTML = this.responseText;
    }
  }
  */
  xhttp.open("GET", "BUTTON_1", true);
  xhttp.send();
}

function UpdateSlider(value) { //Funzione richiamata quando l'utente muove la slider sulla pagina web
  var xhttp = new XMLHttpRequest();

  // questa volta voglio da ESP32 un feedback immediato della velocità della ventola
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      // Aggiorna la pagina web in base alla risposta di ESP32
      document.getElementById("fanrpm").innerHTML = this.responseText;
    }
  }
  // this syntax is really weird the ? is a delimiter
  // first arg UPDATE_SLIDER is use in the .on method
  // server.on("/UPDATE_SLIDER", UpdateSlider);
  // then the second arg VALUE is use in the processing function
  // String t_state = server.arg("VALUE");
  // then + the controls value property
  xhttp.open("GET", "UPDATE_SLIDER?VALUE=" + value, true);
  xhttp.send();
}

// funzione che gestisce la risposta dall' ESP32
function response() {
  var message;
  var barwidth;
  var xmlResponse;
  var xmldoc;
  var dt = new Date();
  var color = "#e8e8e8";

  // Ricevi dall'host data e ora
  document.getElementById("time").innerHTML = dt.toLocaleTimeString();
  document.getElementById("date").innerHTML = dt.toLocaleDateString();

  // Leggi la stringa XML
  xmlResponse = xmlHttp.responseXML;

  if (xmlResponse) { // Se la variabile non è vuota

    // Si comincia ad estrarre il valore di A0
    xmldoc = xmlResponse.getElementsByTagName("A0");
    message = xmldoc[0].textContent;

    // Visualizza il valore di A0
    document.getElementById("a0").innerHTML = message;

    // Colore della barra in base al valore di A0
    if (message < 1365) color = "#00BD00";  // Verde
    else if (message >= 1365 && message < 1365 * 2) color = "#C9CC00";  // Giallo
    else color = "#FF0000"; // Rosso
    document.getElementById("a0").style.backgroundColor = color;

    // Largezza della barra colorata in funzione del valore di A0
    barwidth = message / 40.95;
    document.getElementById("a0").style.width = (barwidth + "%");

    // Estraggo il valore V0, tensione relativa al valore analogico A0
    xmldoc = xmlResponse.getElementsByTagName("V0");

    // Stesse operazioni precedenti
    message = xmldoc[0].textContent;
    document.getElementById("v0").innerHTML = message;
    document.getElementById("v0").style.width = (barwidth + "%");
    document.getElementById("v0").style.backgroundColor = color;

    // Secondo canale analogico A1
    xmldoc = xmlResponse.getElementsByTagName("A1");
    message = xmldoc[0].textContent;

    document.getElementById("a1").innerHTML = message;

    if (message < 1365) color = "#00BD00";  // Verde
    else if (message >= 1365 && message < 1365 * 2) color = "#C9CC00";  // Giallo
    else color = "#FF0000"; // Rosso
    document.getElementById("a1").style.backgroundColor = color;

    barwidth = message / 40.95;
    document.getElementById("a1").style.width = (barwidth + "%");

    xmldoc = xmlResponse.getElementsByTagName("V1");

    message = xmldoc[0].textContent;
    document.getElementById("v1").innerHTML = message;
    document.getElementById("v1").style.width = (barwidth + "%");
    document.getElementById("v1").style.backgroundColor = color;

    // Gestione pulsanti: lettura del primo pulsante relativo al led integrato
    xmldoc = xmlResponse.getElementsByTagName("LED");
    message = xmldoc[0].textContent;

    if (message == 0) {
      document.getElementById("LED").innerHTML = "LED spento";
      document.getElementById("btn0").innerHTML = "Accendi";
      document.getElementById("LED").style.color = "#00AA00";
    }
    else {
      document.getElementById("LED").innerHTML = "LED acceso";
      document.getElementById("btn0").innerHTML = "Spegni";
      document.getElementById("LED").style.color = "#0000AA";
    }

    xmldoc = xmlResponse.getElementsByTagName("SWITCH");
    message = xmldoc[0].textContent;
    document.getElementById("switch").style.backgroundColor = "rgb(200,200,200)";
    // update the text in the table
    if (message == 0) {
      document.getElementById("switch").innerHTML = "Switch is OFF";
      document.getElementById("btn1").innerHTML = "Accendi";
      document.getElementById("switch").style.color = "#0000AA";
    }
    else {
      document.getElementById("switch").innerHTML = "Switch is ON";
      document.getElementById("btn1").innerHTML = "Spegni";
      document.getElementById("switch").style.color = "#00AA00";
    }
  }
}

// Funzione che invia la richiesta sottoforma di stringa "xml" all'ESP32
// A sua volta l'ESP32 invierà una stringa xml contenente tutti i dati aggiornati
// che andranno ad aggiornare i valori sulla pagina web
// Vedi istruzione: server.on("/xml", HTTP_GET, [](AsyncW......

function process() {
  if (xmlHttp.readyState == 0 || xmlHttp.readyState == 4) {
    xmlHttp.open("GET", "xml", true);
    xmlHttp.onreadystatechange = response;
    xmlHttp.send();
  }

  //Pagine lunghe e complesse potrebbero richiedere un timeout maggiore
  setTimeout(process, 100); // Aggiornamento ogni 100ms
}