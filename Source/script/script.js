
if ("Notification" in window) {
    // Richiedi il permesso dell'utente per inviare notifiche.
    Notification.requestPermission().then(function(getperm) 
{ 

    console.log('perm granted', getperm) 

});
}
  // -- classe utente che contiene username e pin per accedere a LogSpin
class utente {
    constructor(username, pin) {
        this.username = username;
        this.pin = pin;
    };
}

 // -- class sito che contiene tutte le informazioni di un nuovo sito aggiunto
class sito {

     constructor(url, email, psw, timer_onscreen, timer_inmill, r, g, b){
        this.url = url; //indirizzo url del sito da aggiungere
        this.email = email; //indirizzo email dell'account
        this.psw = psw; //password dell'account
        this.timer_onscreen = timer_onscreen; //timer che verrà visualizzato a schermo
        this.timer_inmill = timer_inmill; //timer in millisecondi utilizzato per la funzione reminder
        this.r = r; //valori r g b casuali per colore casella del sito nell'hub
        this.g = g;
        this.b = b;
        console.log("costruttore: "+this.url+" "+this.timer_inmill);
        
    };
    //funzione reminder che ogni tot milliseconi manderà un alert di remind per fare il login al sito
    reminder(){
        alert("Sito "+this.url+" aggiunto!\nOgni "+this.timer_onscreen+" comparirà un reminder di login!")
        /* -- creo worker che lavorerà in background ed ogni intervallo di 
        tempo scelto dall'utente ricorderà di eseguire l'accesso e farà il redirect al sito in questione --  */
        var wrk = new Worker( //script che eseguirà il worker
            `data:text/javascript,
            onmessage = function(e) {
                let utente = e.data;
                
                if(utente.timer_inmill!=''){
                setInterval(function() {
                    postMessage(utente);
                }, utente.timer_inmill);
            }
            }
           
            `);
            
            wrk.postMessage(this); //invio parametri al worker
            wrk.onmessage = function(e) { //script all'arrivo del messaggio dal worker
                let utente = e.data; //il worker comunica il sito 
                console.log("timer: "+ utente.timer_inmill);

                if(utente.timer_inmill != ''){ //nel caso in cui il timer_onscreen è "Mai" non verrà fatto nulla e il reminder non farà nessun'azione
                console.log("timer nell'if: "+ utente.timer_inmill);
                if("Notification" in window){ //se le notifiche sono state accettate logspin invierà una notifica al dispositivo
                 // Crea una notifica. 
                    if (Notification.permission === "granted") {
                        // Crea una notifica.
                        var notification = new Notification("Ricordati di effettuare l'accesso a "+utente.url+"!", {
                         body: "Email: "+utente.email+"\nSe non ti ricordi la password vai all'hub dei siti"
                         });
                        notification.onclick = function (event) {
                         // Fai qualcosa quando l'utente clicca sulla notifica.
                        window.open("https://"+utente.url,"_blank");
                };
                      } else { //nel caso in cui le notifiche sono bloccate logspin manda un alert

                        alert("Ricordati di effettuare l'accesso a "+utente.url+"!\nEmail: "+utente.email+"\nSe non ti ricordi la password vai all'hub dei siti");
                        window.open("https://"+utente.url,"_blank"); //redirect alla pagina del sito salvato 
                      }
                
               
             
            }
                } 
            }
            
        
        }
        remove_worker(){ //funzione che termina bruscamente il worker in background
            wrk.terminate();
        }
}
/*  -- variabili globali  --  */
/* variabili nel local storage */
let sitiSalvati = []; //array di appoggio che conterrà i siti caricati dal local storage
let utenteSalvato; //oggetto di appoggio che conterrà l'utente con il pin di accesso

/* variabili utilizzate durante l'esecuzione */
var siti = []; //array con siti aggiunti
let ut1 = new utente("",""); //utente aggiunto
/* -- */
utenteSalvato = JSON.parse(localStorage.getItem("ut1")); //in questa variabili verranno caricati i dati nel local storage dell'utente

