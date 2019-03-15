var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express');
var fs = require('fs');
var sharp = require('sharp');

//Not sure if needed
var vis = require('visjs-network');
var input_folder = '/input_pictures/';
var input_folder_reduced = '/input_pictures_reduced/';
var do_resize = true
var target_width = 500

// Gives access to the public folder
app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/node_modules/visjs-network/dist/'));

if(do_resize){
    app.use(express.static(__dirname + input_folder_reduced));
} else {
    app.use(express.static(__dirname + input_folder));
}

// Serve the home page of the application
app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

var first_load = true

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

function load_json(){
    fs.readFile(__dirname + '/public' + '/content.json', function (err, data) {
     if (data) {
        console.log("Read JSON file: " + data);
        // data = data.trim();
         //or data = JSON.parse(JSON.stringify(data.trim()));
        storage = JSON.parse(data);
        return storage
    }});
}

// Sucessful connexion of a user
io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('ask_json', function(message) {
    console.log('message : ' + message);
    if(message == "new"){
        // On first load, we parse the folder
        if(first_load){
            json_graph = create_new_json()
            first_load = false
        }
    } else {

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
  }
});

// Socket.io cheatsheet : https://socket.io/docs/emit-cheatsheet/