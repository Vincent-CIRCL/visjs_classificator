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
