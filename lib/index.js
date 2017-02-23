/**
 * Created by Mikael Lindahl on 2017-02-13.
 */

'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
const Promise = require( 'bluebird' );
const handlebars = require('handlebars');
const debug = require('debug')('hapi_orchestra_view:lib:test:index.js')

let _templates;
let _paths;

/**@module server.methods.handler */

let _evokeCallbacks = ( request, options ) => {

    let promise = Promise.resolve();

    if ( ! options.callbacks ) {

        return promise

    }

    options.callbacks.forEach( call => {

        promise = promise.then( () => {

            return new Promise( resolve => {
                call( request, options.params, resolve )
            } );

        } )

    } );

    return promise

};


/**
 *  Create a view by composing files in the  `templates` directory
 *  through the `director.html`
 *
 * - `options` Object with the following keys
 *   - `callbacks` Array with functions `function(request, params, done)
 *   - `exclude` String [optional] Name of part files to exclude (without `.html` ending)
 *   - `include` String [optional] Name of part files to include (without `.html` ending)
 *   - `name` String [required] hapijs server request object
 *   - `params` Object with keys with values that are made avialable to templates in handlebar compilation
 *
 * @returns {Promise}
 */
function getOrchestraView( options ) {

    options.params = options.params || {};

    return ( request, reply ) => {

        debug('getOrchestraView');

        _evokeCallbacks( request, options ).then( () => {

            let name = options.name;
            let templates = JSON.parse( JSON.stringify( _templates ) ); //copy

            templates.push( name );

            if (options.include){

                templates.concat(options.include)

            }

            let view_options = {};
            let page;
            let file;

            debug('getOrchestraView', templates);

            templates.forEach( s => {

                if ( options.exclude && options.exclude.indexOf( s ) != -1 ) {
                    return
                }

                if ( s == name ) {

                    file = path.join( _paths.views, _paths.pages, s + '.html' );
                    s = 'body';

                } else {

                    file = path.join( _paths.views, _paths.templates, s + '.html' );

                }

                if ( !fs.existsSync( file ) ) {

                    return
                }

                debug('getOrchestraView', file);

                page = fs.readFileSync( file ).toString();

                view_options[s] = handlebars.compile( page )( options.params );

            } );

            // Add uncompiled template file
            let file_raw = path.join( _paths.views, _paths.templates, 'raw.html' );

            debug('file raw', file_raw)

            if ( fs.existsSync( file_raw ) ) {

                debug('add raw')

                view_options.templates = fs.readFileSync( file_raw ).toString();

            }

            reply.view( _paths.director+'director', view_options )

        } )
    }
}

exports.register = function ( server, options, next ) {

    _templates = options.templates || ['head', 'nav', 'icons', 'footer', 'scripts', 'raw'];
    _paths = options.paths || {
            director: 'orchestra/',
            templates: 'orchestra/templates/',
            pages: '',
            views: './lib/views'
        };

    server.method( [
        {
            name: (options.name || 'handler')+'.getOrchestraView',
            method: getOrchestraView,
            options: {}
        }] );

    next();
};

exports.register.attributes = {
    name: 'page',
    version: '1.0.0'
};
