const puppeteer = require( "puppeteer-core" );
const net = require( "net" );
const process = require( "process" );

const port = process.argv[2] ?? 9222;
const userDataDir = process.argv[3];

const portInUse = function( port, callback ) {
	var server = net.createServer( function( socket ) {
		socket.write( "Echo server\r\n" );
		socket.pipe( socket );
	} );

	server.listen( port, "127.0.0.1" );
	server.on( "error", function ( e ) {
		callback( true );
	} );
	server.on('listening', function (e) {
		server.close();
		callback(false);
	} );
};

portInUse( port, function( inUse ) {
	if ( inUse ) {
		console.log( "Port(" + port + ") is already in use." );
		process.exit( 1 );
	} else {
		const options = {
			executablePath: "/usr/bin/chromium-browser",
			args: [ "--remote-debugging-port=" + port ]
		};
		if ( userDataDir )
			options.args.push( "--user-data-dir=" + userDataDir );

		puppeteer.launch( options ).then( browser => {
			if ( browser )
				console.log( "Browser started." );
			else {
				console.log( "Browser didn't start." );
				process.exit( 1 );
			}
		} ).catch( () => {
			console.log( "Browser didn't start." );
			process.exit( 2 );
		} );
	}
} );