//funzione di controllo pin
function controlla_pin(){
    let bound = 0;
  do{
        console.log("controllo pin");
        pin = prompt("Inserisci pin","00000");
        if(pin != ut1.pin) alert("Pin errato! Tentativo n."+bound); //controllo se il pin inserito è uguale al pin dell'utente 
        bound++; //numero tentativi
        if(bound==5) alert("Hai sbagliato il pin 5 volte, se sbaglierai altre 3 volte l'applicazione verrà resettata!"); //reset dell'applicazione dopo un numero specifico di tentativi
        if(bound>8) {clear_localStorage_clean(); return false;}
  }while(pin != ut1.pin);
}

if(utenteSalvato != null){ //se l'utenteSalvato è null allora è il primo accesso a logspin quindi ne creo uno con il suo pin
    /* controllo esistenza utente e controllo pin di accesso */
   ut1 = utenteSalvato;
   let pin;
   console.log("utente gia esitente nel local storage");
   controlla_pin();
} else {
    /* Setting del pin per primo accesso */
    console.log("Creazione nuovo utente con pin");
    let nome = prompt("Benvenuto! Inserisci il nome utente: ", "utente");
    let pin;
    do{
        pin = prompt("Ora crea un pin di 5 caratteri alfanumerici", "00000");
    }while(pin.length!=5);
    ut1 = new utente(nome, pin); //istanzio nuovo utente
    localStorage.setItem("ut1", JSON.stringify(ut1)); //salvo nuovo utente nel local storage
}

sitiSalvati = JSON.parse(localStorage.getItem("siti")); //carico in sitiSalvati i dati nel local storage riferiti ai siti
if(sitiSalvati != null){ //se sitiSalvati è nulla allora non ci sono siti, se non è null esistono siti e li carico nell'array che verrà gestito dall'applicazione
    siti = sitiSalvati;
}

localStorage.setItem("siti", JSON.stringify(siti)); //carico i siti  nel local storage



