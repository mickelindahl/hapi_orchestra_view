/**
 *Created by Mikael Lindahl on 2018-01-10
 */

"use strict"

const Joi = require('joi');

module.exports={

    options:Joi.object({

        templates: Joi.array().items(
            Joi.object({

                id:Joi.string().required().description('Template id'),
                param:Joi.string().required().description('Director parameter where template should be inserted'),
                path: Joi.string().required().description('Path to template relative view directory'),
                compile: Joi.boolean().description('Indicates weather a template should be compiled or not')

            })
        ).required().description('Array with template configs'),
        directors: Joi.array().items(
            Joi.object({

                id:Joi.string().required().description('Director id'),
                path:Joi.string().required().description('Path to template relative view directory'),

            })
        ).required().description('Array with director configs'),
        views: Joi.string().required().description('Path to views directory'),
        actions: Joi.array().items({

            template_id:Joi.string().required().description('Template id actions should be evoked on'),
            callback:Joi.func().required().description('Function that adds to params function(parms, done)')

        }).default([])
    }),
    view: Joi.object({

        callbacks: Joi.array().items(Joi.func()).default([]),
        director: Joi.string().required().description('Director id'),
        include: Joi.array().items(Joi.string()).required().description('Template ids to use'),
        params: Joi.object().description('Object `{key:values}` made available to templates for `handlebars.compile`')

    })

};

