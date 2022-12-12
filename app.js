var moment  = require('moment'),
    util	= require('util'),
    fs      = require('fs'),
    config  = require('./config'),
    path    = require('path'),
    asyncLoop		= require('node-async-loop'),
    chalk			= require('chalk'),
    helper  = require('./helper');
var debugLogStream = fs.createWriteStream(`./logs/${moment().format('DD-MM-YYYY HH;mm')+'.log'}`, {flags : 'a'});

console.log(chalk.green.bold('\t\t######  ######   ##### '));
console.log(chalk.green.bold('\t\t##   ## ##   ## ##   ##'));
console.log(chalk.green.bold('\t\t##   ## ##   ## ##   ##'));
console.log(chalk.green.bold('\t\t######  ######  #######'));
console.log(chalk.green.bold('\t\t##   ## ##   ## ##   ##'));
console.log(chalk.green.bold('\t\t##   ## ##   ## ##   ##'));
console.log(chalk.green.bold('\t\t######  ##   ## ##   ##'));
console.log(chalk.yellow.bold('\t\tAPAGADOR DE ARQUIVOS by GreenHand'));


console.log = function(content, deleteDate) {
    debugLogStream.write(`${deleteDate? ``: `${moment().format('DD/MM/YY HH:mm:ss:SSS')}: `}${util.format(content)} \n`);
    process.stdout.write(`${deleteDate? ``: `${moment().format('DD/MM/YY HH:mm:ss:SSS')}: `}${util.format(content)} \n`);
};

var arquivosAlvo = []

function deleteFile(file, callback){
  try {
    if(fs.existsSync(file)) {  
        fs.unlink(file, function(err) {
        console.log(`${file} - (SUCESSO)`)
        callback();      
    });
    } else {
      console.log(`${file} - (ERRO)`)
      callback();
    }
  } catch (e) {
    console.log(e)
    console.log(`${file} - (ERRO)`)
    callback();
  }

}

function syncDeleteFiles(files) {
  console.log(`INICIANDO APAGAMENTOS DE ${files.length} ARQUIVOS`)
  console.log('', true)
  asyncLoop(files, function (file, next){
    deleteFile(file, function(){
      next()
    })
  }, function (err){
    if (err){
      console.log('', true)
      console.log('Error: ' + err.message);
      console.log('', true)
    }
    console.log('', true)
    console.log('FINALIZANDO APAGAMENTOS!');
    console.log(`EM FUNCIONAMENTO ESPERANDO PRÓXIMA VARREDURA`)
  });
}

function getFiles(caminho_base, configuracao){
    
    if (!fs.existsSync(caminho_base)){
        console.log("no dir ",caminho_base);
        return;
    }

    console.log(`PASTA: ${caminho_base}`)

    var files=fs.readdirSync(caminho_base);
    
    for(var i=0;i<files.length;i++){
        var filename=path.join(caminho_base,files[i]);
        var stat = fs.lstatSync(filename);

        //se for uma pasta mapear os arquivos dentro da pasta
        if (stat.isDirectory()){
          //verifica uma pasta para ignorar
          if(configuracao.ignore_folder && configuracao.ignore_folder.length){
            var findedIgnoreFolder = false;

            configuracao.ignore_folder.forEach(folder => {
              if(filename.includes(folder,folder.length)){
                findedIgnoreFolder = true;
              }
            });
            if(!findedIgnoreFolder){
              getFiles(filename,configuracao); //recurse
            }

          }else{
            getFiles(filename,configuracao); //recurse
          }
        }else {  
          //se o arquivo for mais antigo que o limite de dias verificar as condições de formato
          if(moment().diff(moment(stat.birthtime), 'seconds') > configuracao.old_limit_days){
            //seleciona apenas arquivos do formato
            if(configuracao.select_formats && configuracao.select_formats.length){
              configuracao.select_formats.forEach(formato => {
                  if(filename.includes(formato,formato.length)){
                    arquivosAlvo.push(filename)
                  }
              });
            }else{
              //ignora apenas arquivos do formato
              if(configuracao.ignore_formats && configuracao.ignore_formats.length){
                var findedIgnoreFormat = false;
                configuracao.ignore_formats.forEach(formato => {
                  if(filename.includes(formato,formato.length)){
                    findedIgnoreFormat = true;
                  }
                });
                if(!findedIgnoreFormat){
                  arquivosAlvo.push(filename)
                }
              }else{
                //seleciona todos os arquivos
                arquivosAlvo.push(filename)
              }
            }
          }
        };
    };

};

function monitoring() {
  console.log(`INICIANDO VARREDURA`)
  arquivosAlvo = [];
  config.caminho_base.forEach(configuracao => {
    getFiles(configuracao.path, configuracao)
  });
  console.log(`VARREDURA CONCLUÍDA`)
  console.log(`${arquivosAlvo.length} ARQUIVOS ENCONTRADOS PARA DELETAR`);

  if(arquivosAlvo && arquivosAlvo.length){//if(arquivosAlvo && arquivosAlvo.length){
    syncDeleteFiles(arquivosAlvo)
  }else{
    console.log(`EM FUNCIONAMENTO ESPERANDO PRÓXIMA VARREDURA`);
  }

}

monitoring()

setInterval(monitoring, 2000); // a cada uma hora setInterval(monitoring, 1000 * 60 * 60 * 1);