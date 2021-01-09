const express = require('express');
const router = express.Router();
const dbConfig = require('../dbconfig');
const multer = require('multer')
const path = require('path');

//Uploading cv
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, Date.now() + path.extname(file.originalname));
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

    var connection;

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

    let sql = `DROP DIRECTORY Musik_Tradisional ;
    CREATE DIRECTORY DIR_MMDB_UAS
    AS 'C:\Musik_Tradisional';
    GRANT READ ON DIRECTORY DIR_MMDB_UAS TO c##skander`;

    await connection.execute(sql)

});

//create db 
router.get('/createdb', async (req, res) => {

    let sql = `CREATE TABLE livre(

        id NUMBER,
        titre varchar2(20),
        auteur varchar2(20),
        image ORDImage

        LOB (image.source.localData) store as (chunk 32k);
        
        Desc livre;`;

    await connection.execute(sql)

});

router.get('/livres', (req, res) => {

    let sql = `SELECT * from livre`;
    const result = await connection.execute(sql);

    console.log(result.rows)
});

router.post('/livres', upload.single('image'), (req, res) => {

    let sql_1 = `SELECT * from livre`;
    const result = await connection.execute(sql_1);

    let id = result.rows.length + 1;
    let titre = req.body.titre; //tittre du livre
    let auteur = req.body.auteur; //nom auteur
    let image = req.file.path; //nom image

    const sql = `set serveroutput on;
            DECLARE
            img ORDImage;
            ctx RAW(64) := NULL;
            BEGIN
            INSERT
            INTO livre(id,titre,auteur,image)
            VALUES(${id},${titre},${auteur},ORDImage.init('FILE','DIR_MMDB_UAS',${image} )) 
            returning image
                INTO img;
            img.import(ctx);
                UPDATE livre SET image = img 
                WHERE id = ${id};
                COMMIT;
                END;
            /`;

    const result = await connection.execute(sql);
    console.log(result.rows)

});

// Routing 
router.get('/', (req, res) => {
    res.render('index', {
        test: '<h3>Welcome to New Orlands</h3>'
    });
});


router.get('/about', (req, res) => {
    res.render('about', {
        title: 'About Me',
        style: 'about.css',
        description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Temporibus, eligendi eius! Qui'
    });
});



router.get('/dashboard', (req, res) => {

    res.render('dashboard', {
        isListEnabled: true,
        style: 'dashboard.css',
        author: {
            firstName: 'Peter',
            lastName: 'James',
            project: {
                name: 'Build Random Quote'
            }
        }
    });
});

router.get('/each/helper', (req, res) => {

    res.render('contact', {
        people: [
            "James",
            "Peter",
            "Sadrack",
            "Morissa"
        ],
        user: {
            username: 'accimeesterlin',
            age: 20,
            phone: 4647644
        },
        lists: [{
                items: ['Mango', 'Banana', 'Pinerouterle']
            },

            {
                items: ['Potatoe', 'Manioc', 'Avocado']
            }
        ]
    });
});



router.get('/look', (req, res) => {

    res.render('lookup', {
        user: {
            username: 'accimeesterlin',
            age: 20,
            phone: 4647644
        },
        people: [
            "James",
            "Peter",
            "Sadrack",
            "Morissa"
        ]
    });
});

module.exports = router;