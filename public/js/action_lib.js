// Actions to be performed on client side
// ========

function load_json(parsed_content) {
        console.log("Received initial JSON : ", parsed_content)
        // Store it
        incoming_network = parsed_content;
        draw()
}

function add_node_from_server(message){
    console.log("Added node (server emit)", message)

    if(message.group === "anchor"){
        console.log("Anchor node to be added ... ")
        // We store the new anchor
        anchor_list.push(message.id)

    } else {
        console.log("Normal node to be added ... ")
    }

    tmp_node =
        {
            id : message.id,             // The generated id of the node
            shape: message.shape,       // Image shape to display a small anchor
            size: message.size,         // Prevent too big pictures
            image: message.image,       // Link to the anchor
            group : message.group,      // It is an anchor and will be treated as so
            label: message.label,       // Label of the node
            is_fixed : message.is_fixed // Prevent auto-move (consistent with the doubleclick behavior)
        }
    data.nodes.add([tmp_node])
}

function add_edge_from_server(message){
        console.log("Added edge (server emit)", message)
        data.edges.add([{id: message.id, from: message.from, to: message.to}])
}

function rem_edge_from_server(message){
        console.log("Remove edge (server emit)", message, data, data.edges, data.edges._data)
        data.edges.remove(message.id)
}

