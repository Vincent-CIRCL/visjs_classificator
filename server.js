var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const express = require('express');
const fs = require('fs');
const sharp = require('sharp');
const commander = require('commander');

//Not sure if needed
const vis = require('visjs-network');

var target_width = 500

var first_load = true
var json_graph;

// Handle arguments
commander
  .version('1.0.0', '-v, --version')
  .usage('[OPTIONS]...')
  .option('-i, --input-folder [path]', 'Input pictures folders - <curr_directory>/input_pictures/ by default')
  .option('-j, --input-json [path]', 'Input json to display. IF none provided, json will be created.')
  .option('-r, --resize', 'Do resize pictures before serving')
  .option('-o, --output-folder [path]', 'Folder to output reduced size pictures - <curr_directory>/input_pictures_reduced/ by default')
  .parse(process.argv);
//See : https://github.com/tj/commander.js/

// Gives access to the public folder
app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/node_modules/visjs-network/dist/'));

// Resize if needed
var do_resize = commander.resize
var input_folder = commander.inputFolder ? commander.inputFolder : '/input_pictures/';
var input_folder_reduced = commander.outputFolder ? commander.outputFolder : '/input_pictures_reduced/';
if(do_resize){
    // Create output folder if needed
    if (!fs.existsSync(__dirname +input_folder_reduced)){
        fs.mkdirSync(__dirname +input_folder_reduced);
    }

    app.use(express.static(__dirname + input_folder_reduced));
} else {
    app.use(express.static(__dirname + input_folder));
}

// Serve the home page of the application
app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

// Handle json load
if(commander.inputJson){
    json_path = __dirname + "/" + commander.inputJson
    load_file(json_path)
}

// JSON load
function load_file(file_path){
    try {
      if (fs.existsSync(file_path)) {
        //file exists
        console.log("File to load provided : " + file_path + "\nLoading ... ")

        json_graph = JSON.parse(fs.readFileSync(file_path, 'utf8'));

        // Loading nodes for modification (BMP..)
        o = json_graph["nodes"]
        // DEBUG // console.log("LOADED NODES : ")
        // DEBUG // console.log(o)
        o.forEach(tmp_obj => {
            file = tmp_obj["image"]

            // .BMP handling
            extension = file.split('.').pop();
            if(extension === "bmp"){
                file = file.substr(0, file.lastIndexOf(".")) + ".png";
            }

            tmp_obj["image"] = file
        });

        // DEBUG // console.log(o)

        json_graph["nodes"] = o

        console.log("LOADED FINAL JSON (after BMP conversion if needed) : ")
        console.log(json_graph)
        first_load = false
      }
    } catch(err) {
      console.error(err)
    }
}

// JSON creation
function create_new_json(){
    //Construct a basic object
    var o = {}
    o["nodes"] = []
    o["edges"] = []

    //Read directory and add each file as a node
    id = 0
    fs.readdirSync(__dirname + input_folder).forEach(file => {
        var tmp_obj = {
            "id" : id,
            "shape" : "image", // icon
            "image" : file
        }
        id += 1
        console.log(tmp_obj);
        o["nodes"].push(tmp_obj)
    });

    return o
}


// Sucessful connexion of a user
io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('ask_json', function(message) {
    console.log('message : ' + message);

    if(message == "new" && first_load){
        // On first load, we parse the folder
        json_graph = create_new_json()
        first_load = false
    }

    //io.emit('answer_json',answer) / Broadcast, not for mulituser !
    socket.emit('answer_json', json_graph);
  });


  socket.on('add_edge', function(message) {
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
  });

  socket.on('rem_edge', function(message) {
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
  });

});


http.listen(3000, function(){

  console.log('listening on *:3000');

  // https://sharp.dimens.io/en/stable/api-resize/
  if(do_resize){
      console.log('Reducing image size ... ');
      fs.readdirSync(__dirname + input_folder).forEach(file => {
            //Resize
            sharp(__dirname + input_folder + file).resize(target_width,null).flatten().
                toFile(__dirname + input_folder_reduced + file, function(err){
                if(err){
                    console.log("Error at reducing size")
                    console.log(err)
                    return;
                }
            })
    })
    console.log('Image reduction completed.');

  }


});

// Socket.io cheatsheet : https://socket.io/docs/emit-cheatsheet/