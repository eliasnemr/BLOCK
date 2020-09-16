
  // INIT Tabulator blocks-table.. 
  function initTable() {
    $(document).ready(function(){
      Minima.sql("SELECT * from blocks", function(res){
        
        console.log(res);
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

              {title:"txpow", field:"txpow", visible: false},

              {title: "Height", field: "HEIGHT", sorter: "number", width: 65, widthShrink:2, cssClass: "height-column"},

              {title: "Hash", field: "HASH", formatter:function(cell, formatterParams){
                var hash = cell.getData();
                hash = hash.HASH.substring(0, 15) + "..." + hash.HASH.substring(hash.HASH.length-80, hash.HASH.length);
                return hash;
              }},
              {title: "TXNS", field:"TXNS", width:50, widthShrink:3},

              {title: "Relayed", field:"RELAYED", width: 110, formatter:function(cell, formatterParams){
                  var time = cell.getData();
                  time = new Date(parseInt(time.RELAYED*1000, 10)).toISOString();
                  time = moment(time).fromNow();
                  return time;
              }},

            ],
            rowClick:function(e, row){

              var clicked_row = row._row.data;

              console.log(row._row.data);
            
              // add to localStorage to pass to details.html..
              localStorage.setItem("txpow", clicked_row.TXPOW);

              window.location.href = './details.html?'+clicked_row.HEIGHT;

              return false;

            },
          });
        
          var temp = [];
          var connected = 0;
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

          
      });
    });
  }

  function filterData(query) {
    $("#searchBtn").on("click", function(){

      table.setFilter(
        {field:"HEIGHT", type:"=", value:query},
      )

    });
  }
  
/** Update Tabulator Table with new blocks */
  function updateTableData() {
    
    $(document).ready(function(){

        Minima.sql("SELECT * FROM blocks ORDER BY HEIGHT DESC", function(res){

          // Loop through the json rows arr and add..
          var temp = []; 

          $.each(res.response.rows, function(i, el){
              
              temp.push(el);        
       
          });
          /** SET Data to the Tabulator REF as a promise */
          table.replaceData(temp)
          .then(function(){

              //run code after table has been successfully updated
              console.log("TABULATOR: Added new data to the Table");

          })
          .catch(function(error){
              //handle error loading data
              console.log(error);
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

  $("#searchBtn").on("click", function(){
        
    var addr = $("#search-input").val().toLowerCase();
        // quit exit if nothing
        if(addr.length == ""){

          $('#example-table').fadeIn(100);

          $('#results-table').fadeOut(100);

  }


  table.setFilter(
    "HEIGHT", "=", addr
  );

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
  // Stop the event from propogation to other handlers
  // If this line will be removed, then keypress event handler attached 
  // at document level will also be triggered
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
                hash = hash.HASH.substring(0, 15) + "..." + hash.HASH.substring(hash.HASH.length-60, hash.HASH.length);
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
        
        M.toast({html:"Copied Hash"});

      });
  }
  function setDetails() {

    var txpow = localStorage.getItem("txpow");

    txpow = JSON.parse(txpow);

    console.log(txpow);

      $("#hash").html(txpow.txpowid);

      // console.log(res);

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
      
      if(txpow.body.txn.inputs.length > 0 && txpow.body.txn.inputs[0].coinid == "0xFEED50FEED50FEED50FEED50" ){

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

  }

  // txn-details functions 

  function setTXNDetails(index, block) {
    $('#nav-blocks').html(block);
    $('#nav-txn').html("TXN #"+ index); 
    $('#txn-header').html("TXN #"+index);

    var txnlist = localStorage.getItem('txnlist');
    var txnlist = JSON.parse(txnlist);

    Minima.cmd('txpowinfo '+ txnlist[index].hash, function(res){
      
      $('#hash').html(res.response.txpow.txpowid);
      //moment.js format time
      var time = moment(res.response.txpow.header.timesecs*1000).format("DD MMMM YYYY HH:MM a");
      $('#received').html(time);
      $('#nonce').html(res.response.txpow.header.nonce);
      $('#size').html(res.response.txpow.size);
      $('#block').html(res.response.inblock);
      var state = res.response.txpow.body.txn.state;
      if(state.length > 0 && state[0].data == '01000100') {
        $('#msg').css("display", "block");
        $('#message').html(state[1].data);
      }

      var inputs = []; var outputs = [];var scripts = [];
      if(res.response.txpow.body.txn.inputs.length > 0) {

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

        var tmpl = $.templates('#txn-template');

        arr = { txn_index: 0, inputs: inputs, outputs: outputs };

        var html = tmpl.render(arr)

        $('#details').after(html);

      }



    });

  }