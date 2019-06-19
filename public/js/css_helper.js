// JS function to handle graphical elements not link to the network. e.g. Menus

// From : https://www.w3schools.com/howto/howto_js_collapsible.asp
function event_collapse_listener(element){
    // Activate and desactivate option/parameters block upon request
        element.classList.toggle("active");
        if (element.style.display === "block") {
          element.style.display = "none";
        } else {
          element.style.display = "block";
        }
}

function filter_edges(){
        var edgeData = [];
        var threshold = document.getElementById("step_filter").value;

        console.log("Filtering edges ... ", threshold)

        // Threshold each edge
        data.edges.get().forEach(function(edge) {
            if(typeof edge.value === "undefined" ) {
                //Do nothing : not set, we don't touch
            } else if(edge.value <= threshold){
                edge.hidden = false
                edge.physics = true
            } else {
                edge.hidden = true
                edge.physics = false
            }
            edgeData.push(edge)
		});

		data.edges.update(edgeData)

}