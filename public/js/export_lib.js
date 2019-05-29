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

function export_good_graphe(){
    var jsonData = graphe_correct_to_json();
    trigger_file_download(jsonData, 'json');
}

// ================ LISTS creators ================
/*
'nodes': [{'id': '0_0',
    'image': '',
    'label': 'picture name +0_0',
    'shape': 'image'},
    {'id': '0_1',
    'image': '',
    'label': 'picture name +0_1',
    'shape': 'image'},
*/
function export_node(curr_node){
    tmp_node = {}

    // Add attributes of a node to the new list
    tmp_node.id = curr_node.id
    tmp_node.image = curr_node.image
    if (curr_node.label !== null){
        tmp_node.label = curr_node.label
    }
    tmp_node.shape = curr_node.shape
    if (curr_node.group !== null){
        tmp_node.group = curr_node.group
    }
    return tmp_node
}

function is_an_anchor(id){
    console.log("Checking id ", id)
    for(var i = 0; i < anchor_list.length; i++) {
        if(id === anchor_list[i]){
            console.log("Found as anchor ", id)
            return true
        }
    }
    console.log("Not an anchor ", id)
    return false
}

function get_nodes(with_cluster=true){
    var nodeData = [];

    if(with_cluster){
        console.log("Getting nodes, with clusters")

        // Add nodes with clusters (nothing special)
        data.nodes.get().forEach(function(nodeD) {
            // Store the node in the list to be exported
            nodeData.push(export_node(nodeD));
        });
    } else {
        console.log("Getting nodes, without clusters")

        // Add nodes without clusters (jump over clusters)
        data.nodes.get().forEach(function(nodeD) {
            if(!is_an_anchor(nodeD.id)){
                // Store the node in the list to be exported
                nodeData.push(export_node(nodeD));
            }
        });
    }

    return nodeData
}

/*
'edges': [{'color': 'gray', 'from': 0, 'to': '0_0'},
    {'color': 'gray', 'from': 0, 'to': '0_1'},
    {'color': 'gray', 'from': 0, 'to': '0_2'},
*/
function get_edges(){
        var edgeData = [];

        // Add edges
        data.edges.get().forEach(function(edge) {
            tmp_edge = {}

            // Add attributes of a node to the new list
            tmp_edge.to = edge.to
            tmp_edge.from = edge.from
            //TODO : Color ?
            // Store the node in the list to be exported
			edgeData.push(tmp_edge);
			});

		return edgeData
}

/*
{'clusters': [{'group': '',
    'id': 0,
    'image': '',
    'label': '',
    'members': {'0_0', '0_1', '0_2'},
    'shape': 'image'},
    {'group': '',
    'id': 1,
    'image': '',
    'label': '',
    'members': {'1_0', '1_1', '1_2'},
    'shape': 'image'}],
*/
function get_clusters(){
    // Construct a json representation of nodes and clusters
    var clusters = [];

    // Get list of all nodes (by their ids)
    var node_id_list = data.nodes.getIds()

    // ==== for all anchors ====
    for(var i = 0; i < anchor_list.length; i++) {
        // Get the anchor
        curr_anchor = data.nodes.get(anchor_list[i])

        // Get the informations, like a node
        exported_anchor = export_node(curr_anchor)

        // For all nodes, we check the existence of a link to the anchor
        exported_anchor.members = []
        for(var j = 0; j < node_id_list.length; j++) {

            // If the current anchor id is not the current node id (no link from anchor to itself)
            if(anchor_list[i] !== node_id_list[j]){
                // Get the list of edges between current anchor and current node
                common_edges = get_edge_between_nodes_two_ways(node_id_list[j], anchor_list[i])

                // If the current node is linked to the anchor
                if(common_edges.length !== 0){
                    // We add the node to the class
                    exported_anchor.members.push(node_id_list[j])
                }
            }
        }

        clusters.push(exported_anchor)
    }

    return clusters
}

/*
'meta': {'source': 'DBDUMP'},
*/
function get_meta(){
    meta = {}
    meta.source = "VISJS"
    return meta
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
    // Construct a json representation of nodes and clusters
    var classes = [];

    // Get list of all nodes (by their ids)
    var node_id_list = data.nodes.getIds()

    // ==== for all anchors ====
    for(var i = 0; i < anchor_list.length; i++) {
        //TODO : Problem here !
        // get the anchor information (label ..)
        tmp_class = {}
        tmp_class.label = data.nodes.get(anchor_list[i]).label
        tmp_class.members = []
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
                        tmp_class.members.push(node_id_list[j])
                        counter += 1
                }
            }
        }
        tmp_class.nb_item = counter
        classes.push(tmp_class)
    }

    // ==== For all nodes, add them ====
    var nodeData = [];

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

    console.log("Classes sorting to export : ")
    console.log(classes)

    console.log("Nodes to export : ")
    console.log(nodeData)

    // Merge everything
    final = {}
    final.classes = classes
    final.nodes = nodeData

    var jsonData = JSON.stringify(final);
    return jsonData;
}

function graphe_correct_to_json(){
    // Fetch data
    nodes = get_nodes(false) //Not with clusters
    edges = get_edges()
    clusters = get_clusters()
    meta = get_meta()

    // Merge everything
    final = {}
    final.meta = meta
    final.clusters = clusters
    final.nodes = nodes
    final.edges = edges

    var jsonData = JSON.stringify(final);
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


