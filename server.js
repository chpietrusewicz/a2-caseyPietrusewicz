const http = require( 'http' ),
      fs   = require( 'fs' ),
      // IMPORTANT: you must run `npm install` in the directory for this assignment
      // to install the mime library if you're testing this on your local machine.
      // On Render, make sure `npm install` is your build command.
      mime = require( 'mime' ),
      dir  = 'public/',
      port = 3000

const appdata = [
  { 'item': 'Milk', 'category': 'Fridge', 'quantity': 1, 'utilization' : 'High', 'status': 'Need' },
  { 'item': 'Pasta', 'category': 'Pantry', 'quantity': 5, 'utilization' : 'Low', 'status': 'Have' }
]

const server = http.createServer( function( request,response ) {
  if( request.method === 'GET' ) {
    handleGet( request, response )    
  }else if( request.method === 'POST' ){
    handlePost( request, response ) 
  }else if ( request.method === 'DELETE' ){
    handleDelete( request, response )
  }else if (request.method === 'PATCH') {
  handleUpdate(request, response)
  }
})

const handleGet = function( request, response ) {
  const filename = dir + request.url.slice( 1 ) 

  if( request.url === '/' ) {
    sendFile( response, 'public/index.html' )
  }else if ( request.url === '/data' ) {
    response.writeHead( 200, "OK", { 'Content-Type': 'text/plain' })
    response.end( JSON.stringify( appdata ) )
  }else{
    sendFile( response, filename )
  }
}

const handlePost = function( request, response ) {
  let dataString = ''

  request.on( 'data', function( data ) {
      dataString += data 
  })

  request.on( 'end', function() {
    console.log( JSON.parse( dataString ) )
    const data = JSON.parse( dataString )
    
    const quantity = Number(data.quantity)
    const utilization = data.utilization
    let status
    if (quantity <= 1 && utilization === 'High' || quantity <= 0) {
      status = 'Need'
    }
    else {
      status = 'Have'
    }

    appdata.push({ 'item': data.item, 'category': data.category, 'quantity': quantity, 'utilization': utilization, 'status': status })

    response.writeHead( 200, "OK", {'Content-Type': 'text/plain' })

    // change this to incorporate data
    response.end( JSON.stringify(appdata) )
  })
}

const handleDelete = function( request, response ) {
  console.log(request.url)
  const index = parseInt(request.url.split('/')[2])
  console.log(index)
  if (!isNaN(index) && index >= 0 && index < appdata.length) {
    appdata.splice(index, 1)
    response.writeHead( 200, "OK", {'Content-Type': 'text/plain' })
    response.end( JSON.stringify(appdata) )
  } else {
    response.writeHead( 400, "Bad Request", {'Content-Type': 'text/plain' })
    response.end( JSON.stringify({ error: 'Invalid index' }) )
  }
}

const handleUpdate = function(request, response) {
  const index = parseInt(request.url.split('/')[2])
  let dataString = ''

  request.on('data', function(data) {
    dataString += data
  })

  request.on('end', function() {
    const data = JSON.parse(dataString)
    const quantity = Number(data.quantity)

    if (
      isNaN(index) ||
      index < 0 ||
      index >= appdata.length ||
      !Number.isFinite(quantity) ||
      quantity < 0
    ) {
      response.writeHead(400, 'Bad Request', {
        'Content-Type': 'application/json'
      })
      response.end(JSON.stringify({ error: 'Invalid quantity or index' }))
      return
    }

    appdata[index].quantity = quantity
    appdata[index].status =
      quantity <= 1 && appdata[index].utilization === 'High' || quantity <= 0
        ? 'Need'
        : 'Have'

    response.writeHead(200, 'OK', {
      'Content-Type': 'application/json'
    })
    response.end(JSON.stringify(appdata))
  })
}

const sendFile = function( response, filename ) {
   const type = mime.getType( filename ) 

   fs.readFile( filename, function( err, content ) {

     // if the error = null, then we've loaded the file successfully
     if( err === null ) {

       // status code: https://httpstatuses.com
       response.writeHeader( 200, { 'Content-Type': type })
       response.end( content )

     }else{

       // file not found, error code 404
       response.writeHeader( 404 )
       response.end( '404 Error: File Not Found' )

     }
   })
}

server.listen( process.env.PORT || port )