function scrivi_sito(s){ //funzione scrivi sito: manipola il DOM creando tutti gli elementi per inserire un nuovo box sito nell'hub, tramite append
    //s è il sito da scrivere

    let sezione = document.getElementById("hub-sites"); //prendo la sezione dell'hub
    /* -- span new site -- */
    let newSite = document.createElement('span'); //creo elemento
    newSite.setAttribute('class','col-lg-4'); //setto la classe di bootstrap per il posizionamento e la dimensione
    
   /* -- div -- */
    let divNewSite = document.createElement('div');
        divNewSite.setAttribute('class', 'row');
        divNewSite.setAttribute('style', 'padding: 5px; background-color: rgb('+s.r+', '+s.g+', '+s.b+'); border-radius: 5px;'); //set dello stile dell'elemento
        newSite.appendChild(divNewSite); //aggancio l'elemento all'elemento padre
    /*-- title new sitw url --*/
    let titleNewSite = document.createElement('button');
        titleNewSite.setAttribute('class', 'btn btn-hub');
        titleNewSite.setAttribute('onclick', 'window.open("https://'+s.url+'","_blank");');
        titleNewSite.innerHTML=""+s.url;
    
        divNewSite.appendChild(titleNewSite);
    /* -- label email --  */
    let emailNewSite = document.createElement('label');
        emailNewSite.setAttribute('class', 'col-lg-12');
        emailNewSite.innerHTML="<b>Email</b>: "+s.email;
        divNewSite.appendChild(emailNewSite);
    /* -- label password -- */
    let viewPsw = document.createElement('button');
        viewPsw.setAttribute('class', 'col-lg-2 col-sm-2 col-xs-2 btn-box btn');
        viewPsw.innerHTML = "<img src='img/occhio-chiuso.png' width='24px' height='24px' >";
        divNewSite.appendChild(viewPsw);
        
    let pswNewSite = document.createElement('label');
        pswNewSite.setAttribute('class', 'col-lg-10 col-xs-10 col-sm-10');
        let psw_osc=""; //password oscurata
        for(let a of s.psw){
            psw_osc+="•";
        }
        pswNewSite.innerHTML="<b>Password</b>: "+psw_osc;
        divNewSite.appendChild(pswNewSite);
        divNewSite.appendChild(viewPsw);
    /* -- label timer -- */
    let timerNewSite = document.createElement('label');
        timerNewSite.setAttribute('class', 'col-lg-10 col-xs-10 col-sm-10');
        timerNewSite.innerHTML="<b>Intervallo</b>: "+s.timer_onscreen;
        divNewSite.appendChild(timerNewSite);
    /* -- delete button -- */    
    let deleteMode = document.createElement('button');
        deleteMode.setAttribute('class', 'col-lg-2 col-xs-2 col-sm-2 btn-box btn');
        deleteMode.innerHTML = "<img src='img/cestino.png' width='24px' height='24px'>";
        divNewSite.appendChild(deleteMode);
        sezione.appendChild(newSite); //aggancio il gruppo di elementi alla sezione hub dei siti
    
    

    let flag = 0;
    viewPsw.addEventListener('click', function(){ //creazione event listener del pulsante viewPsw ( vedi password ), function contiene lo script da eseguire al momento del click
        if(flag==0){ //primo click
            
            if(prompt("Inserisci pin per visualizzare la password","00000") == ut1.pin){ //controllo del pin, non utilizzo controlla_pin() perche qui non è necessario il reset
            pswNewSite.innerHTML = "<b>Password</b>: "+s.psw; //modifico l'elemento visualizzando la password
            flag=1; //flag a uno = bottone cliccato
            viewPsw.innerHTML = "<img src='img/occhio-aperto.png' width='24px' height='24px' >"; //apro l'occhio del bottone
            } else {
                alert("Pin errato");
                return;
            }      
        } else { //secondo click
            viewPsw.innerHTML = "<img src='img/occhio-chiuso.png' width='24px' height='24px' >"; //chiudo occhio del bottone
            pswNewSite.innerHTML = "<b>Password</b>: "+psw_osc; //oscuro password
            flag=0;
        }
    
    })
    /* -- funzione che elmina un sito dall'hub --*/
    deleteMode.addEventListener('click', function () { //creazione event listener per l'eliminazione di un sito, function contiene lo script al click del pulsante elimina
        console.log('delete mode');
        if(!confirm("Sei sicuro di voler cancellare "+s.url+"?")){ 
            return;
        } 
        if(!controlla_pin()) return;
        let index;
        for(let i = 0; i<siti.length; i++){ //preno l'indice del sito da eliminare
            if(siti[i]==s){ 
                index = i;
            }
        }
        siti.splice(index, 1); //uso splice che tramite indice elimina l'elemento dall'array
        alert("Il sito è stato rimosso, la webapp verrà riavviata.\nDovrai reinserire il pin!");
        localStorage.setItem("siti", JSON.stringify(siti)); //salvo l'array aggiornato dei siti
        location.reload(); //riavvio logspin
          
      
    });
    
}



function getRandomInt(min, max) { //funzione per interi random in un intervallo specifico
    return Math.random() * (max - min) + min;
  }



