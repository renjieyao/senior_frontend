const http = require('http');

http.createServer((request, response)=>{
    let body = [];

    request.on('error',err=>{
        console.log(err);
    }).on('data',chunk=>{
        // body.push(chunk.toString());
        body.push(chunk);
    }).on('end',()=>{
        // body = Buffer.concat([Buffer.from(body.toString())]).toString();
        body = Buffer.concat(body).toString();

        console.log('body:',body);

        response.writeHead(200,{
            'Transfer-Encoding':'chunked',
            'Content-Type':'text/html',
        });

        response.end(`
            <html meta="a">
            <head>
                <style>
                    body div #myid{
                        width:100px
                    }
                </style>
            </head>
            <body>
                <div id="myid">
                
                </div>
            </body>
            </html>
        `)
    })
}).listen(8088);

console.log('server started');

