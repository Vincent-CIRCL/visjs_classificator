// Handle the right clic rectangle selection of nodes
// ========


/* Example of anchor data (as initially tought)
    {
      "id": 42, //Generated or defined id
      "shape": "icon", // Size of the picture
      "image": "", // The picture to show in the box
      "group" : "anchor", //Group to which the node belongs to
      "fixed": true, //Fixed position
    }
*/

// NODE_SIZE = 60
const MARGE_OUT = 15
const ANCHOR_SIZE = 10
var anchor_list = []

/* Anchor format :
var anchor = {id:"cluster_id", members:["id_1","id_2",...]};
*/

// Color list of rectangle
color_scheme = ["rgba(151, 194, 252, 0.25)",
                "rgba(252, 208, 151, 0.25)",
                "rgba(252, 151, 195, 0.25)",
                "rgba(195, 252, 151, 0.25)",
                "rgba(208, 151, 252, 0.25)",
                "rgba(251, 197, 126, 0.25)",
                "rgba(146, 249, 67, 0.25)",
                "rgba(151, 252, 233, 0.25)",
                "rgba(183, 151, 252, 0.25)",
                "rgba(252, 158, 151, 0.25)",
                "rgba(245, 252, 151, 0.25)"]

function add_anchor_node(evt){ // data,callback

    // NOT FOR A KEYBOARD EVENT !
    // var pageX = evt.pageX;    // Get the horizontal coordinate
    // var pageY = evt.pageY;    // Get the vertical coordinate
    // console.log("New anchor position : ", pageX, pageY)
    // console.log("Event : ", evt)

    tmp_anchor =
        {
            shape: "image",             // Image shape to display a small anchor
            size: ANCHOR_SIZE,          // Prevent too big pictures
            image: "anchor.png",        // Link to the anchor
            group : "anchor",           // It is an anchor and will be treated as so
            label: "anchor",            // Label of the node
            fixed: {x: undefined, y: undefined}, // {x: pageX, y: pageY},// Fixed position
            is_fixed : true             // Prevent auto-move (consistent with the doubleclick behavior)
        }


    // Add the anchor to network, notify server and add to anchor list
    var tmp_id = data.nodes.add([tmp_anchor])[0]
    console.log("tmp_id", tmp_id)
    tmp_anchor.id = tmp_id

    tmp_light_anchor = {id:tmp_id, members:[]}

    // Store the anchor as an anchor
    anchor_list.push(tmp_light_anchor)

    // Get back the position of the node on the network
    curr_position = network.getPositions([tmp_id])
    console.log("curr_position", curr_position)
    tmp_anchor.fixed.x = curr_position[tmp_id].x
    tmp_anchor.fixed.y = curr_position[tmp_id].y

    // Notify server
    new_node_notify(tmp_anchor)

    return tmp_id
}

function is_node_in_list(node_id, list){
    // Checks if a node is in the list (anchor list usually)
    for(var i = 0; i < list.length; i++) {
        if(node_id == anchor_list[i].id){
            return true;
        }
    }

    return false;
}

function link_list_to_anchor(anchor_id, node_list){
    // Do link a list of nodes to an anchor
    // console.log("Linking", anchor, " to each of : ", node_list)

    var id_to = anchor_id

    for(var i = 0; i < node_list.length; i++) {
        var id_from = node_list[i]

        // If not itself and no link between both nodes, we create one
        if(id_from !== id_to && get_edge_between_nodes(id_from, id_to).length == 0 && !is_node_in_list(id_from, anchor_list)){
            // Locally add edge
            tmp_edge =
                {
                    from: id_from,
                    to: id_to,
                    length : 1,
                    //hidden: true,
                    type: "cat" // Categorization
                }

            // Add the created edge
            var tmp_id = data.edges.add([tmp_edge])[0]

            // Add to members of the anchor
            add_member_to_anchor(id_to,id_from)

            // Notify about the adding
            new_edge_notify(data.edges.get(tmp_id))
        }
    }
}

function add_member_to_anchor(anchor_id, node_id){
    // Do add the given node id to the members of the given anchor

    let obj = anchor_list.find(f=>f.id==anchor_id);
    if(obj){
        obj.members.push(node_id);
        return true
    }
    return false
}


function draw_bounding_box_on_network(ctx, startX, startY, endX, endY, color_index){
    // Draw a rectangle regarding the current selection
    // const [startX, startY] = canvasify(minX, minY);
    // const [endX, endY] = canvasify(maxX, maxY);
    //console.log("DRAW ! ", startX, startY, endX, endY, ctx)

    ctx.setLineDash([5]);
    ctx.strokeStyle = 'rgba(78, 146, 237, 0.25)';
    ctx.strokeRect(startX, startY, endX - startX, endY - startY);
    ctx.setLineDash([]);
    //ctx.fillStyle = color_scheme[color_index];
    ctx.fillStyle = color_scheme[color_index%color_scheme.length];
    //ctx.fillStyle = 'rgba(151, 194, 252, 0.25)';
    ctx.fillRect(startX, startY, endX - startX, endY - startY);
    //console.log("Rectangle drawn")
}

function get_size_node(node_id){
    var bounding_box = network.getBoundingBox(node_id);
    try{
        // console.log("bounding_box",bounding_box)
        curr_node_width = bounding_box.right - bounding_box.left
        curr_node_height = bounding_box.bottom - bounding_box.top

        return [curr_node_width, curr_node_height]
    }catch{
        console.log("ERROR : bounding box not defined.")
        return [MARGE_OUT, MARGE_OUT]
    }
}

