// ================ STD IMPORTS ================
var socket;
var incoming_network;
var network;
var exportArea;
var data;

// ================ OWN IMPORTS ================
// Handled in HTML

// ================ SERVER RELATION MANAGEMENT ================
function launch_client() {
    // Initate connection to server
    socket = io();

    // Handle events received from server (and so other users)
    socket.on('answer_json', function(message) { load_json(message) });

    socket.on('add_edge', function(message) { add_edge_from_server(message) });
    socket.on('rem_edge', function(message) { rem_edge_from_server(message) });

    socket.on('add_node', function(message) { add_node_from_server(message) });
    socket.on('edit_node', function(message) { edit_node_from_server(message) });

    /* socket.on('add_anchor', function(message) { add_anchor_from_server(message) });
    socket.on('edit_anchor', function(message) { edit_anchor_from_server(message) });
    socket.on('rem_anchor', function(message) { rem_anchor_from_server(message) }); */

    // Ask for a new json from the input file
    request_json(socket)

}


// ======================= ------------------- =======================

var nodes_distri    // Nodes to be displayed on the network
var edges_distri    // Edges to be displayed on the network
var container       // The network container

function draw(){
  // create a network
  container = document.getElementById('mynetwork')
  exportArea = document.getElementById('input_output')

  nodes_distri = new vis.DataSet(incoming_network["nodes"]);
  edges_distri = new vis.DataSet(incoming_network["edges"]);

  // Assign nodes and edges to the data to be displayed
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
    groups: {
      "anchor": { color: 'red', mass: 1 },// try to change this value
    },
    manipulation: {
          // http://visjs.org/docs/data/dataset.html#Data_Manipulation
          enabled: true,

          addNode: function (data, callback) { add_node(data, callback) },
          editNode: function (data, callback) { edit_node(data, cancelNodeEdit, callback) },
          deleteNode: false,

          addEdge: function (data, callback) { add_edge(data, callback) },
          editEdge: {
            editWithoutDrag:
                function(data, callback) { edit_edge(data, callback) }
          },
          deleteEdge: function (data, callback) { rem_edge(data, callback) },
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
    },
    configure: {
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

  network.on("dragStart", function (params) { dragStart(params) });
  network.on("dragEnd", function (params) { dragEnd(params) });
  network.on("doubleClick", function (params) { doubleClick(params) });

  // ============== -------------- =======================
  // Handling loader bar
  network.on('stabilizationProgress', function(params) { stabilizationProgress(params) });
  network.once('stabilizationIterationsDone', function() { stabilizationIterationsDone() });

  // ============== -------------- =======================
  // Add listener on keyboard, on the full page
  $(document).on("keydown", function(evt) { handle_key_pressed(evt) });

  // ============== -------------- =======================
  // Add a listener to open the options with a button
  document.getElementById('options_collapse').addEventListener("click", function() {event_collapse_listener(document.getElementById('config'))})
  // Handle selection rectangle
  makeMeMultiSelect(container, network, nodes_distri);
  make_rectangle_with_anchors(container, network, nodes_distri);
}

/* ///////////////// COMMANDS \\\\\\\\\\\\\\\\\
RIGHT CLIC (on node) = Move node (and won't fix his position)
RIGHT CLIC (on background) = Move view
LEFT CLIC (on node) = Add edge
Double CLIC (on node) = Fix position of the node
*/

// Formatting : https://stackoverflow.com/questions/40096121/is-it-possible-to-format-beautify-javascript-in-pycharm