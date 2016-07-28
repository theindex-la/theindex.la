import Vue from "vue";
import nav from "./menus/nav";
import * as core from "./core";
import Animator from "./Animator";
import refine from "./index/refine";
import templates from "./index/templates";
import PageController from "properjs-pagecontroller";


/**
 *
 * @public
 * @namespace router
 * @description Handles async web app routing for nice transitions.
 *
 */
const router = {
    /**
     *
     * @public
     * @member view
     * @memberof router
     * @description The current vue.js instance.
     *
     */
    view: null,


    /**
     *
     * @public
     * @member template
     * @memberof router
     * @description The current template ID.
     *
     */
    template: null,


    /**
     *
     * @public
     * @member imageController
     * @memberof router
     * @description The current ImageController instance.
     *
     */
    imageController: null,


    /**
     *
     * @public
     * @member pageDuration
     * @memberof router
     * @description The transition duration for view changes.
     *
     */
    pageDuration: core.util.getTransitionDuration( core.dom.page[ 0 ] ),


    /**
     *
     * @public
     * @method init
     * @memberof router
     * @description Initialize the router module.
     *
     */
    init () {
        this.bindEmptyHashLinks();
        this.initPageController();

        core.emitter.on( "app--view-teardown", this.viewTeardown.bind( this ) );

        core.log( "router initialized" );
    },


    /**
     *
     * @public
     * @method initPageController
     * @memberof router
     * @description Create the PageController instance.
     *
     */
    initPageController () {
        this.controller = new PageController({
            transitionTime: this.pageDuration,
            routerOptions: {
                async: false
            }
        });

        this.controller.setConfig([
            "/",
            ":view",
            ":view/:id"
        ]);

        this.controller.on( "page-controller-router-samepage", () => nav.close() );
        this.controller.on( "page-controller-router-transition-out", this.changePageOut.bind( this ) );
        this.controller.on( "page-controller-router-refresh-document", this.changeContent.bind( this ) );
        this.controller.on( "page-controller-router-transition-in", this.changePageIn.bind( this ) );
        this.controller.on( "page-controller-initialized-page", this.viewChange.bind( this ) );

        this.controller.initPage();
    },


    /**
     *
     * @public
     * @method viewChange
     * @param {object} data The PageController data object
     * @memberof router
     * @description Handle view changes.
     *
     */
    viewChange ( data ) {
        const view = (data.request.params.view || "index");
        const args = (data.request.params.id || null);

        core.emitter.fire( `app--view-${view}`, args );
    },


    /**
     *
     * @public
     * @method viewTeardown
     * @memberof router
     * @description Handle destroying current view.
     *
     */
    viewTeardown () {
        core.dom.html.removeClass( `is-${this.template}-page` );

        // @this.view
        if ( this.view ) {
            this.view.$destroy();
            this.view = null;
        }

        // @this.imageController
        if ( this.imageController ) {
            this.imageController.destroy();
            this.imageController = null;
        }

        // @this.animController
        if ( this.animController ) {
            this.animController.destroy();
            this.animController = null;
        }

        // @this.template
        this.template = null;
    },


    /**
     *
     * @public
     * @method setView
     * @param {string} tpl The template access ID
     * @param {object} data The PageController data object
     * @param {function} cb The callback for view ready
     * @memberof router
     * @description Handle creating the new current view.
     *
     */
    setView ( tpl, data ) {
        // @this.template
        this.template = tpl;

        // @this.view
        this.view = new Vue({
            el: core.dom.page[ 0 ],
            data: data,
            compiled: () => {
                // @this.imageController
                this.imageController = core.images.handleImages();

                // @this.animController
                this.animController = new Animator( core.dom.page.find( ".js-animate" ) );
            },
            ready: () => {
                core.dom.html.removeClass( "is-inactive" );

                core.emitter.fire( "app--intro-teardown" );
            },
            replace: false,
            template: templates.get( tpl )
        });

        core.dom.html.addClass( `is-${this.template}-page` );
    },


    /**
     *
     * @public
     * @method route
     * @param {string} path The uri to route to
     * @memberof router
     * @description Trigger app to route a specific page. [Reference]{@link https://github.com/ProperJS/Router/blob/master/Router.js#L222}
     *
     */
    route ( path ) {
        this.controller.getRouter().trigger( path );
    },


    /**
     *
     * @public
     * @method push
     * @param {string} path The uri to route to
     * @param {function} cb Optional callback to fire
     * @memberof router
     * @description Trigger a silent route with a supplied callback.
     *
     */
    push ( path, cb ) {
        this.controller.routeSilently( path, (cb || core.util.noop) );
    },


    /**
     *
     * @public
     * @method bindEmptyHashLinks
     * @memberof router
     * @description Suppress #hash links.
     *
     */
    bindEmptyHashLinks () {
        core.dom.body.on( "click", "[href^='#']", ( e ) => e.preventDefault() );
    },


    /**
     *
     * @public
     * @method changePageOut
     * @memberof router
     * @description Trigger transition-out animation.
     *
     */
    changePageOut () {
        core.dom.html.addClass( "is-inactive" );

        setTimeout( () => {
            nav.close();
            refine.close();

            core.dom.page[ 0 ].scrollTop = 0;

            core.emitter.fire( "app--view-teardown" );

        }, this.pageDuration );
    },


    /**
     *
     * @public
     * @method changeContent
     * @param {object} data The PageController data object
     * @memberof router
     * @description Swap the new content into the DOM.
     *
     */
    changeContent ( data ) {
        this.viewChange( data );
    },


    /**
     *
     * @public
     * @method changePageIn
     * @param {object} data The data object supplied by PageController from PushState
     * @memberof router
     * @description Trigger transition-in animation.
     *
     */
    changePageIn ( /* data */ ) {
        nav.toggleActive();

        core.emitter.fire( "app--analytics-pageview" );
    }
};



/******************************************************************************
 * Export
*******************************************************************************/
export default router;
