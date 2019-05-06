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

NODE_SIZE = 60
var anchor_list = []

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

    var pageX = event.pageX;    // Get the horizontal coordinate
    var pageY = event.pageY;    // Get the vertical coordinate
    /// console.log("New anchor position : ", pageX, pageY)

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

    console.log("Anchor node added", tmp_anchor)

    // Add the anchor to network, notify server and add to anchor list
    var tmp_id = data.nodes.add([tmp_anchor])
    new_node_notify(data.nodes.get(tmp_id))
    anchor_list.push(tmp_id)

    return tmp_id
}

function is_node_in_list(node_id, list){
    // Checks if a node is in the list (anchor list usually)

    for(var i = 0; i < list.length; i++) {
        if(node_id == anchor_list[i][0]){
            return true;
        }
    }
    return false;
}

function link_list_to_anchor(anchor, node_list){
    // Do link a list of nodes to an anchor
    // console.log("Linking", anchor, " to each of : ", node_list)

    var id_to = anchor[0]

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
                    hidden: true,
                    type: "cat"
                }

            // console.log("tmp_edge", tmp_edge)
            var tmp_id = data.edges.add([tmp_edge])

            // Notify about the adding
            new_edge_notify(data.edges.get(tmp_id)[0])
        }
    }
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
    ctx.fillStyle = color_scheme[color_index];
    //ctx.fillStyle = 'rgba(151, 194, 252, 0.25)';
    ctx.fillRect(startX, startY, endX - startX, endY - startY);
    //console.log("Rectangle drawn")
}


function get_list_boxes(){
    list_coords = []
    node_id_list = data.nodes.getIds()
    var positions = network.getPositions();

    // For all anchors
    for(var i = 0; i < anchor_list.length; i++) {
        //console.log("Anchor", positions[anchor_list[i][0]])
        // Start with the anchor position and size
         var min_X = positions[anchor_list[i][0]].x - NODE_SIZE
         var min_Y = positions[anchor_list[i][0]].y - NODE_SIZE
         var max_X = positions[anchor_list[i][0]].x + NODE_SIZE
         var max_Y = positions[anchor_list[i][0]].y + NODE_SIZE

        // For all nodes that could be links to the anchor
        for(var j = 0; j < node_id_list.length; j++) {
            //console.log("CHECK : ", nodes_distri._data[j].id, anchor_list[i][0])
            common_edges = get_edge_between_nodes( node_id_list[j], anchor_list[i][0])

            // If the current node is link to the anchor
            if(common_edges.length !== 0 && anchor_list[i][0] !== node_id_list[j]){
                //console.log("List edges from ", anchor_list[i][0], " to ",  node_id_list[j], " are ", common_edges)

                // console.log("BEFORE :" , min_X, min_Y, max_X, max_Y)

                curr_x = positions[node_id_list[j]].x;
                curr_y = positions[node_id_list[j]].y;

                // On first iteration, values need to be initialized
                if( min_X == null || min_Y == null || max_X == null || max_Y == null){
                    min_X = curr_x - NODE_SIZE
                    min_Y = curr_y - NODE_SIZE
                    max_X = curr_x + NODE_SIZE
                    max_Y = curr_y + NODE_SIZE
                }

                // If there is some links between these nodes, extend rectangle to this square
                min_X = Math.min(min_X, curr_x - NODE_SIZE)
                min_Y = Math.min(min_Y, curr_y - NODE_SIZE)
                max_X = Math.max(max_X, curr_x + NODE_SIZE)
                max_Y = Math.max(max_Y, curr_y + NODE_SIZE)

               // console.log("AFTER :" , min_X, min_Y, max_X, max_Y)

            }
        }

        // We construct a request for the rectangle drawer
        tmp_obj = {
                    anchor : anchor_list[i][0],
                    minX : min_X,
                    minY : min_Y,
                    maxX : max_X,
                    maxY : max_Y
                  }

        // We store the request
        list_coords.push(tmp_obj)

    }

    //console.log("List of coordinates : ", list_coords)
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
        console.err('Error when drawing boxes ;) ')
    }
}

function draw_boxes(ctx){
    //console.log("Stabilized : ")
    list_boxes = get_list_boxes()
    //console.log("List boxes :" , list_boxes)
    draw_list_boxes(ctx, list_boxes)
}


function make_rectangle_with_anchors(container, network, nodes) {
    // Drawer
    //network.on('afterDrawing', function (ctx) { draw_boxes(ctx) });
    network.on('beforeDrawing', function (ctx) { draw_boxes(ctx) });
    //network.once('stabilizationIterationsDone', function (ctx) { draw_boxes(ctx) });
}


/*
const NO_CLICK = 0;
const RIGHT_CLICK = 3;

// Selector
function canvasify(DOMx, DOMy) {
    const { x, y } = network.DOMtoCanvas({ x: DOMx, y: DOMy });
    return [x, y];
}

function correctRange(start, end){
    return start < end ? [start, end] : [end, start];
}

function selectFromDOMRect(){
    const [sX, sY] = canvasify(DOMRect.startX, DOMRect.startY);
    const [eX, eY] = canvasify(DOMRect.endX, DOMRect.endY);
    const [startX, endX] = correctRange(sX, eX);
    const [startY, endY] = correctRange(sY, eY);

    network.selectNodes(nodes_distri.get().reduce(
        (selected, { id }) => {
            const { x, y } = network.getPositions(id)[id];
            return (startX <= x && x <= endX && startY <= y && y <= endY) ? selected.concat(id) : selected;
            //And nodes.get(id).hidden ? Depending on the behavior expected
        }, []
    ));
}

function rectangle_mousedown(evt){
    // Handle mouse down event = beginning of the rectangle selection

    var pageX = event.pageX;    // Get the horizontal coordinate
    var pageY = event.pageY;    // Get the vertical coordinate
    var which = event.which;    // Get the button type

    // When mousedown, save the initial rectangle state
    if(which === RIGHT_CLICK) {
        Object.assign(DOMRect, {
            startX: pageX - container.offsetLeft,
            startY: pageY - container.offsetTop,
            endX: pageX - container.offsetLeft,
            endY: pageY - container.offsetTop
        });
        drag = true;
    }
}

function rectangle_mousedrag(evt){
    // Handle mouse drag event = during the rectangle selection
    var pageX = event.pageX;    // Get the horizontal coordinate
    var pageY = event.pageY;    // Get the vertical coordinate
    var which = event.which;    // Get the button type

    if(which === NO_CLICK && drag) {
        // Make selection rectangle disappear when accidently mouseupped outside 'container'
        drag = false;
        network.redraw();
    } else if(drag) {
        // When mousemove, update the rectangle state
        Object.assign(DOMRect, {
            endX: pageX - container.offsetLeft,
            endY: pageY - container.offsetTop
        });
        network.redraw();
    }
}

function rectangle_mouseup(evt){
    // Handle mouse up event = beginning of the rectangle selection

    var pageX = event.pageX;    // Get the horizontal coordinate
    var pageY = event.pageY;    // Get the vertical coordinate
    var which = event.which;    // Get the button type

    // When mouseup, select the nodes in the rectangle
    if(which === RIGHT_CLICK) {
        drag = false;
        network.redraw();
        selectFromDOMRect();
    }
}

// State
var boxes_list = [];

function create_new_box(container, network, nodes) {

    // Drawer
    network.on('afterDrawing', function (ctx) { draw_rectangle_on_network(ctx) });
}

*/