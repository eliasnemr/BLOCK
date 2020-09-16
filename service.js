  // SQL to create the dB
  var INITSQL = "CREATE Table IF NOT EXISTS blocks ( txpow LONGVARCHAR(MAX) NOT NULL, height int NOT NULL, hash VARCHAR(160) NOT NULL, relayed VARCHAR(160) NOT NULL, txns int NOT NULL);"+
  "SELECT * FROM blocks";
  /** Create SQL Table */
  function createSQL(){
    Minima.sql(INITSQL, function(resp){
      Minima.log("Created SQL"); 
    
    if(!resp.status){

      alert("Something went wrong with SQL DB+\n\n"+resp.message);

    } 
  });
  }

  var INSERT = "INSERT INTO blocks VALUES ('"
  function addTxPoW(txpow) {
    
    Minima.sql(INSERT+JSON.stringify(txpow)+"', '"+txpow.header.block+"', '"+txpow.txpowid+"', '"+txpow.header.timesecs+"', '"+txpow.body.txnlist.length+"')", function(res){
      if(res.status == true) 
      { 
        // Minima.log("TxPoW Added To SQL Table.. ");
      }
    });
    
    
  }

Minima.init(function(msg){
    if(msg.event == 'connected') {
        
        // init SQL DB for blocks
        createSQL();
  
    } else if(msg.event == 'newtxpow') {
      if(msg.info.txpow.isblock){
        addTxPoW(msg.info.txpow);
      }
        
    }
});
 


