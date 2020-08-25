// Misc Functions to help with BLOCK 
function getBlockNumber() {
    document.getElementById('blocknumber').innerHTML = "<b>"+ Minima.block+"</b>";
  } 
  // INIT Tabulator blocks-table.. 
  function initTable() {
    $(document).ready(function(){
      Minima.sql("SELECT DISTINCT height, hash, relayed from blocks ORDER BY height desc", function(res){

        // Create a tabulator instance, and refer it to the div canvas
          table = new Tabulator("#example-table", {
            initialSort:[

              {column:"HEIGHT", dir:"desc"}, //sort by this first

            ],
            maxHeight: 660,
            layout: "fitColumns",
            resizableColumns: false,
            responsiveLayout:true,
            headerSort: false,
            index:"HEIGHT",
            columns:[

              {title: "Height", field: "HEIGHT", sorter: "number", width: 95, cssClass: "height-column"},

               {title: "Hash", field: "HASH", formatter:function(cell, formatterParams){
                var hash = cell.getData();
                hash = hash.HASH.substring(0, 1) + "..." + hash.HASH.substring(6, 190);
                return hash;
              }},
              {title: "Relayed", field:"RELAYED", width: 110, formatter:function(cell, formatterParams){
                  var time = cell.getData();
                  time = new Date(parseInt(time.RELAYED, 10)).toISOString();
                  time = moment(time).fromNow();
                  return time;
              }},

            ],
            rowClick:function(e, row){

              var clickedrow = row._row.data;
          
              //row - row component
              // console.log("USEREVENT: Clicked Row."+ clickedrow.HEIGHT);
            
              var relativeHash = clickedrow.HASH;
              // add to localStorage to pass to details.html..
              localStorage.setItem("relativeHash", clickedrow.HASH);

              window.location.href = './details.html?'+relativeHash;

              return false;

            },
          });
        
          var temp = [];
          var connected = 0;
        // Loop through the json rows arr and add..
          $.each(res.response.rows, function(i, el){
            
            temp.push(el);
            
            console.log("Drew")

          });
          
          /** SET Data to the Tabulator REF */
          table.setData(temp)
          .then(function(){

              //run code after table has been successfully updated
              //console.log("TABULATOR: Added new data to the Table");

          })
          .catch(function(error){

              //handle error loading data
              console.log(error);

          });

          
      });
    });
  }
  
/** Update Tabulator Table with new blocks */
  function updateTableData() {
    
    $(document).ready(function(){

        Minima.sql("SELECT DISTINCT height, hash, relayed from blocks ORDER BY height desc", function(res){

          // Loop through the json rows arr and add..
          var temp = []; 

          $.each(res.response.rows, function(i, el){
              
              temp.push(el);        
       
          });
          /** SET Data to the Tabulator REF as a promise */
          table.replaceData(temp)
          .then(function(){

              //run code after table has been successfully updated
              // console.log("TABULATOR: Added new data to the Table");

          })
          .catch(function(error){
              //handle error loading data
              console.log(error);
          });
        });
    });
  }
  // SQL to create the dB
  var INITSQL = "CREATE Table IF NOT EXISTS blocks ( height VARCHAR(160) NOT NULL, hash VARCHAR(160) NOT NULL, relayed VARCHAR(160) NOT NULL);"+
                "SELECT DISTINCT height, hash, relayed FROM blocks";
/** Create SQL Table */
  function createSQL(){
    Minima.sql(INITSQL, function(resp){
      //console.log(resp);
      if(!resp.status){

        alert("Something went wrong with SQL DB+\n\n"+resp.message);

      }
    });
  }
  var hash = "";var height="";var relayed="";var count = 0;var parent=""
  var POPULATEQUERY = "INSERT INTO blocks (height, hash, relayed) VALUES ";
// Recursive function to fetch prev 127 blocks from Minima to SQL
  function add127BlocksToSQL() {

    if(count == 0){

    hash = Minima.status['tip'];

    height = Minima.status['lastblock'];

      // do this to get timesecs
      Minima.cmd("txpowinfo "+hash, function(res){

        relayed = (res.response.txpow.header.timesecs)*1000;

        // relayed = moment(relayed);
        // relayed = relayed._d;
        // relayed = moment(relayed._d, 'YYYY-MM-DDTHH:mm:ssZ').format();
        // relayed = moment(relayed).fromNow();

        addRecord(height, hash, relayed); // h2 sql

      });

    }
    // let's get the tip's parent to traverse through..
    Minima.cmd("txpowinfo "+hash, function(res){

      // get block's parent block
      parent = res.response.txpow.header.superparents[0].parent;

      Minima.cmd("txpowinfo "+parent, function(res) {

        hash = res.response.txpow.txpowid;

        height = res.response.txpow.header.block;

        relayed = (res.response.txpow.header.timesecs)*1000;

        addRecord(height, hash, relayed); // h2 sql

        // callback
        if(count < 128){

          count++;

          add127BlocksToSQL();
        } else {
          return 0;
        }
      });
    });
  }
