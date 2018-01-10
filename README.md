[![Build Status](https://travis-ci.org/mickelindahl/hapi_orchestra_view.svg?branch=master)](https://travis-ci.org/mickelindahl/hapi_orchestra_view)
[![Coverage Status](https://coveralls.io/repos/github/mickelindahl/hapi_orchestra_view/badge.svg?branch=master)](https://coveralls.io/github/mickelindahl/hapi_orchestra_view?branch=master)

# Hapi orchestra view

Library for composing page views through a director that orchestrates
templates into a view. A director.html file is used to compose
the input from a number of templates where templates
except `raw.html` are compiled using handlebars. Parameters in
`options.params` are available to all templates.


## Installation

Copy files in `lib/views` to preferred folder in project

Open the `director.html` and edit it accordingly to your preference. Each
triple handlebar import corresponds to the compiled output (except for
`raw.html`) of files in `lib/view/templates`.

Run `npm install --save git+https://x-oauth-basic@github.com/mickelindahl/hapi_orchestra_view.git`


## Usage
```javaScript
'use strict'

const Hapi = require( 'hapi' );

const server = new Hapi.Server( { port: 3000 } );

server.register( {
   register: require( 'hapi-page-view' ),
   options:  {
      templates: [
         { id: 'my_head', param: 'head', path: 'orchestra/templates/head.html', compile:true },
         { id: 'my_body', param: 'body', path: 'main.html', compile:true },
         { id: 'my_raw', param: 'raw', path: 'orchestra/templates/raw.html', compile:false },
        ],
   directors: [{ id: 'my_director', path: 'orchestra/director.html' }],
   views: './lib/views',
   actions:[{
        template_id:'my_head',
        callbacks:[async (params)=>{params.page_title='Super site'}]
        }]

        }
    }).then(()=>{

    server.route([
        {
            method: 'GET',
            path: '/'
            handler: async (request, h)=>{
                return h.viewOrchestra({
                            director:'my_director',
                            include: ['my_head', 'my_body','my_body_2',  'my_raw', 'my_wrong'],
                            params: {title:'A title'},
                            callbacks:[async (params)=>{params.name='Humphrey Bogard'}]
                    }),
                }
            }
        ])
});
```

## Methods

The `handler` is attached to hapijs `server.methods`

<a name="server.methods.module_handler"></a>

## handler

* [handler](#server.methods.module_handler)
    * _static_
        * [.plugin](#server.methods.module_handler.plugin)
    * _inner_
        * [~viewOrchestra()](#server.methods.module_handler..viewOrchestra) ⇒ <code>Promise</code>

<a name="server.methods.module_handler.plugin"></a>

### handler.plugin
Hapi plugin options

- `options` Object with the following keys
  - `templates` {array} List with available templates. Multiple templates having the same `name` will
  be merged
    - `[].id` {string} Template identifier
    - `[].param` {string} Director parameter name where template should be inserted
    - `[].path` {string} Path to template relative view directory
    - `[].compile` {boolean} Indicates weather template should be compiled or not
  - `directors` {array} List with available directors
      - `[].id` {string} Director identifier
      - `[].path` {string} Path to director
  - `views` {string} Path to view folder
  - `actions` {object} Actions that are always evoked
    - `template_id` {string} Template it should add parameters to
    - `callback(params)` {async function}
      - `params` {object} Template parameter object

**Kind**: static property of [<code>handler</code>](#server.methods.module_handler)  
<a name="server.methods.module_handler..viewOrchestra"></a>

### handler~viewOrchestra() ⇒ <code>Promise</code>
Create a view by composing files in the  `templates` directory
 through the `director.html`

- `options` {object} with the following keys
  - `callbacks` {array} Array with `async function(params)`.
  The h toolkit instance is available as this e.g. you have
  request at `this.request` and server at `this.request.server`)
    - `[]( params)` {async function}
      - `params` {object} object holding params used at template compilation
  - `director` {string} id of director to use
  - `include` {string} Template ids to include
  - `params` Object `{key:values}` made available to templates for `handlebars.compile`

**Kind**: inner method of [<code>handler</code>](#server.methods.module_handler)  
## Test
`npm run-script test`

## Contributing
In lieu of a formal styleguide, take care to maintain the
existing coding style. Add unit tests for any new or changed
functionality. Lint and test your code.

## Release History