function aggiungi_sito(){ //funzione che aggiunge il sito all'hub, crea l'istanza sito con tutte le sue informazioni e la aggiunge all'array
    /* controllo input */
    if(document.getElementById("url").value == '' || document.getElementById("email").value == '' || document.getElementById("psw").value == '' ) { //controllo che tutti i campi siano riempiti
        alert("Uno dei campi e' vuoto!\nRiempilo prima di continuare.");
        console.log("errore campi");
        return;
    } 

    let url = document.getElementById("url").value; //prendo il valore dei campi dal form aggiungi sito
    let email = document.getElementById("email").value;
    let psw = document.getElementById("psw").value;
    
    if(!url.includes(".it") && !url.includes(".com") && !url.includes(".org") && !url.includes(".eu") && !url.includes(".edu") && !url.includes(".gov") && !url.includes(".uk") && !url.includes(".us")  ){ //controllo se l'url ha un dominio valido
        alert("Url non corretta! Rincontrolla.");
        return;
    } 
    
    if(!email.includes("@")){
        alert('Email non corretta, Ricontrollala.');
        return;
    }

    if(!email.includes(".it") && !email.includes(".com") && !email.includes(".org") && !email.includes(".eu") && !email.includes(".edu") && !email.includes(".gov")  && !email.includes(".uk") && !email.includes(".us")  ){
        alert("Email non corretta! Rincontrolla.");
        return;
    }
   
  
    //nella variabile timer_inmill prendo il valore dall'opzione scelta dall'utente
    let timer_inmill = document.getElementById("timer").value;
    let timer_onscreen = "";
        switch(timer_inmill) { //in base all'opzione scelta il timer avrà un valore diverso a schermo
        case '': 
            timer_onscreen = "Mai";
            break;
        case '30000':
            timer_onscreen="30sec";
            break;
        case '1800000': 
            timer_onscreen = "30min";
            break;
        case '3600000': 
            timer_onscreen = "1h";
            break;
        case '10800000': 
            timer_onscreen = "3h";
            break;
        case '21600000': 
            timer_onscreen = "6h";
            break;
        case '43200000': 
            timer_onscreen = "12h";
            break;
        case '86400000': 
            timer_onscreen = "24h";
            break;
    }
     

    /* -- generazione colore casuale per box sito -- */
    let r=getRandomInt(1,255);
    let g=getRandomInt(1,255);
    let b=getRandomInt(1,255);

    s1 = new sito(url, email, psw, timer_onscreen, timer_inmill, r, g, b); //creazione oggetto sito
    scrivi_sito(s1); //stampo sito sul dom nell'hub
    
    siti.push(s1); //inserisco il sito nell'array
    console.log("inserisco sito "+s1.url);
    console.log("array siti aggiornato e salvato nel local storage");
    localStorage.setItem("siti", JSON.stringify(siti)); //aggiorno l'array nel local storage
    document.getElementById("url").value = ''; //reset dei campi del form
    document.getElementById("email").value = '';
    document.getElementById("psw").value = '';
    document.getElementById("timer").value = '';
    siti[siti.length-1].reminder(); //faccio partire la funzione reminder dell'oggetto
}

function clear_localStorage(){ 

    /* cancello il local storage, tutti i dati */
    console.log("cancellazione dell'intero local storage");
    if(confirm("Sicuro di voler ripristinare tutto?\nPerderai tutti i tuoi dati.")){
    localStorage.clear();
    siti = [];
    localStorage.setItem("siti", JSON.stringify(siti));
    location.reload();
    }
}
//cancello il local storage ma senza controllo del pin, utile per la funzione di reset dopo i tentativi di pin errato
function clear_localStorage_clean(){

    /* cancello il local storage, tutti i dati */
    console.log("cancellazione dell'intero local storage");
    
    localStorage.clear();
    siti = [];
    localStorage.setItem("siti", JSON.stringify(siti));
    location.reload();
    
}

//funzione che viene eseguita al momento del caricamento del body dell'html che ristampa tutti i siti salvati in una riapertua dell'app
function stampa_siti(){
    let sito_app; //variabile di appoggio
    for(let a of siti){ //scorro l'array dei siti
        scrivi_sito(a); //stampo il sito nel DOM
        console.log(a.url+" "+a.timer_inmill);
        sito_app = new sito(a.url, a.email, a.psw, a.timer_onscreen, a.timer_inmill, a.r, a.g, a.b); //creo una nuova istanza del sito per utilizzare la funzione reminder
        sito_app.reminder(); //eseguo la funzione reminder
    }
    
}

//funzione che al click su un pulsante nella sezione head che inserisce l'url selezionato nel campo url del form aggiungi sito
function aggiungi_sito_da_head(url_h){
    location.href = "#form-agg-sito"; //sposta la schermata nella posizione del form cosi da agevolare l'inserimento dei dati mancanti
    let url_field = document.getElementById("url"); //preno il campo url dal dom
    url.value = url_h; //lo riempio con l'url del sito selezionato
}