/** ADD TO SQL */ 
  var CHECKQUERY = "SELECT DISTINCT height, hash, relayed FROM blocks WHERE hash = '";
  function addRecord(height, hash, relayed) {

    // check if hash already exists, if not populate..
    Minima.sql(CHECKQUERY+hash+"'", function(resp){

      // check if block already exists
      if(resp.response.status == true && resp.response.count == 0){
        // add 2 sql
        Minima.sql(POPULATEQUERY+"('"+height+"','"+hash+"','"+relayed+"')", function(resp){

          // something went wrong, stop
          if(!resp.status){

            alert("H2 SQL: Something went wrong adding the new record+\n\n"+resp.message);

          // otherwise insert..
          } else {

            //console.log("H2 SQL: Pushed a new block to SQL Database.");

          }
        });
      } else {

        //console.log("H2 SQL: Block already exists in SQL Database!");

      }
    });
  }
/** Get the tip added to SQL */
  function getNewBlockToSQL() {  

    // Get tip of chain 
    tip = Minima.status['tip'];

    // Check if this block exists 
    Minima.sql(CHECKQUERY+tip+"'", function(resp){
    if(resp.response.status == true && resp.response.count == 0){

      height = Minima.status['lastblock'];

      // only way to get time in secs for now...
      Minima.cmd("txpowinfo "+tip, function(res){

      relayed = (res.response.txpow.header.timesecs)*1000;

      // delete last row
      deleteMIN();

      // Add tip to SQL list  
      addRecord(height, tip, relayed);

      });
      

    }
      
    });
  }
