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
 *   - `params` Object `{key:values}` made available to templates for `handlebars.compile`
 *   - `substitute` object with contains `key:value` pairs where key is a
 *   default template name (excluding .html) and value is path relative view under view
 *   folder where substitute template sits.
 *
 * @returns {Promise}
 */
function getOrchestraView( options ) {

    options = options || {};
    options.params = options.params || {};

    return ( request, reply ) => {

        debug('getOrchestraView', options);

        _evokeCallbacks( request, options ).then( () => {


            let templates = JSON.parse( JSON.stringify( _templates ) ); //copy

            if (options.include){

                templates.concat(options.include)

            }

            let view_options = {};
            let page;
            let file;

            debug('getOrchestraView', templates);

            templates.forEach( s => {

                if ( (options.exclude && options.exclude.indexOf( s ) != -1 )
                    || s=='raw') {
                    return
                }

                let file;


                if (options.substitute && options.substitute[s]){

                    file = path.join( _paths.views, options.substitute[s])

                } else {

                    file = path.join( _paths.views, _paths.templates, s + '.html' );

                }

                if ( !fs.existsSync( file ) ) {

                    console.error('WARNING: missing file '+file)

                    return
                }

                debug('getOrchestraView', file);

                page = fs.readFileSync( file ).toString();


                if (options.add && options.add[s]){

                    file = path.join( _paths.views, options.add[s])

                    if ( !fs.existsSync( file ) ) {

                        console.error('WARNING: missing file '+file)

                        return
                    }

                    page += fs.readFileSync( file ).toString();

                }

                view_options[s] = handlebars.compile( page )( options.params );

            } );


            if (templates.indexOf('raw') != -1){

                // Add un-compiled template file
                let file_raw = path.join( _paths.views, _paths.templates, 'raw.html' );

                debug('file raw', file_raw)

                if ( !fs.existsSync( file_raw ) ) {

                    console.error('WARNING: missing file '+file_raw)


                }else{

                    view_options.raw = fs.readFileSync( file_raw ).toString();

                }
            }

            reply.view( _paths.director+'director', view_options )

        } )
    }
}

/**
 * - `options` Object with the following keys
 *   - `name` [optional] name of object that are attached to server.methods holding library function/s
 *   - `templates` Array List with names of parts files to include
 *   - `paths` Object with the following keys
 *     - `director` String Path relative view folder to `director.html` file
 *     - `parts` String Path relative view folder to `parts` directory
 *     - `pages` String Path relative view folder to `pages` directory
 *     - `views` String Path to view folder
 */
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
