  // INIT Tabulator blocks-table..
  var table;
  function initTable() {
    $(document).ready(function(){
      Minima.sql("SELECT * from txpowlist WHERE ISBLOCK = 1 ORDER BY HEIGHT DESC LIMIT 100", function(res){
        // Create a tabulator instance, and refer it to the div canvas
        table = new Tabulator("#example-table", {
          maxHeight: "660",
          layout: "fitColumns",
          resizableColumns: false,
          responsiveLayout:true,
          headerSort: false,
          index:"HEIGHT",
          columns:[

            {title:"TxPoW", field:"TXPOW", visible: false},

            {title: "Height", field: "HEIGHT", sorter: "number", headerSortStartingDir:"desc", width: 65, widthShrink:2, cssClass: "height-column"},

            {title: "Hash", field: "HASH", formatter:function(cell, formatterParams){
              var hash = cell.getData();
              // hash = hash.HASH.substring(0, 15) + "..." + hash.HASH.substring(hash.HASH.length-80, hash.HASH.length);
              hash = hash.HASH;
              return hash;
            }},
            {title: "isblock", field:"isblock", visible: false},

            {title: "TXNS", field:"TXNS", width:50, widthShrink:3, hozAlign: "center"},

            {title: "Relayed", field:"RELAYED", width: 110, hozAlign: "left", formatter:function(cell, formatterParams){
                var time = cell.getData();
                time = moment(time.RELAYED*1000).format("HH:mm:ss");
                // time = new Date(parseInt(time.RELAYED*1000, 10)).toISOString();
                // time = moment(time).fromNow();
                return time;
            }},

          ],
          rowClick:function(e, row){

            var clicked_row = row._row.data;
          
            window.location.href = './details.html?txpow='+clicked_row.HASH;

            return false;
          },
        });
        
        var temp = [];
        // Loop through the json rows arr and add..
        $.each(res.response.rows, function(i, el){
          temp.push(el);
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

      /** SEARCH BUTTON CLICK LISTENER */
      $("#searchBtn").on("click", function(){
        
        var query = $("#search-input").val();

        if(query.length == 0) {
          
          setTimeout(function() {

            M.toast({html:"Nothing found."});

          }, 2000);

        } else {
          
          window.location.href = "./search.html?query="+query;

          return false;
          
        }

        
      });

      // ENTER KEY SEARCH
      $('#search-input').keypress(function(event){

        var keycode = (event.keyCode ? event.keyCode : event.which);

        if(keycode == '13'){

          var query = $("#search-input").val();

          if(query.length == 0) {
          
            setTimeout(function() {
  
              M.toast({html:"Nothing found."});
  
            }, 2000);
  
          } else {
            
            window.location.href = "./search.html?query="+query;
  
            return false;
            
          }
        }
        event.stopPropagation();
      });
    });
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



});

function darkmode() {
  // check for mode
  if(localStorage.getItem('mode') == 'dark'){

  $('body').addClass("dark");

  } else if (localStorage.getItem('mode') == 'light') {

    $('body').removeClass("dark");

  }

  }

  function copy(id) {
    var textToCopy = document.getElementById(id).innerText;

    var temporaryInputElement = document.createElement("input");
    temporaryInputElement.type = "text";
    temporaryInputElement.value = textToCopy;

    document.body.appendChild(temporaryInputElement);

    temporaryInputElement.select();
    document.execCommand("Copy");

    M.toast({html: "Copied to clipboard."});

    document.body.removeChild(temporaryInputElement);
    
  }

  function setDetails(txpow) {
    $(document).ready(function() {
    
    txpow = JSON.parse(txpow.response.rows[0].TXPOW);

    console.log(txpow);

    $("#hash").html(txpow.txpowid);

    $("#nav-blocks").html("Block "+txpow.header.block);

    $("#height").html(txpow.header.block);

    if(txpow.isblock == true){

        $("#isblock").html("Yes");

    } else {

        $("#isblock").html("No");

    }

    $("#nonce").html(txpow.header.nonce);

    $("#superparents-amnt").html(txpow.superblock);

    var time = moment(txpow.header.timesecs*1000).format("DD MMMM YYYY HH:MM a");

    $("#timestamp").html(time);

    $("#header").html("Block "+ txpow.header.block);

    $("#outputs").html(txpow.body.txn.outputs.length);

    $("#inputs").html(txpow.body.txn.inputs.length);

    $("#txns").html(txpow.body.txnlist.length);

    $("#size").html(txpow.size);

    $("#parent").html(txpow.header.superparents[0].parent);

    var state = txpow.body.txn.state;
    if(state.length > 0 && state[0].data == '01000100') {
      $('#msg').css("display", "block");
      $('#message').html(state[1].data);
    }

    if(txpow.body.txn.inputs.length > 0){

      var tmpl = $.templates('#txn-template');

      var inputs = []; var outputs = []; var input_index; var output_index; var txn_index;
      var scripts = [];
      // get TXN input scripts
      $.each(txpow.body.witness.scripts, function(i, el){
        scripts.push({script_index: i, script: el.script, data: el.proof.data, hashbits: el.proof.hashbits, proofchain: el.proof.proofchain, chainsha: el.proof.chainsha, finalhash: el.proof.finalhash });
      });
      // get TXN inputs
      $.each(txpow.body.txn.inputs, function(i, el){
        inputs.push({input_index: i, inAddress: el.address, inAmount: el.amount, inTokenID: el.tokenid, inFloating: el.floating, inRemainder: el.remainder, scripts: scripts});
      });
      // get TXN outputs
      $.each(txpow.body.txn.outputs, function(i, el){
        outputs.push({output_index: i, outAddress: el.address, outAmount: el.amount, outTokenID: el.tokenid, outFloating: el.floating, outRemainder: el.remainder});
      });

      
      // create txn
      var txn = { txn_index: 0, inputs: inputs, outputs: outputs };

      // render
      var html = tmpl.render(txn);

      $('.collection').after(html);

    } else if(txpow.body.txn.inputs.length > 0 && txpow.body.txnlist.length > 0){

      var tmpl = $.templates('#txn-template');
      var tmpl_txnlist = $.templates('#txnlist-template');

      var inputs = []; var outputs = [];var txnlist = []; var input_index; var output_index; var txn_index;
      var scripts = [];
      // get TXN input scripts
      $.each(txpow.body.witness.scripts, function(i, el){
        scripts.push({script_index: i, script: el.script, data: el.proof.data, hashbits: el.proof.hashbits, proofchain: el.proof.proofchain, chainsha: el.proof.chainsha, finalhash: el.proof.finalhash });
      });
      // get TXN inputs
      $.each(txpow.body.txn.inputs, function(i, el){
        inputs.push({input_index: i, inAddress: el.address, inAmount: el.amount, inTokenID: el.tokenid, inFloating: el.floating, inRemainder: el.remainder, scripts: scripts});
      });
      // get TXN outputs
      $.each(txpow.body.txn.outputs, function(i, el){
        outputs.push({output_index: i, outAddress: el.address, outAmount: el.amount, outTokenID: el.tokenid, outFloating: el.floating, outRemainder: el.remainder});
      });
      $.each(txpow.body.txnlist, function(i, el){
        txnlist.push({index:i, hash: el});
      });

      // create txn
      var txn = { txn_index: 0, inputs: inputs, outputs: outputs };
      // render
      var html = tmpl.render(txn);

      // create txnlist 
      var txnlist = { txnlist: txnlist};

      var html_txnlist = tmpl_txnlist.render(txnlist);

      $('.collection').after(html);
      $('.collection').after(html_txnlist);

      
    } else if(!txpow.body.txn.inputs.length > 0 && txpow.body.txnlist.length > 0){
      var txnlist = [];
      var tmpl_txnlist = $.templates('#txnlist-template');

      $.each(txpow.body.txnlist, function(i, el){
        txnlist.push({index:i, hash: el});
      });

      localStorage.setItem("txnlist", JSON.stringify(txnlist));

      // create txnlist 
      var txnlist = { txnlist: txnlist };
      // render inside the template
      var html_txnlist = tmpl_txnlist.render(txnlist);
      // add it to html
      $('.collection').after(html_txnlist);
    
    } else {

      $('.collection').after("<div class='row center'><a class='btn-small pulse tooltipped' data-html='true' data-position='right' data-tooltip='TEST'>Pulse TXN<i class='material-icons tip'>show_chart</i><i class='material-icons tip2' style='display:none;'>multiline_chart</i></a><p class='tip' style='display:none;'>This transaction is a Pulse, so it has no inputs and outputs.</p></div>");
    
      }

    });

  }

  // txn-details functions 
  function setTXNDetails(index, prev, txpow) {

    // parse txpow 
    $('#txn-header').html("TXN #"+index);
    $('#nav-blocks').html("Block "+prev);
    $('#nav-txn').html("TXN #"+index);
    $('#hash').html(txpow.txpowid);
    //moment.js format time
    var time = moment(txpow.header.timesecs*1000).format("DD MMMM YYYY HH:MM a");
    $('#received').html(time);
    $('#nonce').html(txpow.header.nonce);
    $('#size').html(txpow.size);
    $('#block').html(txpow.header.block);
    $('#inputs').html(txpow.body.txn.inputs.length);
    $('#outputs').html(txpow.body.txn.outputs.length);
    $('#txns').html(txpow.body.txnlist.length);
    $('#parent').html(txpow.header.superparents[0].parent);

    if(txpow.isblock == true) {
      $('#isblock').html("Yes");
    } else {
      $('#isblock').html("No");
    }
    var state = txpow.body.txn.state;
    if(state.length > 0 && state[0].data == '01000100') {
      $('#msg').css("display", "block");
      $('#message').html(state[1].data);
    }

    var inputs = []; var outputs = [];var scripts = [];
    if(txpow.body.txn.inputs.length > 0) {

      $.each(txpow.body.witness.scripts, function(i, el){
        scripts.push({script_index: i, script: el.script, data: el.proof.data, hashbits: el.proof.hashbits, proofchain: el.proof.proofchain, chainsha: el.proof.chainsha, finalhash: el.proof.finalhash });
      });
      // get TXN inputs
      $.each(txpow.body.txn.inputs, function(i, el){
        inputs.push({input_index: i, inAddress: el.address, inAmount: el.amount, inTokenID: el.tokenid, inFloating: el.floating, inRemainder: el.remainder, scripts: scripts});
      });
      // get TXN outputs
      $.each(txpow.body.txn.outputs, function(i, el){
        outputs.push({output_index: i, outAddress: el.address, outAmount: el.amount, outTokenID: el.tokenid, outFloating: el.floating, outRemainder: el.remainder});
      });

      var tmpl = $.templates('#txn-template');

      arr = { txn_index: 0, inputs: inputs, outputs: outputs };

      var html = tmpl.render(arr)

      $('#details').after(html);
    
    }

  }