/** Delete last row w/ MIN(height) in sql */
var DELETELASTQUERY = "DELETE FROM blocks WHERE (height = (SELECT MIN(height) FROM blocks))";
  function deleteMIN() {
    Minima.sql(DELETELASTQUERY, function(res){  
      if(res.status == true){

        return;
      }
    });
  }

  // JQUERY Helpful Functions
  $(document).ready(function() {
    
    if(localStorage.getItem('mode') == 'dark'){
      $('body').addClass("dark");
      $('.dark-toggle').find('i').text('brightness_high');
      $('.body-icon').attr("src", "assets/blocklogowhitetext.svg");
    } else if (localStorage.getItem('mode') == 'light') {
      $('body').removeClass("dark");
      $('.dark-toggle').find('i').text('brightness_4');
      $('.body-icon').attr("src", "assets/blocklogo.svg");
    }

    // Materialize tooltip
    $('.tooltipped').tooltip({delay: 50});
    
    // elias github
    $("#elias").on("click", function(){

      window.open('https://github.com/eliasnemr', '_blank'); 

    });

  $("#searchBtn").on("click", function(){
        
    var addr = $("#search-input").val().toLowerCase();
        // quit exit if nothing
        if(addr.length == ""){

          $('#example-table').fadeIn(100);

          $('#results-table').fadeOut(100);

  }

  Minima.cmd("txpowsearch input:"+addr, function(res){
    if(res.status == true){
      if(res.response.txpowlist.length > 0){

        // something found.. load it
        loadData(res);

      } else {
        Minima.cmd("txpowsearch output:"+addr, function(res){
          if(res.status == true){
            if(res.response.txpowlist.length > 0){

              // something found.. load it
              loadData(res);

            } else {
              Minima.cmd("txpowsearch tokenid:"+addr, function(res){

                if(res.status == true){
                  if(res.response.txpowlist.length > 0){

                  // something found.. load it
                  loadData(res);

                  } else {

                    // nothing found.. display to user 
                    var markup = "<p class='center row nothing'>Nothing found with that address.</p>";

                    if (!$('.nothing').length){

                      $("#example-table").before(markup);

                      $(".nothing").show(2000); 

                    }
                    
                    setTimeout(function(){

                      $(".nothing").remove();

                    }, 5000);
                  }
                }
              });
            }
          }
        });
      }
    } 
  });
});

// Detect enter key for input 
$('#search-input').keypress(function(event){

  var keycode = (event.keyCode ? event.keyCode : event.which);

  if(keycode == '13'){

      var addr = $("#search-input").val().toLowerCase();
      // quit exit if nothing
      if(addr.length == ""){

       $('#example-table').fadeIn(100);

       $('#results-table').fadeOut(100);

      }
      Minima.cmd("txpowsearch input:"+addr, function(res){
        if(res.status == true){
          if(res.response.txpowlist.length > 0){

              // something found.. load it
              loadData(res);

          } else {
            Minima.cmd("txpowsearch output:"+addr, function(res){
              if(res.status == true){
                if(res.response.txpowlist.length > 0){

                  // something found.. load it
                    loadData(res);

                } else {
                  Minima.cmd("txpowsearch tokenid:"+addr, function(res){
                    if(res.status == true){
                      if(res.response.txpowlist.length > 0){

                      // something found.. load it
                        loadData(res);

                      } else {
                      
                      // nothing found.. display to user 
                      var markup = "<p class='center row nothing'>Nothing found with that address.</p>";

                      if (!$('.nothing').length){

                        $("#example-table").before(markup);

                        $(".nothing").show(2000); 

                      }
                      setTimeout(function(){
                        $(".nothing").remove();
                      }, 5000);
                    }
                    }
                  });
                }
              }
            });
          }
        } 
      });
  }
  //Stop the event from propogation to other handlers
  //If this line will be removed, then keypress event handler attached 
  //at document level will also be triggered
  event.stopPropagation();
});

function loadData(res){

      var results = 0;
      
      results = res.response.txpowlist.length;

      if(results == 1){
        var found = "<p class='center row something'>Found "+ results +" result!</p>"
      } else if (results > 1){

        var found = "<p class='center row something'>Found "+ results +" results!</p>";

      }

      if (!$('.something').length){

        $("#results-table").before(found);

      }
      setTimeout(function(){
        $(".something").remove();
      }, 3000);

      $('#example-table').fadeOut(100);

       // Create a tabulator instance, and refer it to the div canvas
       var resultstable = new Tabulator("#results-table", {
            initialSort:[
            { column:"HEIGHT", dir:"desc" }, //sort by this first
            ],
            index:"HEIGHT",
            columns:[

              {title: "Height", field: "HEIGHT", width:95, cssClass:"height-column"},

              {title: "Hash", field: "HASH", formatter:function(cell, formatterParams){
                var hash = cell.getData();
                hash = hash.HASH.substring(0, 1) + "..." + hash.HASH.substring(6, 190);
                return hash;
              }},
              {title: "Relayed", field:"RELAYED", width: 110, formatter:function(cell, formatterParams){
                  var time = cell.getData();
                  time = new Date(parseInt(time.RELAYED, 10)).toISOString();
                  time = moment(time).fromNow();
                  return time;
              }},
            ],
            headerSort: false,
            pagination:"local",
            paginationSize:15,
            layout:"fitColumns",
            rowClick:function(e, row){

              var clickedrow = row._row.data;
          
              //row - row component
              // console.log("USEREVENT: Clicked Row."+ clickedrow.HEIGHT);
            
              var relativeHash = clickedrow.HASH;
              // add to localStorage to pass to details.html..
              localStorage.setItem("relativeHash", clickedrow.HASH);

              window.location.href = './details.html?'+relativeHash;

              return false;

            },
          });
        
     

      var lastHeight = "";    
      $.each(res.response.txpowlist.reverse(), function(i, el){
        
        var height = el.inblock;

        var hash = el.txpow.txpowid;

        var relayed = el.txpow.header.timesecs*1000;
        
        var result = {HEIGHT: height, HASH: hash, RELAYED: relayed}

      if(lastHeight !== height){

        resultstable.addData(result);

      }
      lastHeight = height;
    });
    
    }


});

// Details functions

