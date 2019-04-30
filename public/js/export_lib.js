// Export functions on client side (to json)
// ========

// ================ EXPORT HANDLER ================

function export_json(){
    var jsonData = graph_to_JSON();
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

            // Store the node in the list to be exported
			nodeData.push(tmp_node);
			});

        // Add edges
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

        console.log("Graphe to export : ")
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

	// Tricky commands to trigger a download
	var a = document.createElement('a');
	a.setAttribute('href', dataUri);
	a.setAttribute('download', filename);

	var aj = $(a);
	aj.appendTo('body');
	aj[0].click();
	aj.remove();
}


