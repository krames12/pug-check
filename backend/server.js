const https = require('https');
const express = require('express');
const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.send('ohai there');
});

app.get('/thing', (req, res) => {
   res.send('this is thing'); 
});

app.get('/us/:server/:characterName', (req, res) => {
    getCharacterInfo(req, res, displayParsedData);
});

app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});

function getCharacterInfo(characterReq, characterRes, callback) {
    https.get('https://us.api.battle.net/wow/character/' + characterReq.params.server +  '/' + characterReq.params.characterName + '?fields=progression,items&locale=en_US&apikey=APIKEY', (res) => {
        
        res.setEncoding('utf8');
        
        console.log('statusCode:', res.statusCode);
        console.log('headers:', res.headers);
        console.log('Request made for ' + characterReq.params.characterName + ' on the server ' + characterReq.params.server);
        
        // variable for incoming data
        var body = '';
        
        // parses through data as it's recieved. buffer or not.
        res.on('data', (d) => {
            //process.stdout.write(d);
            body += d;
        });
        
        // parses the recieved data and sends it to the callback function. also catches any errors.
        res.on('end', () => {
           try {
               var parsed = JSON.parse(body);
           } catch (err) {
               console.error('Unable to parse: ', err);
               return callback(err);
           }
           
           callback(null, parsed, characterRes);
        });

    }).on('error', (e) => {
        console.error(e);
    });
}

function sortParsedData(err, data) {
    if (err) throw err;
    
    var sortData = {
        "name": data.name,
        "realm": data.realm,
        "itemLevel": data.items.averageItemLevel,
        "progress": data.progression.raids
    }
    
    return sortData;
}

function displayParsedData(err, data, originRes) {
    if (err) throw err;
    var sortedData = sortParsedData(err, data);
    console.log('sortedData: ' + sortedData);
    originRes.send(sortedData);
}

app.listen(8080, () => {
    console.log('app is listening to port 8080');
});