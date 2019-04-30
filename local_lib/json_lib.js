// JSON handler and utilities
const fs = require('fs');

// ========
module.exports = {
  // Utility function to convert bmp-path to png-path
  bmp_to_png: function (nodes_list){
        // Loading nodes for modification (BMP..)
        nodes_list.forEach(tmp_obj => {
            file = tmp_obj["image"]

            // .BMP handling
            extension = file.split('.').pop();
            if(extension === "bmp"){
                file = file.substr(0, file.lastIndexOf(".")) + ".png";
            }

            tmp_obj["image"] = file
        });
        return nodes_list
    },
    load_file : function(file_path){ // JSON load
        try {
          if (fs.existsSync(file_path)) {
            //file exists
            console.log("Provided file to load : " + file_path + "\nLoading ... ")
            json_graph = JSON.parse(fs.readFileSync(file_path, 'utf8'));

            json_graph["nodes"] = bmp_to_png(json_graph["nodes"])

            // console.log("LOADED FINAL JSON (after BMP conversion if needed) : ")
            // console.log(json_graph)
            first_load = false

            return json_graph
          }
        } catch(err) {
          console.error(err)
        }
    },
    create_new_json :function(input_folder){ // JSON creation
        //Construct a basic object
        var json_graph = {}
        json_graph["nodes"] = []
        json_graph["edges"] = []

        //Read directory and add each file as a node
        id = 0
        fs.readdirSync(input_folder).forEach(file => {
            var tmp_obj = {
                "id" : id,
                "shape" : "image", // icon
                "image" : file
            }
            id += 1
            // console.log(tmp_obj);
            json_graph["nodes"].push(tmp_obj)
        });

        return json_graph
    }

};


