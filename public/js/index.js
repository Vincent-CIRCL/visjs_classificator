/* global vis  */
var socket;
var incoming_network;
var network;
var exportArea;
var data;
// Formatting : https://stackoverflow.com/questions/40096121/is-it-possible-to-format-beautify-javascript-in-pycharm



/*
var toggle = false;

function toggle_nodes_view(){
    data.nodes.forEach(function(nodeD) {
        nodeD.update()

    });

}

network.on("click", function(e) {
  tw_id = 1205;
  if (e.nodes[0] == tw_id) {
    nodes.update([
      {id: 2021, hidden: toggle},
      {id: 2047, hidden: toggle}
    ]);
    edges.update([
      {id: 'e3', hidden: toggle},
      {id: 'e4', hidden: toggle}
    ]);
    network.fit();
    // switch toggle
    toggle = !toggle;

*/

// ======================= ------------------- =======================
//                     SERVER RELATION MANAGEMENT

function launch_client() {
    // Initate connection to server
    init_connection()

    // Ask for a new json from the input file
    load_new_json()
}

function init_connection(){
  socket = io();

  socket.on('answer_json', function(parsed_content) {
        console.log(parsed_content)
        // Store it
        incoming_network = parsed_content;
        draw()
    });

  socket.on('add_edge', function(message) {
        console.log(message)
        data.edges.add([{id: message.id, from: message.from, to: message.to}])
    });

  socket.on('rem_edge', function(message) {
        console.log(message)
        console.log(data)
        console.log(data.edges)
        console.log(data.edges._data)
        data.edges.remove(message.id)
    });
}

function load_new_json(){
    socket.emit('ask_json', 'new');
    document.getElementById('text').innerHTML = 'Waiting for server'
}

function load_json(){
    socket.emit('ask_json', 'file_NAME'); //TODO : TO COMPLETE
}

function new_edge_notify(curr_data){
    var tmp_data = {}
    tmp_data.type = "add"
    // Fill the id and the information of the edge to propagate
    tmp_data.id = curr_data.id
    tmp_data.to = curr_data.to
    tmp_data.from = curr_data.from

    console.log(tmp_data)
    socket.emit('add_edge', tmp_data);
}

function rem_edge_notify(curr_data){
    var tmp_data = {}
    tmp_data.type = "rem"

    //Fill the id of the removed edge to propagate
    //TODO : Not only the first one ? May many be deleted at the same time ?
    console.log(curr_data)
    tmp_data.id = curr_data.edges[0]

    console.log(tmp_data)
    socket.emit('rem_edge', tmp_data);
}

function ask_json_export(){
}

function new_node_notify(data){
    console.log("How did you managed to add a node without picture ? Oo")
}

function rem_node_notify(data){
    console.log("Why did you deleted a node ? Oo")
}

/*
function editEdgeWithoutDrag(data, callback) {
    // filling in the popup DOM elements
    saveEdgeData.bind(this, data, callback);
}
*/


// ======================= ------------------- =======================
//                     EDGE MODIFICATION HANDLING
function editEdgeWithoutDrag(data, callback) {
  // filling in the popup DOM elements
  document.getElementById('edge-label').value = data.id
  document.getElementById('edge-saveButton').onclick = saveEdgeData.bind(
    this,
    data,
    callback
  )
  document.getElementById('edge-cancelButton').onclick = cancelEdgeEdit.bind(
    this,
    callback
  )
  document.getElementById('edge-popUp').style.display = 'block'
}

function cancelEdgeEdit(callback) {
  clearEdgePopUp()
  callback(null)
}

function saveEdgeData(data, callback) {
    if (typeof data.to === 'object')
        data.to = data.to.id
    if (typeof data.from === 'object')
        data.from = data.from.id
        clearEdgePopUp();
        callback(data);
}
// ======================= ------------------- =======================
//                     EXPORT FUNCTION TO JSON (CLIENT)

function export_json(){
    var jsonData = graph_to_JSON();
    trigger_file_download(jsonData, 'json');
}

