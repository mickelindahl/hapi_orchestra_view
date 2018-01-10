/**
 * Created by Mikael Lindahl on 2017-02-13.
 */

'use strict';

const debug = require('debug')('hapi_orchestra_view:lib:index.js')
const fs = require('fs');
const handlebars = require('handlebars');
const Joi = require('joi');
const path = require('path');
const schema = require('./schema');

let _options;

/**@module server.methods.handler */

function _evokeCallbacks(options) {

    let self=this;

    debug('_evokeCallbacks');

    let calls = options.callbacks.map(call=>{

        call.bind(self)(options.params)

    })

    return Promise.all(calls)

};

/**
 *  Create a view by composing files in the  `templates` directory
 *  through the `director.html`
 *
 * - `options` {object} with the following keys
 *   - `callbacks` {array} Array with `async function(params)`.
 *   The h toolkit instance is available as this e.g. you have
 *   request at `this.request` and server at `this.request.server`)
 *     - `[]( params)` {async function}
 *       - `params` {object} object holding params used at template compilation
 *   - `director` {string} id of director to use
 *   - `include` {string} Template ids to include
 *   - `params` Object `{key:values}` made available to templates for `handlebars.compile`
 *
 * @returns {Promise}
 */
async function viewOrchestra(options) {

    debug('getOrchestraView');

    options = Joi.attempt(options, schema.view, "Bad option passed to gerOrchestra");

    let templates = _options.templates.reduce((tot, val) => {

        if (options.include.indexOf(val.id) != -1) {

            tot.push(val)

        }

        return tot

    }, []);

    // Add actions to callback
    let actions = [];
    templates.forEach(s => {

        _options.actions.forEach(a => {

            if (a.template_id == s.id) {

                actions.push(a.callback)

            }

        });
    });

    options.callbacks =  options.callbacks.concat(actions);

    await  _evokeCallbacks.bind(this)(options);

    let ids = _options.directors.map((v) => {
        return v.id
    });
    let director = _options.directors[ids.indexOf(options.director)]

    let view_options = {};
    let page;
    let file;

    debug('getOrchestraView templates', templates.length);

    templates.forEach(s => {

        file = path.join(_options.views, s.path);

        debug('getOrchestraView file', file);

        if (!fs.existsSync(file)) {

            return console.error('WARNING: missing file ' + file, 'for template ' + s.id);

        }


        page = fs.readFileSync(file).toString();
        page = s.compile ? handlebars.compile(page)(options.params) : page;

        if (view_options[s.param]) {

            view_options[s.param] += page;

        } else {

            view_options[s.param] = page;

        }

    });

    return this.view(director.path, view_options)

}

/**
 * Hapi plugin options
 *
 * - `options` Object with the following keys
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
 *   - `actions` {object} Actions that are always evoked
 *     - `template_id` {string} Template it should add parameters to
 *     - `callback(params)` {async function}
 *       - `params` {object} Template parameter object
 */
exports.plugin = {
    register: async function (server, options) {

        options = Joi.attempt(options, schema.options, "Bad plugin option passed to hapi-orchestra");

        _options = options;

        server.decorate('toolkit', 'viewOrchestra', viewOrchestra)

    },
    pkg: require('../package.json')
};