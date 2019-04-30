// Handle the right clic rectangle selection of nodes
// ========

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

function draw_rectangle_on_network(ctx){
    // Draw a rectangle regarding the current selection
    if(drag) {
        const [startX, startY] = canvasify(DOMRect.startX, DOMRect.startY);
        const [endX, endY] = canvasify(DOMRect.endX, DOMRect.endY);

        ctx.setLineDash([5]);
        ctx.strokeStyle = 'rgba(78, 146, 237, 0.75)';
        ctx.strokeRect(startX, startY, endX - startX, endY - startY);
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(151, 194, 252, 0.45)';
        ctx.fillRect(startX, startY, endX - startX, endY - startY);
    }
}


function makeMeMultiSelect(container, network, nodes) {
    // State
    drag = false;
    DOMRect = {};

    // Disable default right-click dropdown menu
    container.oncontextmenu = () => false;

    // Listeners
    //container.mousedown()
    $(document).on("mousedown", function(evt) { rectangle_mousedown(evt) });
    $(document).on("mousemove", function(evt) { rectangle_mousedrag(evt) });
    $(document).on("mouseup", function(evt) { rectangle_mouseup(evt) });

    // Drawer
    network.on('afterDrawing', function (ctx) { draw_rectangle_on_network(ctx) });
}
