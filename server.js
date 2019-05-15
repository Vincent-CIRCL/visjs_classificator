#!/usr/bin/env node

// ====================== STANDARD IMPORTS ======================

var app = require('express')();
var http = require('http').Server(app);
var io =  require('socket.io')(http);
const express = require('express');
const commander = require('commander');
const vis = require('visjs-network');
const path = require('path');

// ====================== OWN IMPORTS ======================
const action_lib = require('./local_lib/action_lib');
const json_lib = require('./local_lib/json_lib');
const picture_lib = require('./local_lib/picture_lib');
const utilities_lib = require('./local_lib/utilities_lib');

// ====================== CONSTANTS ======================
var DEFAULT_TARGET_WIDTH = 500
var first_load = true
var json_graph;

// ====================== ARGS HANDLER ======================

commander
  .version('1.0.0', '-v, --version')
  .usage('[OPTIONS]...')
  .option('-j, --input-json [path]', 'Input json to display. IF none provided, json will be created.')
  .option('-i, --input-folder [path]', 'Input pictures folders - <curr_directory>/input_pictures/ by default')
  .option('-t, --tmp-folder [path]', 'Folder to output reduced size pictures - <curr_directory>/input_pictures_reduced/ by default')
  .option('-w, --width [width]', 'Target width for reducing picture - default = 500')
  .option('-o, --output-folder [path]', 'Folder to store eventual outputs of the execution (not used for now) - <curr_directory> by default')
  .parse(process.argv);
//See : https://github.com/tj/commander.js/

// ====================== ARGS HANDLER ======================
// Resize if needed
var do_resize = commander.resize
var input_folder = commander.inputFolder ? commander.inputFolder : 'input_pictures';
var input_folder_reduced = commander.tmpFolder ? commander.tmpFolder : 'input_pictures_reduced';
var input_json = commander.inputJson ? commander.inputJson : 'graphe.json';
var resize_pictures = commander.tmpFolder == null ? false : true
var create_new_json = commander.inputJson == null ? false : true
var target_width = commander.width ? parseInt(commander.width) : DEFAULT_TARGET_WIDTH

// Path creation
input_folder = path.join(__dirname, input_folder)
tmp_folder_reduced = path.join(__dirname, input_folder_reduced)
input_json = path.join(__dirname, input_json)

// ====================== SERVING ======================

// Gives access to the public folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules', 'visjs-network', 'dist')));
if(resize_pictures){
    app.use(express.static(tmp_folder_reduced));
} else {
    app.use(express.static(input_folder));
}

// Serve the home page of the application
app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ====================== LOADING ======================

// Handle json load
if(create_new_json){
    console.log("Loading of an existing graphe.")
    json_graph = json_lib.load_file(input_json)
} else {
    console.log("Creation of a new graphe.")
    json_graph = json_lib.create_new_json(input_folder)
}

console.log("Current graph : ")
console.log(json_graph)

// Sucessful connexion of a user
io.on('connection', function(socket){
  console.log('A new user is connected');

  socket.on('ask_json', function(msg){action_lib.send_json(msg,json_graph,socket);} );

  socket.on('add_edge', function(msg){action_lib.add_edge(msg,json_graph,socket);} );
  socket.on('rem_edge', function(msg){action_lib.rem_edge(msg,json_graph,socket);} );

  socket.on('add_node', function(msg){action_lib.add_node(msg,json_graph,socket);} );
  socket.on('edit_node', function(msg){action_lib.edit_node(msg,json_graph,socket);} );

  /* socket.on('add_anchor', function(msg){action_lib.add_anchor(msg,json_graph,socket);} );
  socket.on('edit_anchor', function(msg){action_lib.edit_anchor(msg,json_graph,socket);} );
  socket.on('rem_anchor', function(msg){action_lib.rem_anchor(msg,json_graph,socket);} ); */

});

console.log("Target width :", target_width)
http.listen(3000, action_lib.reduce_and_serve(resize_pictures, target_width , input_folder, tmp_folder_reduced));
// Socket.io cheatsheet : https://socket.io/docs/emit-cheatsheet/