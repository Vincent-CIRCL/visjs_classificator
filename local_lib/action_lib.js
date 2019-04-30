// Action that client can perform handler
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

// ========
module.exports = {
  bar: function () {
    // whatever
  },
  reduce_and_serve : function(resize_pictures, target_width, input_folder, tmp_folder_reduced){
      console.log('listening on *:3000');
      // https://sharp.dimens.io/en/stable/api-resize/

      if(resize_pictures){

          console.log("Creating tmp output folder ... ")
          if(!fs.existsSync(tmp_folder_reduced)){
                fs.mkdirSync(tmp_folder_reduced);
          }

          console.log('Reducing image size ... ');
          fs.readdirSync(input_folder).forEach(file => {
                //Resize
                sharp(path.join(input_folder, file)).resize(target_width,null).flatten().
                    toFile(path.join(tmp_folder_reduced, file), function(err){
                    if(err){
                        console.log("Error at reducing size")
                        console.log(err)
                        return;
                    }
                })
        })
        console.log('Image reduction completed.');
    }
  },
  send_json: function(message, json_graph, socket) {
    console.log('message : ' + message);
    console.log('message : ' + json_graph);
    console.log('message : ' + socket);

    /* if(message == "new" && first_load){
        // On first load, we parse the folder
        json_graph = create_new_json()
        first_load = false
    } */

    //io.emit('answer_json',answer) / Broadcast, not for mulituser !
    socket.emit('answer_json', json_graph);
  },
  add_edge: function(message, json_graph, socket) {
    console.log('message : ' + message);
    if(message.type == "add"){
        console.log("Added edge !")
        tmp_edge = {}
        tmp_edge.id = message.id
        tmp_edge.to = message.to
        tmp_edge.from = message.from

        json_graph["edges"].push(message)
        // Everyone except sender
        socket.broadcast.emit('add_edge', message);
    }
  },
  rem_edge : function(message, json_graph, socket) {
    console.log('message : ' + message);
    if(message.type == "rem"){
        console.log("Removed edge !")
        console.log(json_graph["edges"])
        console.log(message)

        //Iterate over the edges, and keep only the ones that are not removed
        json_graph["edges"] = json_graph["edges"].filter(function (e) {
            return e.id !== message.id;
        });

        console.log(json_graph["edges"])
        // Everyone except sender
        socket.broadcast.emit('rem_edge', message);
    }
  }
};


