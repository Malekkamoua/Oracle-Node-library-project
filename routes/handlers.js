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
        `DROP TABLE livre`,
        `DROP TABLE image_user`,
        `CREATE TABLE livre (id NUMBER, titre varchar2(20),auteur varchar2(20),image ORDImage,image_sig ORDSYS.ORDImageSignature) LOB (image.source.localData) store as (chunk 32k)`,
        `CREATE TABLE image_user (id NUMBER,image ORDImage ,image_sig ORDSYS.ORDImageSignature) LOB (image.source.localData) store as (chunk 32k)`
    ];

    for (const s of stmts) {
        try {
            await connection.execute(s);
        } catch (e) {
            if (e.errorNum != 942)
                console.error(e);
        }
    }
    res.send("data base created")
});

router.get('/livres', async (req, res) => {
    connection = await oracledb.getConnection(dbConfig);
    let sql = `SELECT * from livre`;
    const result = await connection.execute(sql);
    let listLivres = []
    result.rows.forEach(element => {
        let livre = {
            titre: element[1],
            auteur: element[2],
            imagename: element[3].SOURCE.SRCNAME
        }
        listLivres.push(livre)
    });
    console.log(listLivres)
    res.render('index', {
        livres: listLivres
    });
});

router.post('/livres', upload.single('image'), async (req, res) => {
    connection = await oracledb.getConnection(dbConfig);
    let result;
    let sql_1 = `SELECT * from livre`;
    result = await connection.execute(sql_1);

    let id = result.rows.length + 1;
    let titre = req.body.titre; //tittre du livre
    let auteur = req.body.auteur; //nom auteur
    let image = req.file; //nom image
    console.log(id, titre, auteur, image.originalname)

    result = await connection.execute(
        `BEGIN
                   add_livre(:id,:titre,:auteur,:image);
                 END;`, {
            id: {
                val: id,
                dir: oracledb.BIND_IN,
                type: oracledb.NUMBER
            }, // Bind type is determined from the data.  Default direction is BIND_IN
            titre: {
                val: titre,
                dir: oracledb.BIND_IN,
                type: oracledb.STRING
            },
            auteur: {
                type: oracledb.STRING,
                dir: oracledb.BIND_IN,
                val: auteur
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
router.post("/searchimage",upload.single('afile'),async(req,res)=>{
    connection = await oracledb.getConnection(dbConfig);
   
   let image = req.file; //nom image
    
 console.log(image.originalname)

 let result = await connection.execute(
    `BEGIN
               load_image('${image.originalname}');
             END;`)
 result = await connection.execute(
                `BEGIN
                update image_user set image_sig=ORDSYS.ORDImageSignature.init()
                where id=1;
                         END;`)
result = await connection.execute(
                            ``)

    
console.log(result);

})

module.exports = router;