/**
 * Created by Mikael Lindahl on 2017-02-13.
 */

'use strict';

let _views;

function getPage( name, options ) {

    options = options || {};
    options.views = options.views || _views;

    /**
     * - `request` hapijs server request object
     *
     * @returns {Promise}
     */
    let evokeCallbacks = ( request ) => {

        let promise = Promise.resolve();

        if ( !(options && options.callbacks) ) {

            return promise

        }

        options.callbacks.forEach( call => {

            promise = promise.then( () => {

                return new Promise( resolve => {
                    call( request, options, resolve )
                } );

            } )

        } );

        return promise

    };

    return ( request, reply ) => {

        evokeCallbacks( request ).then( () => {

            options.views.push( name );
            let view_options = {};
            let page;

            views.forEach( ( s ) => {

                if ( options.exclude && options.exclude.indexOf( s ) != -1 ) {
                    return
                }

                //debug( s, page, options )

                let file = path.join( path.resolve(), 'views', s + '.html' );
                page = fs.readFileSync( file ).toString();

                if ( s == name ) {
                    s = 'body';
                }

                view_options[s] = handlebars.compile( page )( options );

            } );

            // Add uncompiled template file
            let file_templates = path.join( path.resolve(), 'views', 'templates.html' );
            view_options.templates = fs.readFileSync( file_templates ).toString();

            //debug( options.qas );
            //debug( options.standing );

            reply.view( 'director', view_options )

        } )
    }
};

exports.register = function ( server, options, next ) {

    _views = options.views || ['head', 'nav', 'icons', 'footer', 'scripts'];

    server.method( [
        {
            name: 'handler.getPage',
            method: getPage,
            options: {}
        }] );

    next();
};

exports.register.attributes = {
    name: 'page',
    version: '1.0.0'
};
