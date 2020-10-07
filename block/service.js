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
    // wipe out mmrproofs and signatures for lighter txpows.. 
    txpow.body.witness.signatures = {};
    txpow.body.witness.mmrproofs = {};

    Minima.sql(INSERT+JSON.stringify(txpow)+"', '"+txpow.header.block+"', '"+txpow.txpowid+"', '"+isblock+"', '"+txpow.header.timesecs+"', '"+txpow.body.txnlist.length+"')", function(res){
      if(res.status == true) 
      { 
        //Minima.log("TxPoW Added To SQL Table.. ");
      }
    });
  }
  function pruneData(height) {
    Minima.file.load("prune.txt", function(res){
      if(res.success) {
        var json = JSON.parse(res.data);
        if(json.status) {
          var setPruning = json.period;
          if(height % 10 == 0) {
            height = height - setPruning;
            Minima.sql("DELETE FROM txpowlist WHERE height <="+height, function(){}); 
          }
        }
        
      } 
    });    
  }

Minima.init(function(msg){
    if(msg.event == 'connected') {
      // create json to save in file for pruning
      const prune = 
      {
          "status": true,
          "period": 388800
      };
      Minima.file.save(JSON.stringify(prune), "prune.txt", function(res){
        if(!res.success) {
          Minima.log("File saving rejected!");
        }            
      });

      // init SQL DB for blocks
      createSQL();
  
    } else if(msg.event == 'newtxpow') {
    
      addTxPoW(msg.info.txpow);

      pruneData(msg.info.txpow.header.block);
        
    } 
});
 


