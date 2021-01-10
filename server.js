// Importing libraries
const express = require('express');
const app = express();
const expbs = require('express-handlebars');
const path = require('path');
var bodyParser = require('body-parser')

// Importing files
const routes = require('./routes/handlers');


// Sending static files with Express 
app.use(express.static('images'));
//body parser
app.use(bodyParser.json())


const hbs = expbs.create({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/mainLayout'), // change layout folder name


    // create custom express handlebars helpers
    helpers: {
        calculation: function(value) {
            return value * 5;
        },

        list: function(value, options) {
            let out = "<ul>";
            for (let i = 0; i < value.length; i++) {
                out = out + "<li>" +  options.fn(value[i]) + "</li>";
            }
            return out + "</ul>";
        }
    }
});


// Express Handlebars Configuration
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');


// Configure Routes
app.use('/', routes);


app.listen(8080, () => {
    console.log('Server is starting at port ', 8080);
});