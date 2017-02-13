/**
 * Created by Mikael Lindahl (mikael) on 10/3/16.
 */

'use strict';

const hapiPageView = require( "../index.js" );

const Hapi = require( 'hapi' );
const Promise = require( 'bluebird' );
const debug = require( 'debug' )( 'hapi_account:test_server' );
const vision = require( 'vision' );
const handlebars = require( 'handlebars' );
const path = require( 'path' );

function getServerPromise( options ) {
    let server = new Hapi.Server();

    server.connection( { host: '0.0.0.0', port: 3000 } );

    return new Promise(resolve=>{

        server.register( [
            {
                register: vision,
            },
            {
                register: hapiPageView,
                options: options
            }

        ] )
            .then( ()=> {

                server.views( {
                    engines: {
                        html: handlebars
                    },
                    relativeTo: path.resolve(),
                    path: '../views'
                } );


                resolve(server)

            } )

    });

}

module.exports = getServerPromise;