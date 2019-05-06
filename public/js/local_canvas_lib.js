// Actions to be performed on client side graphe
// ========

// ================ EDGES MNGT ================

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

/*
function editEdgeWithoutDrag(data, callback) {
    // filling in the popup DOM elements
    saveEdgeData.bind(this, data, callback);
}
*/

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


function add_edge(data, callback){
    console.log("Added edge", data)

    if (data.from == data.to) {
        callback(null);
        return;
    }
    callback(data)

    // after each adding you will be back to addEdge mode
    network.addEdgeMode();
    new_edge_notify(data)
}
function edit_edge(data, callback){
    editEdgeWithoutDrag(data,callback);
}

function rem_edge(data, callback){
    console.log("Removed edge", data)
    callback(data)
    rem_edge_notify(data)
}

// ================ NODES MNGT ================

function add_node(data, callback){
    // filling in the popup DOM elements
    console.log('add', data);
}

/*
function edit_node(data, callback){
    // filling in the popup DOM elements
    console.log('edit', data);
}
*/

function edit_node(data, cancelAction, callback) {
      //console.log('edit', data);

      // Break if the node is not an anchor
      if(!is_node_in_list(data.id, anchor_list)){
        console.log("Not-anchor nodes can't be edited.");
        cancelNodeEdit(callback)
        return
      }

      // Set displayed data
      document.getElementById('node-operation').innerHTML = "Edit Node";
      document.getElementById('node-image').value = data.image;
      document.getElementById('node-label').value = data.label;
      // Set button functions
      document.getElementById('node-saveButton').onclick = saveNodeData.bind(this, data, callback);
      document.getElementById('node-cancelButton').onclick = cancelAction.bind(this, callback);
      document.getElementById('node-popUp').style.display = 'block';
}

function saveNodeData(data, callback) {
      data.label = document.getElementById('node-label').value;
      // Send update to server
      edit_node_notify(data)
      clearNodePopUp();
      callback(data);
}

function cancelNodeEdit(callback) {
      clearNodePopUp();
      callback(null);
}

// Callback passed as parameter is ignored
function clearNodePopUp() {
      document.getElementById('node-saveButton').onclick = null;
      document.getElementById('node-cancelButton').onclick = null;
      document.getElementById('node-popUp').style.display = 'none';
}

function rem_node(data, callback){
    // filling in the popup DOM elements
    console.log('rem', data);
}

// ================ CLICKS MNGT ================
function dragStart(params){
params.nodes.forEach(function(nodeId) {
        nodes_distri.update({id: nodeId, fixed: {x: false, y: false}});
    });
}

function dragEnd(params){
    params.nodes.forEach(function(nodeId) {
        if(nodes_distri.get(nodeId).is_fixed === true){
            nodes_distri.update({id: nodeId, fixed: {x: true, y: true}});
        }
    });
}

function doubleClick(params){
    params.nodes.forEach(function(nodeId) {
        if(nodes_distri.get(nodeId).is_fixed === true){
            nodes_distri.update({id: nodeId, fixed: {x: false, y: false}, is_fixed : false});
        } else {
            nodes_distri.update({id: nodeId, fixed: {x: true, y: true}, is_fixed : true});
        }
    });
}

function stabilizationProgress(params){
    var maxWidth = 496
    var minWidth = 20
    var widthFactor = params.iterations / params.total
    var width = Math.max(minWidth, maxWidth * widthFactor)

    document.getElementById('bar').style.width = width + 'px'
    document.getElementById('text').innerHTML =
      Math.round(widthFactor * 100) + '%'
}
function stabilizationIterationsDone(){
    document.getElementById('text').innerHTML = '100%'
    //document.getElementById('bar').style.width = '496px'
    document.getElementById('loadingBar').style.opacity = 0
    // really clean the dom element
    setTimeout(function() {
      document.getElementById('loadingBar').style.display = 'none'
    }, 500)
}


// ================ KEYBOARD MNGT ================
function handle_key_pressed(evt){
    if (evt.target !== undefined && $(evt.target).is('input')) {
	    console.log("Strange key pressed catched")
        return;
    }

    console.log("Key pressed : " + evt.keyCode)

    switch(evt.keyCode) {

    // TODO : bug when M after downloading json
    case 77: // m
        var selected_id = network.getSelectedNodes();
        do_complete_graph(selected_id)
        break;

    case 67: // c for cluster
        var selected_id = network.getSelectedNodes();
        do_cluster(evt, selected_id)
        break;

    default:
        break;
    }
}
