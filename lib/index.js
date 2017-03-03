/**
 * Created by Mikael Lindahl on 2017-02-13.
 */

'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
const Promise = require( 'bluebird' );
const handlebars = require( 'handlebars' );
const debug = require( 'debug' )( 'hapi_orchestra_view:lib:test:index.js' )

let _options;

/**@module server.methods.handler */

let _evokeCallbacks = ( request, options ) => {

    let promise = Promise.resolve();

    if ( !options.callbacks ) {

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
 * - `options` {object} with the following keys
 *   - `callbacks` {array} Array with callback
 *     - `[](request, params, done)` {callback}
 *       - `request` {object} hapijs request object
 *       - `params` {object} object holding params used at template compilation
 *       - `done` {promise.resolve} Function called at completion
 *   - `director` {string} id of director to use
 *   - `include` {string} Template ids to include
 *   - `params` Object `{key:values}` made available to templates for `handlebars.compile`
 *
 * @returns {Promise}
 */
function getOrchestraView( options ) {

    return ( request, reply ) => {

        debug( 'getOrchestraView', options );

        _evokeCallbacks( request, options ).then( () => {

            let templates = _options.templates.reduce((tot, val)=>{


                if(options.include.indexOf(val.id)!=-1){

                    tot.push(val)

                }

                return tot

            }, []);

            let ids=_options.directors.map((v)=>{return v.id});
            let director = _options.directors[ids.indexOf(options.director)]

            let view_options = {};
            let page;
            let file;

            debug( 'getOrchestraView', templates );

            templates.forEach( s => {

                debug( 'getOrchestraView', file );

                file = path.join(_options.views, s.path );

                if ( !fs.existsSync( file ) ) {

                    return console.error( 'WARNING: missing file ' + file, 'for template ' + s.id );

                }

                page = fs.readFileSync( file ).toString();
                page = s.compile ? handlebars.compile( page )( options.params ) : page;

                if (view_options[s.param]){

                    view_options[s.param]+=page;

                }else{

                    view_options[s.param]=page;

                }

            } );

            reply.view( director + 'director', view_options )

        } )
    }
};

/**
 * Hapi plugin options
 *
 * - `options` Object with the following keys
 *   - `name` [optional] name of object that are attached to server.methods holding library function/s
 *   - `templates` {array} List with available templates. Multiple templates having the same `name` will
 *   be merged
 *     - `[].id` {string} Template identifier
 *     - `[].param` {string} Director parameter name where template should be inserted
 *     - `[].path` {string} Path to template relative view directory
 *     - `[].compile` {boolean} Indicates weather template should be compiled or not
 *   - `directors` {array} List with available directors
 *       - `[].id` {string} Director identifier
 *       - `[].path` {string} Path to director
 *   - `views` {string} Path to view folder
 */
exports.register = function ( server, options, next ) {

    _options=options

    server.method( [
        {
            name: (options.name || 'handler') + '.getOrchestraView',
            method: getOrchestraView,
            options: {}
        }] );

    next();
};

exports.register.attributes = {
    pkg: require('../package.json')
};