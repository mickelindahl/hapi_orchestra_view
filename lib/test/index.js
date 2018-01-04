/**
 * Created by Mikael Lindahl on 2017-02-13.
 */

'use strict';

const code = require( "code" );
const debug = require( 'debug' )( 'hapi_handlers:lib/test/index' );
const Lab = require( "lab" );
// const path = require( 'path' );
const serverPromise = require( './test_server.js' );

let lab = exports.lab = Lab.script();

let options = {
    server: {
        templates: [
            {id: 'my_head', param: 'head', path: 'orchestra/templates/head.html', compile: true},
            {id: 'my_body', param: 'body', path: 'main.html', compile: true},
            {id: 'my_body_2', param: 'body', path: 'main.html', compile: true},
            {id: 'my_raw', param: 'raw', path: 'orchestra/templates/raw.html', compile: false},
            {id: 'my_wrong', param: 'wrong', path: 'wrong.html', compile: false},
            {id: 'my_not_used', param: 'body', path: 'main.html', compile: false},

        ],

        directors: [{id: 'my_director', path: 'orchestra/director.html'}],
        views: './lib/views',
        name: 'controller'

    }
};

// The order of tests matters!!!
lab.experiment( "hapi page view", () => {


    lab.test( 'Test getOrchestraView  with file not exists, template concatenation, include not used',
        async () => {

            options.view={
                director:'my_director',
                include: ['my_head', 'my_body','my_body_2',  'my_raw', 'my_wrong'],
                params: {}
            };


        await serverPromise( options ).then( server => {


            return server.inject({
                method:'GET',
                url:'/'
            }).then(response=>{

                code.expect(response.result).to.include('html')

            })
        } )
    } );

    lab.test( 'Test getOrchestraView  with callbacks and no name',
        async () => {

            options.view={
                callbacks: [( params, done ) => {done()}],
                director:'my_director',
                include: ['my_head'],
                params: {}
            };


            await serverPromise( options ).then( server => {


                return server.inject({
                    method:'GET',
                    url:'/'
                }).then(response=>{

                    code.expect(response.result).to.include('html')

                })
            } )
        } );

} );