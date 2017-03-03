/**
 * Created by Mikael Lindahl on 2017-02-13.
 */

'use strict';

const code = require( "code" );
const debug = require( 'debug' )( 'hapi_handlers:lib/test/index' );
const Lab = require( "lab" );
const path = require( 'path' );
const serverPromise = require( './test_server.js' );
const fs = require( 'fs-extra' );

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
let _copy_from = path.join( path.resolve(), 'lib', 'views', 'orchestra', 'templates', 'raw.html' );
let _copy_to = path.join( path.resolve(), 'lib', 'views', 'orchestra', 'templates', 'raw0.html' );

// The order of tests matters!!!
lab.experiment( "hapi page view", () => {

    //lab.after( done => {
    //
    //    fs.copySync( _copy_to, _copy_from )
    //    fs.removeSync( _copy_to )
    //
    //    done()
    //
    //} );

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

    //lab.test( 'Test getOrchestraView with callbacks, exclude, include, no raw.html, missing template and params', ( done ) => {
    //
    //    options.templates = [
    //        { id: 'head', param:'head', path:'orchestra/templates/head.html'},
    //        { id: 'body', param:'body', path:'body.html'},
    //        { id: 'raw', param:'raw', path:'raw.html'}
    //        ];
    //
    //    options.directors=[{id:'director', path:'orchestra/director.html'}];
    //    options.views = './lib/views';
    //    options.name = 'controller';
    //
    //    serverPromise( options ).then( server => {
    //
    //        fs.copySync( _copy_from, _copy_to )
    //        fs.removeSync( _copy_from )
    //
    //        request.server = server;
    //
    //        let view = server.methods.controller.getOrchestraView( {
    //            callbacks: [( req, params, done ) => {done()}],
    //            include: ['head', 'body', 'raw'],
    //            params: {}
    //        } );
    //
    //        _done = done;
    //        view( {}, reply );
    //        console.dir( view );
    //
    //        debug( 'view', JSON.stringify( view, null, 4 ) )
    //
    //    } )
    //
    //} );

    //lab.test( 'Test getOrchestraView no raw.html, but in optional.templates and no substitute', ( done ) => {
    //
    //    options.templates = ['head', 'icons', 'body','footer', 'scripts'];
    //    options.paths = {
    //        director: 'orchestra/',
    //        templates: 'orchestra/templates/',
    //        pages: '',
    //        views: './lib/views'
    //    };
    //    options.name = 'controller';
    //
    //    serverPromise( options ).then( server => {
    //
    //        request.server = server;
    //
    //        let view = server.methods.controller.getOrchestraView(  );
    //
    //        _done = done;
    //        view( {}, reply );
    //        console.dir( view );
    //
    //        debug( view, JSON.stringify( view, null, 4 ) )
    //
    //    } )
    //
    //} );

} )