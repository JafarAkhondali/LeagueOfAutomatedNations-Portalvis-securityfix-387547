var port = process.env.PORT || 3000,
    http = require('http'),
    https = require('https'),
    fs = require('fs'),
    url = require('url'),
    path = require('path');

var doTheStupidUpdate = require('./update');

var log = function(entry) {
    fs.appendFileSync('/tmp/sample-app.log', new Date().toISOString() + ' - ' + entry + '\n');
};

var server = http.createServer(function (req, res) {
    if (path.normalize(decodeURI(req.url)) !== decodeURI(req.url)) {
        res.statusCode = 403;
        res.end();
        return;
    }
    if (req.method === 'POST') {
        var body = '';

        req.on('data', function(chunk) {
            body += chunk.toString('utf8');
        });

        req.on('end', function() {
            if (req.url === '/') {
                log('Received message: ' + body);
            } else if (req.url == '/manualUpdate') {
                doTheStupidUpdate();
                log('Did manual update');
            }

            res.writeHead(200, 'OK', {'Content-Type': 'text/plain'});
            res.end();
        });
    } else {

        let parsed = url.parse(req.url,true); // true makes it an object
        //console.log(parsed.query);
        let uri = parsed.pathname;
        let filename = path.join(process.cwd(), 'public', uri);

        fs.exists(filename, function(exists) {
            if (!exists) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.write("404 Not Found\n");
                res.end();
                return;
            }

            if (fs.statSync(filename).isDirectory()) filename += 'index.html';

            fs.readFile(filename, 'binary', function(err, file) {
                if (err) {
                    res.writeHead(500, {"Content-Type": "text/plain"});
                    res.write(err + "\n");
                    res.end();
                    return;
                }

                res.writeHead(200);
                res.write(file, "binary");
                res.end();
            })
        })


        /*res.writeHead(200);
        res.write(html);
        res.end();*/
    }
});

// Listen on port 3000, IP defaults to 127.0.0.1
server.listen(port);

let schedule = require('node-schedule');
let testSchedule = '*/1 * * * *'; // every minute
let hourlySchedule = '0 */1 * * *'; // every hour
let dailySchedule = '0 2 */1 * *'; // every day at 2am
schedule.scheduleJob(dailySchedule, function(){
    console.log(new Date(), 'Updating data!');
    doTheStupidUpdate();
});

console.log('Server running at http://127.0.0.1:' + port + '/');
console.log(__dirname);