function graph_to_JSON() {
        var nodeData = [];
        var edgeData = [];

        data.nodes.get().forEach(function(nodeD) {
            tmp_node = {}
            // Add attributes of a node to the new list
            tmp_node.id = nodeD.id
            tmp_node.shape = nodeD.shape
            tmp_node.image = nodeD.image

            // Store the node in the list to be exported
			nodeData.push(tmp_node);
			});

        data.edges.get().forEach(function(edge) {
            tmp_edge = {}
            // Add attributes of a node to the new list
            tmp_edge.to = edge.to
            tmp_edge.from = edge.from

            // Store the node in the list to be exported
			edgeData.push(tmp_edge);
			});

        var to_export = {}
        to_export.nodes = nodeData
        to_export.edges = edgeData

        console.log(to_export)

		var jsonData = JSON.stringify(to_export);
		return jsonData;
	}

function trigger_file_download(data, type) {
	var dataUri;
	var filename = 'graphExport_'+ parseInt(new Date().getTime()/1000);
	if (type == 'json') {
		dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(data);
		filename +=  '.json';
	} else if (type == 'png' || type == 'jpeg') {
		dataUri = data;
		filename +=  type;
	} else if (type == 'dot') {
		dataUri = 'data:text/x-graphviz;charset=utf-8,' + encodeURIComponent(data);
		filename +=  '.dot';
	} else {
	    console.log("Error during download : no type specified. JSON chosen by default.")
		dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(data);
		filename +=  '.json';
	}
	var a = document.createElement('a');
	a.setAttribute('href', dataUri);
	a.setAttribute('download', filename);

	var aj = $(a);
	aj.appendTo('body');
	aj[0].click();
	aj.remove();
}

// ======================= ------------------- =======================

function draw(){
  // create a network
  var container = document.getElementById('mynetwork')
  exportArea = document.getElementById('input_output')

  var nodes_distri = new vis.DataSet(incoming_network["nodes"]);
  var edges_distri = new vis.DataSet(incoming_network["edges"]);

  /*
  var data = {
    nodes: incoming_network["nodes"],
    edges: incoming_network["edges"]
  }
  */

  // Assign nodes and edges to the data to ne displayed
  data = {
    nodes: nodes_distri,
    edges: edges_distri
  }

  var options = {
    nodes: {
      shapeProperties: {
        interpolation: false    // 'true' for intensive zooming https://github.com/almende/vis/issues/2952
      },
      borderWidth: 4,
      size: 30,
      color: {
        border: '#406897',
        background: '#6AAFFF'
      },
      font: { color: '#eeeeee' },
      shapeProperties: {
        interpolation: false,
        useBorderWithImage: true,
      }
    },
    edges: {
      color: 'lightgray'
    },
    manipulation: {
          enabled: true,
          addNode: function (data, callback) {
              // filling in the popup DOM elements
              console.log('add', data);
          },
          editNode: function (data, callback) {
              // filling in the popup DOM elements
              console.log('edit', data);
          },
          addEdge: function (data, callback) {
            console.log("Added edge")
            console.log(data)

            if (data.from == data.to) {
               callback(null);
               return;
            }
            callback(data)

            // after each adding you will be back to addEdge mode
            network.addEdgeMode();
            new_edge_notify(data)
          },
          editEdge: {
            editWithoutDrag: function(data, callback) {
              editEdgeWithoutDrag(data,callback);
            }
          },
          deleteEdge: function (data, callback) {
            console.log("Removed edge")
            console.log(data)
            callback(data)
            rem_edge_notify(data)
          }
          // http://visjs.org/docs/data/dataset.html#Data_Manipulation
     },
    physics: {
        adaptiveTimestep: true,
        stabilization: {
            enabled: true, // Show or not show during calculation on load
            iterations: 1000,
            updateInterval: 25
        },
        barnesHut: {
            gravitationalConstant: -2000,
            springConstant: 0.01,// 0.2,
            springLength: 45 // 200
        }
    },
    interaction: {
        multiselect: true
    },
    layout: {
        improvedLayout: false
    }, configure: {
      filter: function(option, path) {
        if (path.indexOf('physics') !== -1) {
          return true
        }
        if (path.indexOf('smooth') !== -1 || option === 'smooth') {
          return true
        }
        /*
        if (option === 'hideEdgesOnDrag') {
          return true
        }
        if (option === 'hideNodesOnDrag') {
          return true
        }*/
        return false
      },
      container: document.getElementById('config')
    }
  }


  network = new vis.Network(container, data, options)

  network.on("dragStart", function (params) {
    params.nodes.forEach(function(nodeId) {
        nodes_distri.update({id: nodeId, fixed: {x: false, y: false}});
    });
  });
  network.on("dragEnd", function (params) {
    params.nodes.forEach(function(nodeId) {
        if(nodes_distri.get(nodeId).is_fixed === true){
            nodes_distri.update({id: nodeId, fixed: {x: true, y: true}});
        }
    });
  });
  network.on("doubleClick", function (params) {
    params.nodes.forEach(function(nodeId) {
        if(nodes_distri.get(nodeId).is_fixed === true){
            nodes_distri.update({id: nodeId, fixed: {x: false, y: false}, is_fixed : false});
        } else {
            nodes_distri.update({id: nodeId, fixed: {x: true, y: true}, is_fixed : true});
        }
    });
  });

   //======================= ------------------------- =======================
   // Handling loader bar

   network.on('stabilizationProgress', function(params) {
    var maxWidth = 496
    var minWidth = 20
    var widthFactor = params.iterations / params.total
    var width = Math.max(minWidth, maxWidth * widthFactor)

    document.getElementById('bar').style.width = width + 'px'
    document.getElementById('text').innerHTML =
      Math.round(widthFactor * 100) + '%'
  })
  network.once('stabilizationIterationsDone', function() {
    document.getElementById('text').innerHTML = '100%'
    //document.getElementById('bar').style.width = '496px'
    document.getElementById('loadingBar').style.opacity = 0
    // really clean the dom element
    setTimeout(function() {
      document.getElementById('loadingBar').style.display = 'none'
    }, 500)
  })


  // ============== -------------- =======================
  // Add listener on keyboard, on the full page
  // TODO : bug when M after downloading json
  $(document).on("keydown", function(evt) {
			if (evt.target !== undefined && $(evt.target).is('input')) {
				console.log("Strange key pressed catched")
				return;
			}

			console.log("Key pressed : " + evt.keyCode)

			switch(evt.keyCode) {

				case 77: // m
					var selected_id = network.getSelectedNodes();
                    do_complete_graph(selected_id)
					break;

				default:
					break;
			}
		});


  /*
  network.on('doubleClick', function(params) {
    nodes_distri.forEach(nodes, function(item) {
        item.hidden = true;
    });
  });
  */

    /* oncontext (right click)
  network.on('oncontext', function(obj){

      var nodeId = this.getNodeAt(obj.pointer.DOM);
      console.log(nodeId)

      nodeId = obj.nodes[0];      // the node id that getNodeAt() should be returning
      console.log(nodeId)
  });
    */


}

