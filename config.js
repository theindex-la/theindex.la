/**
 *
 * @module config
 * @description Configurable data to run the app
 *
 */
var path = require( "path" );



module.exports = {
    "prismic": {
        "apiAccess": "https://index-la.cdn.prismic.io/api"
    },


    "sitemap": {
        "baseUrl": "http://theindex.la",
        "slugField": "name",
        "customTypes": [
            "artist",
            "feature"
        ],
        "staticPages": [
            "about",
            "features"
        ]
    },


    "webapp": true,


    "ignore": [
        "nav",
        "sort",
        "type",
        "city",
        "meta",
        "region",
        "artist",
        "social",
        "feature",
        "category"
    ],


    "mapping": {
        "*": [
            "meta"
        ]
    },


    "server": {
        "port": "1337"
    },


    "template": {
        "root": path.join( __dirname, "template" ),
        "lang": "ejs"
    },


    "build": {
        "root": path.join( __dirname, "build" )
    },


    "static": {
        "root": path.join( __dirname, "static" ),
        "css": "/css/",
        "js": "/js/",
        "images": "/images/",
        "fonts": "/fonts/"
    },


    "source": {
        "root": path.join( __dirname, "source" )
    }
};
