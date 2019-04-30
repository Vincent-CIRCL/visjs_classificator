// Actions to be performed on client side
// ========

function load_json(parsed_content) {
        console.log("Received initial JSON : ")
        console.log(parsed_content)
        // Store it
        incoming_network = parsed_content;
        draw()
}

function add_edge_from_server(message){
        console.log("Added edge (server emit)")
        console.log(message)
        data.edges.add([{id: message.id, from: message.from, to: message.to}])
}

function rem_edge_from_server(message){
        console.log("Remove edge (server emit)")
        console.log(message)
        console.log(data)
        console.log(data.edges)
        console.log(data.edges._data)
        data.edges.remove(message.id)
}

