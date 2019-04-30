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

function new_node_notify(data){
    console.log("How did you managed to add a node without picture ? Oo")
}

function rem_node_notify(data){
    console.log("Why did you deleted a node ? Oo")
}