function darkmode() {
    // check for mode
    if(localStorage.getItem('mode') == 'dark'){

              $('body').addClass("dark");

            } else if (localStorage.getItem('mode') == 'light') {

              $('body').removeClass("dark");

            }
  }
  function copyHash() {
    $('.copy').on("click", function(){

        var hash = window.localStorage.getItem("relativeHash");

        const el = document.createElement("textarea");

        el.setAttribute('readonly', '');

        el.style.position = 'absolute';

        el.style.left = '-9999px';

        el.value = hash;

        document.body.appendChild(el);

        el.select();

        document.execCommand('copy');
        
        alert("Copied Hash.");

      });
  }
  function setDetails() {
    var hash = localStorage.getItem("relativeHash");

      $("#hash").html(hash);

      var width = $('#hash').width();
      
      Minima.cmd("txpowinfo "+hash, function(res){

      // console.log(res);

      $("#nav-blocks").html("Block "+res.response.txpow.header.block);

      $("#height").html(res.response.txpow.header.block);

      if(res.response.txpow.isblock == true){

          $("#isblock").html("Yes");

      } else {

          $("#isblock").html("No");

      }

      $("#nonce").html(res.response.txpow.header.nonce);

      $("#cascadelevels").html(res.response.txpow.header.cascadelevels);

      $("#superparents-amnt").html(res.response.txpow.superblock);

      $("#timestamp").html(res.response.txpow.header.date.substring(4, 30));

      $("#header").html("Block "+ res.response.txpow.header.block);

      $("#outputs").html(res.response.txpow.body.txn.outputs.length);

      $("#inputs").html(res.response.txpow.body.txn.inputs.length);




      
      if(res.response.txpow.body.txn.inputs.length > 0 && res.response.txpow.body.txn.inputs[0].coinid == "0xFEED50FEED50FEED50FEED50" ){

        var tmpl = $.templates('#txn-template');

        var inputs = []; var outputs = []; var input_index; var output_index; var txn_index;
        var scripts = [];
        // get TXN input scripts
        $.each(res.response.txpow.body.witness.scripts, function(i, el){
          scripts.push({script_index: i, script: el.script, data: el.proof.data, hashbits: el.proof.hashbits, proofchain: el.proof.proofchain, chainsha: el.proof.chainsha, finalhash: el.proof.finalhash });
        });
        // get TXN inputs
        $.each(res.response.txpow.body.txn.inputs, function(i, el){
          inputs.push({input_index: i, inAddress: el.address, inAmount: el.amount, inTokenID: el.tokenid, inFloating: el.floating, inRemainder: el.remainder, scripts: scripts});
        });
        // get TXN outputs
        $.each(res.response.txpow.body.txn.outputs, function(i, el){
          outputs.push({output_index: i, outAddress: el.address, outAmount: el.amount, outTokenID: el.tokenid, outFloating: el.floating, outRemainder: el.remainder});
        });

        
        // create txn
        var txn = { txn_index: 0, inputs: inputs, outputs: outputs };

        // render
        var html = tmpl.render(txn);

        $('.collection').after(html);

      } else if(res.response.txpow.body.txn.inputs.length > 0){

        var tmpl = $.templates('#txn-template');

        var inputs = []; var outputs = []; var input_index; var output_index; var txn_index;
        var scripts = [];
        // get TXN input scripts
        $.each(res.response.txpow.body.witness.scripts, function(i, el){
          scripts.push({script_index: i, script: el.script, data: el.proof.data, hashbits: el.proof.hashbits, proofchain: el.proof.proofchain, chainsha: el.proof.chainsha, finalhash: el.proof.finalhash });
        });
        // get TXN inputs
        $.each(res.response.txpow.body.txn.inputs, function(i, el){
          inputs.push({input_index: i, inAddress: el.address, inAmount: el.amount, inTokenID: el.tokenid, inFloating: el.floating, inRemainder: el.remainder, scripts: scripts});
        });
        // get TXN outputs
        $.each(res.response.txpow.body.txn.outputs, function(i, el){
          outputs.push({output_index: i, outAddress: el.address, outAmount: el.amount, outTokenID: el.tokenid, outFloating: el.floating, outRemainder: el.remainder});
        });

        
        // create txn
        var txn = { txn_index: 0, inputs: inputs, outputs: outputs };
        // render
        var html = tmpl.render(txn);

        $('.collection').after(html);

        
      } else {

        $('.collection').after("<div class='row center'><a class='btn-small pulse tooltipped' data-html='true' data-position='right' data-tooltip='TEST'>Pulse TXN<i class='material-icons tip'>show_chart</i><i class='material-icons tip2' style='display:none;'>multiline_chart</i></a><p class='tip' style='display:none;'>This transaction is a Pulse, so it has no inputs and outputs.</p></div>");
      
        }


      });
  }