function get_edge_between_nodes(node1,node2) {

    var tmp_edge_list = network.getConnectedEdges(node1)
    //console.log("Edge between nodes : " + node1 + " and " + node2)
    //console.log(tmp_edge_list)

    var tmp_table = []
    for(i =0 ; i < tmp_edge_list.length ; i ++){

        var tmp_edge = data.edges.get(tmp_edge_list[i])

        if(tmp_edge.to === node2){ // Node1 already verified by construction
            tmp_table.push(tmp_edge)
        }
    }

    //console.log("tmp_table")
    //console.log(tmp_table)
    return tmp_table

    // too complex
    // return data.edges.get().filter(function (edge) {
    //    return (edge.from === node1 && edge.to === node2 )|| (edge.from === node2 && edge.to === node1);
    //});
};

function do_complete_graph(node_list){

    for(var i = 0; i < node_list.length; i++) {
        for(var j = 0; j < node_list.length; j++) {

            // Get nodes id
            var id_from = node_list[i]
            var id_to = node_list[j]
            //console.log(id_from, id_to)

            // If not itself and no link between both nodes, we create one
            if(id_from !== id_to && get_edge_between_nodes(id_from, id_to).length == 0){
                // Locally add edge
                var tmp_id = data.edges.add([{from: id_from, to: id_to}])[0]

                //console.log(tmp_id)
                //console.log(data.edges.get(tmp_id))

                // Notify about the adding
                new_edge_notify(data.edges.get(tmp_id))
            }

            //console.log("Edge between nodes result : ")
            //console.log(get_edge_between_nodes(id_from, id_to))

            // Else do nothing


        }
    }

}


/* ///////////////// COMMANDS \\\\\\\\\\\\\\\\\
RIGHT CLIC (on node) = Move node (and won't fix his position)
RIGHT CLIC (on background) = Move view
LEFT CLIC (on node) = Add edge
Double CLIC (on node) = Fix position of the node

*/