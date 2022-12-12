const fs = require('fs')

var FileHandler = function(){}

FileHandler.prototype =  {
   createDirIfNotExists: function(path){
    if(!fs.existsSync(path)){
      var pathDown = path.split('\\')
        pathDown.pop()
      if(this.createDirIfNotExists(pathDown.join('\\'))){
        fs.mkdirSync(path)
        return true
      }
    }else{
      // console.log(`path ${path} existe`)
      return true;
    }
  }
}

module.exports = FileHandler
