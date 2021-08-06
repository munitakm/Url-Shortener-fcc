require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const urlparser = require('url');
const dns = require('dns');

// Connecting to MongoDB
mongoose.connect(process.env.DB_URI,{useNewUrlParser:true,useUnifiedTopology:true});
const db =  mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open',() => { console.log('We are Connected to MongoDB...')})
// Creating a Model for the Database
const { Schema } = require('mongoose');
const schema = new Schema({url: String, });
const Url = mongoose.model('Url', schema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({extended: false}))

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// Project

app.post('/api/shorturl', async (req,res) => {
  const link = req.body.url;
  const urlParsed = urlparser.parse(link);
  dns.lookup(urlParsed.hostname, (err, address) => { 
   if(!address) { 
    res.json({error: "invalid url"})
   } else { 
     Url.findOne({url: link}, (err, found) => { 
      let urlItem = new Url({url: link})
       if(!found) { 
        urlItem.save((err, data) => { 
          res.json({original_url: urlItem.url, short_url: data.id});
        })
      } else {
        res.json({original_url: found.url, short_url: found.id})
        }
      }
     )
   }
  })
});

app.get("/api/shorturl/:id?", (req,res) => { 
  const id = req.params.id;
  Url.findById(id,(err, data) =>{ 
    if(!data) res.json({error: "invalid url"})
    res.redirect(data.url)
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