/*

                    // On first iteration, values need to be initialized
                    if( min_X == null || min_Y == null || max_X == null || max_Y == null){
                        min_X = curr_x - node_size[0]/2 - MARGE_OUT
                        min_Y = curr_y - node_size[1]/2 - MARGE_OUT
                        max_X = curr_x + node_size[0]/2 + MARGE_OUT
                        max_Y = curr_y + node_size[1]/2 + MARGE_OUT
                    }
*/

// NEW VERSION of the boxes builder. If something is linked to an anchor AND in its members list, it draws a rectangle around it.
function get_list_boxes(){
    var list_coords = []
    var node_id_list = data.nodes.getIds()
    var positions = network.getPositions();

    // For all anchors
    for(var i = 0; i < anchor_list.length; i++) {

        // Start with the anchor position and size
        node_size = get_size_node(anchor_list[i].id)
        var min_X = positions[anchor_list[i].id].x - node_size[0]/2 - MARGE_OUT
        var min_Y = positions[anchor_list[i].id].y - node_size[1]/2 - MARGE_OUT
        var max_X = positions[anchor_list[i].id].x + node_size[0]/2 + MARGE_OUT
        var max_Y = positions[anchor_list[i].id].y + node_size[1]/2 + MARGE_OUT

        // For all nodes that could be links to the anchor
        for(var j = 0; j < anchor_list[i].members.length; j++) {

            // If the current anchor id is not the current node id
            if(anchor_list[i].id !== anchor_list[i].members[j]){

                // Get the Node position
                curr_x = positions[anchor_list[i].members[j]].x;
                curr_y = positions[anchor_list[i].members[j]].y;

                // Get size of the current node, to compute margins
                node_size = get_size_node(anchor_list[i].members[j])

                // If there is some links between these nodes, extend rectangle to this square
                min_X = Math.min(min_X, curr_x - node_size[0]/2 - MARGE_OUT)
                min_Y = Math.min(min_Y, curr_y - node_size[1]/2 - MARGE_OUT)
                max_X = Math.max(max_X, curr_x + node_size[0]/2 + MARGE_OUT)
                max_Y = Math.max(max_Y, curr_y + node_size[1]/2 + MARGE_OUT)
            }
        }

        // We construct a request for the rectangle drawer
        tmp_obj = {
                    anchor : anchor_list[i].id,
                    minX : min_X,
                    minY : min_Y,
                    maxX : max_X,
                    maxY : max_Y
                  }

        // We store the request
        list_coords.push(tmp_obj)

    }

    return list_coords
}

// OLD VERSION of the boxes builder. If something is linked to an anchor, it draws a rectangle around it.
function get_list_boxes_anchor_based(){
    var list_coords = []
    var node_id_list = data.nodes.getIds()
    var positions = network.getPositions();

    // For all anchors
    for(var i = 0; i < anchor_list.length; i++) {

        // Start with the anchor position and size
        node_size = get_size_node(anchor_list[i].id)
        var min_X = positions[anchor_list[i].id].x - node_size[0]/2 - MARGE_OUT
        var min_Y = positions[anchor_list[i].id].y - node_size[1]/2 - MARGE_OUT
        var max_X = positions[anchor_list[i].id].x + node_size[0]/2 + MARGE_OUT
        var max_Y = positions[anchor_list[i].id].y + node_size[1]/2 + MARGE_OUT

        // For all nodes that could be links to the anchor
        for(var j = 0; j < node_id_list.length; j++) {

            // If the current anchor id is not the current node id
            if(anchor_list[i].id !== node_id_list[j]){

                // Get the list of edges between current anchor and current node
                common_edges = get_edge_between_nodes_two_ways(node_id_list[j], anchor_list[i].id)

                // If the current node is link to the anchor
                if(common_edges.length !== 0){
                    // Get the Node position
                    curr_x = positions[node_id_list[j]].x;
                    curr_y = positions[node_id_list[j]].y;

                    // Get size of the current node, to compute margins
                    node_size = get_size_node(node_id_list[j])

                    // If there is some links between these nodes, extend rectangle to this square
                    min_X = Math.min(min_X, curr_x - node_size[0]/2 - MARGE_OUT)
                    min_Y = Math.min(min_Y, curr_y - node_size[1]/2 - MARGE_OUT)
                    max_X = Math.max(max_X, curr_x + node_size[0]/2 + MARGE_OUT)
                    max_Y = Math.max(max_Y, curr_y + node_size[1]/2 + MARGE_OUT)
                }
            }
        }

        // We construct a request for the rectangle drawer
        tmp_obj = {
                    anchor : anchor_list[i].id,
                    minX : min_X,
                    minY : min_Y,
                    maxX : max_X,
                    maxY : max_Y
                  }

        // We store the request
        list_coords.push(tmp_obj)

    }

    return list_coords
}

function draw_list_boxes(ctx, list_boxes){
    try {
        for(var i = 0; i < list_boxes.length; i++) {
            // Draw each stored request
            draw_bounding_box_on_network(ctx, list_boxes[i].minX, list_boxes[i].minY, list_boxes[i].maxX, list_boxes[i].maxY, i)
        }
    }
    catch{
        console.log('Error when drawing boxes ;) ')
    }
}

function draw_boxes(ctx){
    //console.log("Stabilized : ")
    if(highPerf === false) {
        list_boxes = get_list_boxes()
        // console.log("List boxes :" , list_boxes)
        draw_list_boxes(ctx, list_boxes)
        }
}


function make_rectangle_with_anchors(container, network, nodes) {
    // Drawer
    //network.on('afterDrawing', function (ctx) { draw_boxes(ctx) });
    network.on('beforeDrawing', function (ctx) { draw_boxes(ctx) });
    //network.once('stabilizationIterationsDone', function (ctx) { draw_boxes(ctx) });
}