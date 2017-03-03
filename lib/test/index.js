/**
 * Created by Mikael Lindahl on 2017-02-13.
 */

'use strict';

const code = require( "code" );
const debug = require( 'debug' )( 'hapi_handlers:lib/test/index' );
const Lab = require( "lab" );
const path = require( 'path' );
const serverPromise = require( './test_server.js' );

let lab = exports.lab = Lab.script();

let options = {
        templates: [
            { id: 'my_head', param: 'head', path: 'orchestra/templates/head.html', compile:true },
            { id: 'my_body', param: 'body', path: 'main.html', compile:true },
            { id: 'my_body_2', param: 'body', path: 'main.html', compile:true },
            { id: 'my_raw', param: 'raw', path: 'orchestra/templates/raw.html', compile:false },
            { id: 'my_wrong', param: 'wrong', path: 'wrong.html', compile:false },
            { id: 'my_not_used', param: 'body', path: 'main.html', compile:false },

        ],

        directors: [{ id: 'my_director', path: 'orchestra/director.html' }],
        views: './lib/views',
        name: 'controller'

    };

// Mock a request
let request = {
    auth: {
        credentials: {
            user: 123
        }
    },

    payload: {
        'stuff': 1,
    },
};

let reply = {
    view: ( name, options ) => {

        _done()

    }

};

let _done;

// The order of tests matters!!!
lab.experiment( "hapi page view", () => {


    lab.test( 'Test getOrchestraView  with file not exists, template concatenation, include not used', ( done ) => {

        serverPromise( options ).then( server => {

            request.server = server;

            let view = server.methods.controller.getOrchestraView( {
                director:'my_director',
                include: ['my_head', 'my_body','my_body_2',  'my_raw', 'my_wrong'],
                params: {}
            } );
            _done = done;
            view( {}, reply )
            console.dir( view )

            debug( 'view', JSON.stringify( view, null, 4 ) )

        } )

    } );

    lab.test( 'Test getOrchestraView  with callbacks and no name', ( done ) => {

        delete options.name;

        debug(options)

        serverPromise( options ).then( server => {

            request.server = server;

            let view = server.methods.handler.getOrchestraView( {
                callbacks: [( req, params, done ) => {done()}],
                director:'my_director',
                include: ['my_head'],
                params: {}
            } );
            _done = done;
            view( {}, reply )
            console.dir( view )

            debug( 'view', JSON.stringify( view, null, 4 ) )

        } )

    } );
} )