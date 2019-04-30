// Picture library to handle
// ========
module.exports = {
  create_resize_folder: function (resize_pictures, input_folder, tmp_folder_reduced) {

    // Create temporary folder and
    if(resize_pictures){
        // Create output folder if needed
        if (!fs.existsSync(tmp_folder_reduced)){
            fs.mkdirSync(tmp_folder_reduced);
        }

        app.use(express.static(tmp_folder_reduced));
    } else {
        app.use(express.static(input_folder));
    }
  },
  bar: function () {
    // whatever
  }
};


