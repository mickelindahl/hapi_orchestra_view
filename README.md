# Page view
 
Library for composing page views. A director.html file us used to compose 
the input from a set of general templates (.i.e head.html, scripts.html or 
footer.html) plus the main body of the web page. Each of the templates 
except `raw.html` are compiled using handlebars. For all compilations
the parameters defined in `options.params` is used.
 

## Installation

Copy files in `lib/views` to preferred folder in project
 
Open the `director.html` and edit it accordingly to your preference. Each 
handlebar '{{{...}}}' import corresponds to the compiled output (except for 
`raw.html`) of files in `lib/view/templates`. 

Run `npm install --save "git+https://x-oauth-basic@github.com/mickelindahl/hapi_page_view.git`
  

