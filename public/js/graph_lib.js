// Graphe actions
// ========


function get_edge_between_nodes(node1,node2) {

    var tmp_edge_list = network.getConnectedEdges(node1)
    //console.log("Edge between nodes : " + node1 + " and " + node2)
    //console.log("Edge from", node1, tmp_edge_list)

    var tmp_table = []
    for(i =0 ; i < tmp_edge_list.length ; i ++){

        var tmp_edge = data.edges.get(tmp_edge_list[i])
        // console.log("List edges : ", tmp_edge)
        if(tmp_edge.to === node2){ // Node1 already verified by construction
            tmp_table.push(tmp_edge)
        }
    }

    //console.log("tmp_table", tmp_table)

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

function do_cluster(evt, selected_id){
    // Create a new anchor node
    anchor_id = add_anchor_node(evt)

    // Link all node to the anchor
    link_list_to_anchor(anchor_id, selected_id)

    // mark all nodes as part of the anchor group ? (Mutually exclusive ? Pb ?)

    // call rectangle drawer
    // draw_boxes(ctx)
}

