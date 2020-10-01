  // SQL to create the dB
  var INITSQL = "CREATE Table IF NOT EXISTS txpowlist ( txpow LONGVARCHAR(MAX) NOT NULL, height int NOT NULL, hash VARCHAR(160) NOT NULL, isblock int NOT NULL, relayed VARCHAR(160) NOT NULL, txns int NOT NULL)";
  /** Create SQL Table */
  function createSQL(){
    Minima.sql(INITSQL, function(resp){
      //Minima.log("Created SQL"); 
    
    if(!resp.status){

      alert("Something went wrong with SQL DB+\n\n"+resp.message);

    } 
  });
  }

  var INSERT = "INSERT INTO txpowlist VALUES ('"
  function addTxPoW(txpow) {
    
    var isblock = 0;
    if(txpow.isblock) {
      isblock = 1;
    }

    Minima.sql(INSERT+JSON.stringify(txpow)+"', '"+txpow.header.block+"', '"+txpow.txpowid+"', '"+isblock+"', '"+txpow.header.timesecs+"', '"+txpow.body.txnlist.length+"')", function(res){
      if(res.status == true) 
      { 
        //Minima.log("TxPoW Added To SQL Table.. ");
      }
    });
  }

  function pruneData() {
    Minima.sql("SELECT HEIGHT FROM txpowlist", function(res) {
      console.log(res);
      
    });
  }

Minima.init(function(msg){
    if(msg.event == 'connected') {
      // init SQL DB for blocks
      createSQL();
  
    } else if(msg.event == 'newtxpow') {
    
      addTxPoW(msg.info.txpow);
      // prune data every 100 blocks
      pruneData();
        
    } 
});
 


