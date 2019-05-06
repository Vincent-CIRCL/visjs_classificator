// Actions to be performed on client side
// ========

class Notifier {

  constructor(socket) {
    this.socket = socket;
  }

}

// ================ JSON MNGT ================

function request_json(socket) {
    socket.emit('ask_json', 'new');
    document.getElementById('text').innerHTML = 'Waiting for server'
}

function send_json(socket){
    // Request the loading of this particular json file on server-side
    //TODO : TO COMPLETE
    socket.emit('ask_json', 'file_NAME');
}

function request_export(socket){
    // Request the exportation of the json file on server-side
    //TODO : TO COMPLETE
}

// ================ ACTION NOTIFY ================

function new_edge_notify(curr_data){
    console.log("new_edge_notify", curr_data)

    /*
    var tmp_data = {}
    tmp_data.type = "add"
    // Fill the id and the information of the edge to propagate
    tmp_data.id = curr_data.id
    tmp_data.to = curr_data.to
    tmp_data.from = curr_data.from
    tmp_data.hidden = curr_data.hidden
    */

    console.log("New edge notify : ", curr_data)
    socket.emit('add_edge', curr_data);
}

function rem_edge_notify(curr_data){
    /*
    var tmp_data = {}
    tmp_data.type = "rem"

    //Fill the id of the removed edge to propagate
    //TODO : Not only the first one ? May many be deleted at the same time ?
    tmp_data.id = curr_data.edges[0]
    */

    console.log("Remove edge notify : ", curr_data)
    socket.emit('rem_edge', curr_data);
}

function new_node_notify(curr_data){

    /*
    //console.log(curr_data)

    var tmp_data = {}
    tmp_data.type = "add"
    tmp_data.id = curr_data.id

    //console.log(tmp_data)
    */

    console.log("New node notify : ", curr_data)
    socket.emit('add_node', curr_data);
}

function edit_node_notify(curr_data){

    /*
    //console.log(curr_data)

    var tmp_data = {}
    tmp_data.type = "add"
    tmp_data.id = curr_data.id

    //console.log(tmp_data)
    */

    console.log("Edit node notify : ", curr_data)
    socket.emit('edit_node', curr_data);
}


/*
to be sent data to edit node
    tmp_anchor =
        {
            shape: "image",             // Image shape to display a small anchor
            size:10,                    // Prevent too big pictures
            image: "anchor.png",        // Link to the anchor
            group : "anchor",           // It is an anchor and will be treated as so
            label: "anchor",            // Label of the node
            fixed: {x: pageX, y: pageY},// Fixed position
            is_fixed : true             // Prevent auto-move (consistent with the doubleclick behavior)
        }
*/

/*
function new_anchor_notify(curr_data){
    //console.log("New anchor to notify : ", curr_data)

    var tmp_data = {}
    tmp_data.type = "add_anchor"
    tmp_data.id = curr_data.id
    tmp_data.shape = curr_data.shape
    tmp_data.size = curr_data.size
    tmp_data.image = curr_data.image
    tmp_data.label = curr_data.label
    tmp_data.group = curr_data.group
    tmp_data.fixed = curr_data.fixed
    tmp_data.is_fixed = curr_data.is_fixed
    tmp_data.fixed.x = curr_data.fixed.x
    tmp_data.fixed.y = curr_data.fixed.y

    //console.log(tmp_data)
    console.log("New anchor notify : ", tmp_data)
    socket.emit('add_anchor', tmp_data);
}

function edit_anchor_notify(curr_data){
    console.log("to be sent data to edit node", curr_data)

    var tmp_data = {}
    tmp_data.type = "edit_anchor"
    tmp_data.id = curr_data.id
    tmp_data.shape = curr_data.shape
    tmp_data.size = curr_data.size
    tmp_data.image = curr_data.image
    tmp_data.label = curr_data.label
    tmp_data.fixed = curr_data.fixed
    tmp_data.is_fixed = curr_data.is_fixed

    //console.log(tmp_data)
    console.log("Edit anchor notify : ", tmp_data)
    socket.emit('edit_anchor', tmp_data);
}

function rem_node_notify(data){
    console.log("Why did you deleted a node ? Oo")
    console.log("to be sent data to remove node", curr_data)

    var tmp_data = {}
    tmp_data.type = "rem_anchor"
    tmp_data.id = curr_data.id

    //console.log(tmp_data)
    console.log("Remove node notify : ", tmp_data)
    socket.emit('rem_anchor', tmp_data);
}

*/