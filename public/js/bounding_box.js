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
function add_anchor_node(evt){ // data,callback

    var pageX = event.pageX;    // Get the horizontal coordinate
    var pageY = event.pageY;    // Get the vertical coordinate
    console.log(pageX, pageY)

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
    var tmp_id = data.nodes.add([tmp_anchor])
    new_node_notify(data.nodes.get(tmp_id))
    anchor_list.push(tmp_id)

    return tmp_id
}


function link_list_to_anchor(anchor, node_list){
    console.log("ANCHOR", anchor, node_list)

    var id_to = anchor[0]

    for(var i = 0; i < node_list.length; i++) {
        var id_from = node_list[i]

        // If not itself and no link between both nodes, we create one
        if(id_from !== id_to && get_edge_between_nodes(id_from, id_to).length == 0){
            // Locally add edge
            tmp_edge =
                {
                    from: id_from,
                    to: id_to,
                    length : 1,
                    hidden: true,
                }

            console.log("tmp_edge", tmp_edge)
            var tmp_id = data.edges.add([tmp_edge])

            // Notify about the adding
            new_edge_notify(data.edges.get(tmp_id))
        }
    }
}


function draw_bounding_box_on_network(ctx, minX, minY, maxX, maxY){
    console.log("DRAW ! ", minX, minY, maxX, maxY)
    // Draw a rectangle regarding the current selection
    const [startX, startY] = canvasify(minX, minY);
        const [endX, endY] = canvasify(maxX, maxY);

        console.log("DRAW ! ", startX, startY, endX, endY)


        ctx.setLineDash([5]);
        ctx.strokeStyle = 'rgba(78, 146, 237, 0.75)';
        ctx.strokeRect(startX, startY, endX - startX, endY - startY);
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(151, 194, 252, 0.45)';
        ctx.fillRect(startX, startY, endX - startX, endY - startY);

}

function get_list_boxes(){
    list_coords = []
    node_id_list = data.nodes.getIds()
    var positions = network.getPositions();
    console.log(positions)

    // For all anchors
    for(var i = 0; i < anchor_list.length; i++) {
         min_X = 10000
         min_Y = 10000
         max_X = 0
         max_Y = 0

        // For all nodes that could be links to the anchor
        for(var j = 0; j < node_id_list.length; j++) {
            //console.log("CHECK : ", nodes_distri._data[j].id, anchor_list[i][0])
            common_edges = get_edge_between_nodes(anchor_list[i][0], node_id_list[j])

            // If the current node is link to the anchor
            if(common_edges.length !== 0){
                // console.log("BEFORE :" , min_X, min_Y, max_X, max_Y)

                curr_x = positions[node_id_list[j]].x;
                curr_y = positions[node_id_list[j]].y;

                // If there is some links between these nodes :
                min_X = Math.min(min_X, curr_x)
                min_Y = Math.min(min_Y, curr_y)
                max_X = Math.max(max_X, curr_x)
                max_Y = Math.max(max_Y, curr_y)

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

        return list_coords

    }
}

function draw_list_boxes(ctx, list_boxes){
    try {
        for(var i = 0; i < list_boxes.length; i++) {
            draw_bounding_box_on_network(ctx, list_boxes[0].minX, list_boxes[0].minY, list_boxes[0].maxX, list_boxes[0].maxY)
        }
    }
    catch {
        console.log('error ;)')
    }
}

function draw_boxes(ctx){
    console.log("Stabilized : ")
    list_boxes = get_list_boxes()
    console.log(list_boxes)
    draw_list_boxes(ctx, list_boxes)
}

var anchor_list = []

function make_rectangle_with_anchors(container, network, nodes) {
    // Drawer
    network.on('afterDrawing', function (ctx) { draw_boxes(ctx) });
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