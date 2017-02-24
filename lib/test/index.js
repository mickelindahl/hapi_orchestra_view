/**
 * Created by Mikael Lindahl on 2017-02-13.
 */

'use strict';

const code = require( "code" );
const debug = require( 'debug' )( 'hapi_handlers:lib/test/index' );
const Lab = require( "lab" );
const path = require( 'path' );
const serverPromise = require( './test_server.js' );
const fs = require('fs-extra');

let lab = exports.lab = Lab.script();

let options = {
    model: 'test'

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

let reply={
    view:(name, options)=>{

        _done()

    }

};

let _done;
let _copy_from=path.join(path.resolve(), 'lib', 'views','orchestra', 'templates', 'raw.html');
let _copy_to=path.join(path.resolve(), 'lib', 'views','orchestra', 'templates', 'raw0.html');

// The order of tests matters!!!
lab.experiment( "hapi page view", ()=> {


    lab.after(done=>{

        fs.copySync(_copy_to, _copy_from)
        fs.removeSync(_copy_to)

        done()

    });

    lab.test( 'Test getOrchestraView', (done)=>{

        serverPromise( options ).then( server => {

            request.server = server;

            let view = server.methods.handler.getOrchestraView({name:'main'});

            _done=done;
            view({}, reply)
            console.dir(view)

            debug(view, JSON.stringify(view, null, 4))


        } )

    });

    lab.test( 'Test getOrchestraView with callbacks, exclude, include, no raw.html, missing template and params', (done)=>{

        options.templates = ['head','icons', 'footer', 'scripts', 'raw', 'wrong'];
        options.paths = {
            director: 'orchestra/',
            templates: 'orchestra/templates/',
            pages: '',
            views: './lib/views'
        };
        options.name='controller';

        serverPromise( options ).then( server => {

            fs.copySync(_copy_from, _copy_to)
            fs.removeSync(_copy_from)

            request.server = server;

            let view = server.methods.controller.getOrchestraView({
                name:'main',
                callbacks:[(req, params, done)=>{done()}],
                exclude:['head'],
                include:[ 'nav' ],
                params:{}
            });




            _done=done;
            view({}, reply);
            console.dir(view);

            debug(view, JSON.stringify(view, null, 4))


        } )

    });

    lab.test( 'Test getOrchestraView no raw.html and but in optional.templates', (done)=>{

        options.templates = ['head','icons', 'footer', 'scripts'];
        options.paths = {
            director: 'orchestra/',
            templates: 'orchestra/templates/',
            pages: '',
            views: './lib/views'
        };
        options.name='controller';

        serverPromise( options ).then( server => {

            request.server = server;

            let view = server.methods.controller.getOrchestraView({
                name:'main',
                callbacks:[(req, params, done)=>{done()}],
                exclude:['head'],
                include:[ 'nav' ],
                params:{}
            });




            _done=done;
            view({}, reply);
            console.dir(view);

            debug(view, JSON.stringify(view, null, 4))


        } )

    });

})