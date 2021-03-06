/**
 * Created by Mikael Lindahl (mikael) on 10/3/16.
 */

'use strict';

const hapi_orchestra_view = require("../index.js");
const Hapi = require('hapi');
// const Promise = require( 'bluebird' );
// const debug = require( 'debug' )( 'hapi_account:test_server' );
const vision = require('vision');
const handlebars = require('handlebars');
const path = require('path');

async function getServerPromise(options) {
    let server = new Hapi.Server({host: '0.0.0.0', port: 3000});

    await server.register([
        {
            plugin: vision,
        },
        {
            plugin: hapi_orchestra_view,
            options: options.server
        }
    ])

    server.views({
        engines: {
            html: handlebars
        },
        relativeTo: path.resolve(),
        path: './lib/views'
    });

    server.route([{
        method:'GET',
        path:'/',
        config:{
            // response:{ failAction : (request, h, err)=>{debug(err); return err}}
        },

        handler:(request, h)=>{

            return h.viewOrchestra(options.view)


        }
    }])

    await  server.initialize();

    return server

}

module.exports = getServerPromise;