// Export functions on client side (to json)
// ========

// ================ EXPORT HANDLER ================

function export_json(){
    var jsonData = graph_to_JSON();
    trigger_file_download(jsonData, 'json');
}

function export_classes_json(){
    var jsonData = classes_to_JSON();
    trigger_file_download(jsonData, 'json');
}

// ================ UTILITIES ================
function graph_to_JSON() {
        var nodeData = [];
        var edgeData = [];

        // Add nodes
        data.nodes.get().forEach(function(nodeD) {
            tmp_node = {}
            // Add attributes of a node to the new list
            tmp_node.id = nodeD.id
            tmp_node.shape = nodeD.shape
            tmp_node.image = nodeD.image

            if (nodeD.group !== null){
                tmp_node.group = nodeD.group
            }
            if (nodeD.label !== null){
                tmp_node.label = nodeD.label
            }

            // Store the node in the list to be exported
			nodeData.push(tmp_node);
			});

        // Add edges
        data.edges.get().forEach(function(edge) {
            tmp_edge = {}
            // Add attributes of a node to the new list
            tmp_edge.to = edge.to
            tmp_edge.from = edge.from

            //TODO : Implement type = manual, algoX, algoY, ...
            if (edge.type !== null){
                tmp_node.type = edge.type
            }

            // Store the node in the list to be exported
			edgeData.push(tmp_edge);
			});

        var to_export = {}
        to_export.nodes = nodeData
        to_export.edges = edgeData

        console.log("Graphe to export : ")
        console.log(to_export)

		var jsonData = JSON.stringify(to_export);
		return jsonData;
	}

function classes_to_JSON() {
    var classes = [];

    var node_id_list = data.nodes.getIds()

    for(var i = 0; i < anchor_list.length; i++) {
        //TODO : Problem here !
        tmp_class = {}
        tmp_class.label = data.nodes.get(anchor_list[i]).label
        tmp_class.member_list = []
        counter = 0

        // For all nodes that could be links to the anchor
        for(var j = 0; j < node_id_list.length; j++) {

            // If the current anchor id is not the current node id
            if(anchor_list[i] !== node_id_list[j]){

                // Get the list of edges between current anchor and current node
                common_edges = get_edge_between_nodes_two_ways(node_id_list[j], anchor_list[i])

                // If the current node is link to the anchor
                if(common_edges.length !== 0){
                        // We add the node to the class
                        tmp_class.member_list.push(node_id_list[j])
                        counter += 1
                }
            }
        }
        tmp_class.nb_item = counter
        classes.push(tmp_class)
    }

    console.log("Classes sorting to export : ")
    console.log(classes)

    var jsonData = JSON.stringify(classes);
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

	// Tricky commands to trigger a download
	var a = document.createElement('a');
	a.setAttribute('href', dataUri);
	a.setAttribute('download', filename);

	var aj = $(a);
	aj.appendTo('body');
	aj[0].click();
	aj.remove();
}


