// Actions to be performed on client side
// ========

function load_json(parsed_content) {
        console.log("Received initial JSON : ", parsed_content)

        // Store it
        incoming_network = parsed_content;

        // Parse anchors and store their id for fast retrieval
        add_anchors_to_global_storage(incoming_network["nodes"])

        console.log("Anchor list received : ", anchor_list)

        draw();
}

function add_anchors_to_global_storage(list_nodes){
    for( var i = 0; i< list_nodes.length; i++){

        if(list_nodes[i].group == "anchor"){
            console.log("Anchor node to be in global storage ... ")
            anchor_list.push(list_nodes[i].id);
        }
    }
}

/*
    tmp_node =
        {
            id : message.id,            // The generated id of the node
            shape: message.shape,       // Image shape to display a small anchor
            size: message.size,         // Prevent too big pictures
            image: message.image,       // Link to the anchor
            group : message.group,      // It is an anchor and will be treated as so
            label: message.label,       // Label of the node
            is_fixed : message.is_fixed // Prevent auto-move (consistent with the doubleclick behavior)
        }
*/

function add_node_from_server(message){
    console.log("Added node (server emit)", message)

    // If an anchor, add it to global storage
    add_anchors_to_global_storage([message])

    // Add the node to the network
    data.nodes.add([message])
}

function edit_node_from_server(message){
    console.log("Modified node (server emit)", message)

    data.nodes.update([message])
}

function add_edge_from_server(message){
    console.log("Added edge (server emit)", message)

    /*
    tmp_edge = {id: message.id, from: message.from, to: message.to}

    if (message.hidden){
        tmp_edge.hidden = message.hidden
    }
    */

    data.edges.add([message])
}

function rem_edge_from_server(message){
    console.log("Remove edge (server emit)", message, data, data.edges, data.edges._data)
    data.edges.remove(message.id)
}


/*
function add_anchor_from_server(message){
    console.log("Add anchor (server emit)", message, data, data.nodes, data.nodes._data)

        tmp_node = {}
        tmp_node.id = message.id
        tmp_node.shape = message.shape
        tmp_node.size = message.size
        tmp_node.image = message.image
        tmp_node.label = message.label
        tmp_node.group = message.group
        tmp_node.fixed = message.fixed
        tmp_node.is_fixed = message.is_fixed
        tmp_node.fixed.x = message.fixed.x
        tmp_node.fixed.x = message.fixed.x

    data.nodes.add(tmp_node)
    anchor_list.push(tmp_node.id)
    console.log(anchor_list)
}

function edit_anchor_from_server(message){
    console.log("Edit anchor (server emit)", message, data, data.edges, data.edges._data)
    editNode(message, cancelNodeEdit, callback)
}

function rem_anchor_from_server(message){
    console.log("Remove anchor (server emit)", "WARNING : NOT HANDLED ON CLIENT SIDE", message, data, data.edges, data.edges._data)
}

*/