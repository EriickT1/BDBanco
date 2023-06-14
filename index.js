const http = require('http');
const fs = require('fs');
const url = require('url');
const {guardarUsuarios,consultaUsuarios,editarUsuarios,eliminarUsuarios,guardarTransferencia,getTransferencias} = require('./conexionBD')

const port = 3000;

http
    .createServer( async (req,res)=>{

        if(req.url == '/' && req.method =="GET"){
            res.setHeader("Content-Type","text/html");
            res.end(fs.readFileSync("index.html","utf8"));
        }
        //Guarda usuarios nuevos
        if(req.url =='/usuario' && req.method == 'POST'){
            let body = "";
            req.on("data",(chunk)=>{
                body = chunk.toString();
            });
            req.on("end",async()=>{
                try{
                const data = Object.values(JSON.parse(body));
                const respuesta = await guardarUsuarios(data);
                res.end(JSON.stringify(respuesta))
                }catch(err){
                    res.statusCode = 500;
                    res.end('Error :',err);
                }
            });
        }
        //Muestra los usuarios registrados
        if(req.url == '/usuarios' && req.method =='GET'){
            const registros = await consultaUsuarios();
            res.end(JSON.stringify(registros))
        }
        //Edita Usuarios
        if(req.url.startsWith('/usuario?id') && req.method =='PUT'){
            let body="";
            req.on("data",(chunk)=>{
                body = chunk.toString();
            });
            req.on("end",async()=>{
                try{
                const{ id }= url.parse(req.url,true).query;
                const data = JSON.parse(body);
                const respuesta = await editarUsuarios(data,id);
                res.statusCode = 200;
                res.end(JSON.stringify(respuesta));
                }catch(err){
                    res.statusCode = 500;
                    res.end("Ocurrio un problema con el servidor..",err)
                }
            })
        }
        //Elimina usuarios
        if(req.url.startsWith('/usuario?id') && req.method =='DELETE'){
            const{ id }= url.parse(req.url,true).query;
            const respuesta= await eliminarUsuarios(id);
            res.end("usuario eliminado")

        }
        //Muestra transferencias registradas
        if(req.url =='/transferencias' && req.method == 'GET'){
            try{
            const registros = await getTransferencias();
            res.end(JSON.stringify(registros))
            }catch(err){
                res.statusCode = 500;
                res.end("Ocurrio un problema en el servidor ..",err)
            }
        }
        //Guarda nuevas transferencias
        if(req.url =='/transferencia' && req.method == 'POST'){
            let body = "";
            req.on("data",(chunk)=>{
                body += chunk;
            });
            req.on("end",async()=>{
                try{

                const transferencia = Object.values(JSON.parse(body));
                console.log(transferencia)

                const respuesta = await guardarTransferencia(transferencia);
                console.log(respuesta)
                if(typeof respuesta == 'string'){
                    const ObjError = {
                        error:respuesta
                    }
                    console.log("error dentro de la funcion transaccion");
                    res.end(JSON.stringify(ObjError));

                }else{
                    res.statusCode = 201;
                    res.end(JSON.stringify(respuesta));
                }
                
                }catch(err){
                    res.statusCode = 500;
                    res.end(console.log(err,err.code));
                }
            });
        }
    }).listen(port, ()=> console.log('Server ON :',port));