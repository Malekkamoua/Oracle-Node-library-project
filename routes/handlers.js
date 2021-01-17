const express = require('express');
const router = express.Router();
const dbConfig = require('../dbconfig');
const multer = require('multer')
const path = require('path');
const oracledb = require('oracledb')
var connection;
//Uploading cv
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, file.originalname);
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

async function run() {



    try {
        // Get a non-pooled connection
        connection = await oracledb.getConnection(dbConfig);

        console.log('Connection was successful!');

    } catch (err) {
        console.error(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}
run();

//create dir 
router.get('/createdir', async (req, res) => {
    connection = await oracledb.getConnection(dbConfig);
    let sql = `CREATE DIRECTORY DIR_MMDB_UAS AS 'C:\Musik_Tradisional';
    GRANT READ ON DIRECTORY DIR_MMDB_UAS TO c##skander`;

    await connection.execute(sql)
    res.send("your dir is created!! <3")
});

//create db 
router.get('/createdb', async (req, res) => {
    connection = await oracledb.getConnection(dbConfig);
    const stmts = [
        `CREATE TABLE person (id NUMBER, name varchar2(20),image ORDImage,image_sig ORDSYS.ORDImageSignature) LOB (image.source.localData) store as (chunk 32k)`,
        `CREATE TABLE image_user (id NUMBER,image ORDImage ,image_sig ORDSYS.ORDImageSignature) LOB (image.source.localData) store as (chunk 32k)`,
        
    ];

    for (const s of stmts) {
        try {
            await connection.execute(s);
            res.send("data base created")
        } catch (e) {
            if (e.errorNum != 942)
                console.error(e);
        }
    }

});

router.get('/persons', async (req, res) => {
    connection = await oracledb.getConnection(dbConfig);
    let sql = `SELECT * from person`;
    const result = await connection.execute(sql);
    let listpersons = []
    result.rows.forEach(element => {
        let person = {
            name: element[1],
            imagename: element[2].SOURCE.SRCNAME
        }
        listpersons.push(person)
    });
    console.log(listpersons)
    res.render('index', {
        persons: listpersons
    });
});

router.post('/persons', upload.single('image'), async (req, res) => {
    connection = await oracledb.getConnection(dbConfig);
    let result;
    let sql_1 = `SELECT * from person`;
    result = await connection.execute(sql_1);

    let id = result.rows.length + 1;
    let name = req.body.name; //tittre du person
    //let auteur = req.body.auteur; //nom auteur
    let image = req.file; //nom image
    //console.log(id, titre, auteur, image.originalname)

    result = await connection.execute(
        `BEGIN
                   add_person(:id,:name,:image);
                 END;`, {
            id: {
                val: id,
                dir: oracledb.BIND_IN,
                type: oracledb.NUMBER
            }, // Bind type is determined from the data.  Default direction is BIND_IN
            name: {
                val: name,
                dir: oracledb.BIND_IN,
                type: oracledb.STRING
            },
            image: {
                type: oracledb.STRING,
                dir: oracledb.BIND_IN,
                val: image.originalname
            }
        }
    );
    res.send('ajout avec succes')

});
router.post("/searchimage", upload.single('file'), async (req, res) => {
    connection = await oracledb.getConnection(dbConfig);

    let image = req.file; //nom image

    console.log(image.originalname)

let result = await connection.execute(
    `BEGIN
               load_image(:image);
               
             END;`,
             {
                 image: {
                val: image.originalname,
                dir: oracledb.BIND_IN,
                type: oracledb.STRING
            }
             })
//    result = await connection.execute(
//     `BEGIN
//                check_sim;
//              END;`)
    let sql = ` SELECT * from image_result 
                 `;
                
    
     result = await connection.execute(sql);  
             console.log(result);
     let sql2 = `
     
     DROP TABLE image_result PURGE 
     `
    ;        
     await connection.execute(sql2)
             
    let sql3 = `
     
     create table image_result(id number ,image_name varchar2(20)) 
     `
      await connection.execute(sql3)
     let listpersons = []
    result.rows.forEach(element => {
        let personsim = {
            name: element[1]
        }
        listpersons.push(personsim)
    });
    console.log(listpersons)
    res.render('result', {
        persons: listpersons
    });

})

module.exports = router;