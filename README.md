# visjs_classificator
Classificator for pictures matching and clustering. Fast and visual.

Uses VISjs and Socket.io to allow image classification/pairing, by hand, with multiuser.

Note : GIF performance is not representative of real time performance.
![Overview](./doc/pictures/overview.gif)


### Launch

> node server.js
or 
> ./launch_server.sh 

### Launch (dev)

if you have nodemon or want to develop the tool : 
> ./watch_server.sh 

### Interaction and usage
CTRL + clic to select more than one node at a time.
![Multiselection](./doc/pictures/multiselect.gif)

After a selection of multiple node, press "M" to create a complete graphe.
![CompleteGraphe](./doc/pictures/completegraphe.gif)

Double-clic on a node to make it "fixed" on the screen (your screen only)
![fixednode](./doc/pictures/fixednode.gif)fixednode

### Todo list 
- Rectangle selection
- When double clicqued and moved, the node stays where it is (fixed property isk kept on dragging)
- Simple and double arrows support
- Order on a grid

Good links to get started if you're lost : 
> https://medium.com/jeremy-keeshin/hello-world-for-javascript-with-npm-modules-in-the-browser-6020f82d1072 
> https://github.com/jkeesh/hello-browser-npm
> https://socket.io/docs/emit-cheatsheet/
