const {Pool} = require('pg');
const moment = require('moment')


const config = {
    user:"postgres",
    host:"localhost",
    password:"1234",
    database: "bancosolar",
    port: 5432,
};

const pool = new Pool(config);

 const guardarUsuarios = async(data)=>{
     const values = Object.values(data);
     const consulta ={
         text:'INSERT INTO usuarios (nombre,balance,estado) VALUES ($1,$2,true) RETURNING*;',
         values
    }

    try{
        const result = await pool.query(consulta);
        return result;
    }catch(err){
        console.log(err);
    }
 }


const consultaUsuarios = async()=>{
    try{
        const result = await pool.query(`SELECT * FROM usuarios WHERE estado = 'true'`);
        return result.rows;
    }catch(err){
        console.log(err);
    };
};

const editarUsuarios = async(data,id)=>{
    const values = Object.values(data)
    const editar = {
        text:`UPDATE usuarios SET nombre=$1, balance=$2 WHERE id=${id} RETURNING*  `,
        values,
   }

   try{
       const result = await pool.query(editar);
       return result;
   }catch(err){
       console.log(err);
   }
}

const eliminarUsuarios = async (id) => {
    try {
    const result = await pool.query(
    `UPDATE usuarios SET estado = 'false' WHERE id=${id} RETURNING *;`
    );
    return result;
    } catch (error) {
    console.log(error.code);
    return error;
    }
};
const getTransferencias = async () =>{
    const consulta = {
        text:"SELECT nombre AS emisor ,(select nombre from usuarios where id = transferencias.receptor) AS receptor,monto,fecha from usuarios LEFT JOIN transferencias ON usuarios.id = transferencias.emisor  WHERE receptor IS NOT NULL;",
        rowMode:"array",
    }
    const result = await pool.query(consulta);
    return result.rows;
}

const guardarTransferencia = async (data) =>{ 
    let fecha = moment().format('YYYY MM DD, HH:MM');
    // const values = Object.values(data);
    const consultaTotal ={
        text:`INSERT INTO transferencias(emisor,receptor,monto,fecha)VALUES((SELECT id from usuarios where nombre = $1),(select id from usuarios where nombre =$2),$3,'${fecha}')`,
        values:[data[0],data[1],Number(data[2])]
    }
    console.log(data[0],data[1],data[2]);

    const consultaReceptor = {
        text:`UPDATE usuarios SET balance = balance + $2 WHERE id = (SELECT id FROM usuarios WHERE nombre = $1)`,
        values:[data[1],Number(data[2])]
    }
    console.log(data[1],Number(data[2]))
    const consultaEmisor = {
        text:`UPDATE usuarios SET balance = balance - $2 WHERE id = (SELECT id FROM usuarios WHERE nombre = $1)`,
        values:[data[0],Number(data[2])]
    }   
    console.log(data[0],Number(data[2]))
    try{    
        await pool.query("BEGIN");
            await pool.query(consultaTotal);
            await pool.query(consultaReceptor);
            await pool.query(consultaEmisor);
        await pool.query("COMMIT");
        return true;
    }catch(err){
        await pool.query("ROLLBACK");
        throw err;
    }

}



module.exports = {guardarUsuarios,consultaUsuarios,editarUsuarios,eliminarUsuarios,guardarTransferencia,getTransferencias}
