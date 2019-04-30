

function add_listener(){
    var coll = document.getElementsByClassName("collapsible");
    console.log(coll)
    console.log(coll.length)
    var i;

    for (i = 0; i < coll.length; i++) {
      console.log("added listener on collapsier")
      coll[i].addEventListener("click", event_collapse_listener())
}
    console.log(coll.length)
}

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
