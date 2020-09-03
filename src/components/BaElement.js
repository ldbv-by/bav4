import { render as renderLitHtml } from 'lit-html';
import { $injector } from '../injection';

/**
 * Base-Class for all Ba -Elements.
 * BaElement-Classes represent the ViewModel within the MVVM-Pattern.
 * 
 * Lifecycle:<br>
 * 
 * {@link BaElement#extractState}<br>
 *      &darr;<br>
 *  {@link BaElement#initialize}<br>
 *      &darr;<br>
 *  {@link BaElement#onBeforeRender}<br>
 *      &darr;<br>
 *  {@link BaElement#render}<br>
 *      &darr;<br>
 *  {@link BaElement#onAfterRender}<br>
 *      &darr;<br>
 *  {@link BaElement#onDisconnect}<br>
 * 
 * 
 * 
 * @abstract
 * @class
 */
class BaElement extends HTMLElement {


    constructor() {
        super();
        if (this.constructor === BaElement) {
            // Abstract class can not be constructed.
            throw new TypeError("Can not construct abstract class.");
        }
        //else (called from child)
        // Check if all instance methods are implemented.
        if (this.createView === BaElement.prototype.createView) {
            // Child has not implemented this abstract method.
            throw new TypeError("Please implement abstract method #createView.");
        }
        const { StoreService } = $injector.inject('StoreService');
        this.storeService = StoreService;

        /** 
         * The state of this Element. Usually the state object is an extract of the application-wide store.
         * Local state should be managed individually in subclasses.
         * @see {@link BaElement#extractState}
         * @see {@link BaElement#onStateChanged}
         * @member  {Object}  
         * */
        this.state = {};
    }


    log(message) {
        return console.log(`${this.constructor.name}: ` + message);
    }


    /**
     * @private
     */
    connectedCallback() {
        const store = this.storeService.getStore();
        this.unsubscribe = store.subscribe(() => this.updateState());
        this.state = this.extractState(store.getState());

        this.initialize();
        this.onBeforeRender();
        this.render();
        this.onAfterRender();
    }

    /**
     * @private
     */
    disconnectedCallback() {
        this.unsubscribe();

        this.onDisconnect();
    }



    /**
    * @private
    */
    updateState() {

        //workaround until karma allows isolated tests (https://github.com/karma-runner/karma/issues/412)
        let allowed = true;
        if (window.classUnderTest && window.classUnderTest !== this.constructor.name) {
            allowed = false;
        }
        if (allowed) {
            const extractedState = this.extractState(this.storeService.getStore().getState());

            // maybe we should use Lo.isEqual later, but for now it does the job
            if (JSON.stringify(this.state) !== JSON.stringify(extractedState)) {
                this.state = extractedState;
                this.onStateChanged();
            }
        }
    }

    /**
     * @protected
     */
    getRenderTarget() {
        return this;
    }

    /**
     * Extract and returns the state of this element from the application-wide store.
     * Extraction shoud be done carefully, and should only contain the state which is needed for this element.
     * 
     * @see {@link BaElement#onStateChanged}
     * @protected
     * @returns state of the elements {Object}
     */
    extractState(/*eslint-disable no-unused-vars */store) {
        return {};
    }


    /**
     * (Re-) renders the HTML-View.
     * @protected
     */
    render() {
        const template = this.createView();
        renderLitHtml(template, this.getRenderTarget());
        this.onAfterRender();
    }

    /**
     * Called before the view is rendered.
     * @abstract
     */
    onBeforeRender() { }

    /**
     * Creates the html template.
     * @abstract
     * @returns html template as tagged template literal
     */
    createView() { }

    /**
     * Called once after the view has beenn rendered the first time.
     * Js-Setup should be done here.
     * @abstract
     */
    initialize() { }

    /**
    * Called after the view has been rendered.
    * @abstract
    */
    onAfterRender() { }

    /**
    * Called after ethe lements state has been changed. View should be updated here. 
    * @see {@link BaElement#render}
    * @abstract
    */
    onStateChanged() { }

    /**
     * @abstract
     */
    onDisconnect() { }

    /**
     * Fires an event.
     * @param {*} name the event name
     * @param {*} payload the paylod of the event
     */
    emitEvent(name, payload) {
        this.dispatchEvent(new CustomEvent(name, { detail: payload, bubbles: true }));
    }


    /**
     * Returns the Html tag name of this CustomElement.
     * @abstract
     */
    static get tag() {
        if (this === BaElement) {
            // Abstract methods can not be called directly.
            throw new TypeError("Can not call static abstract method #tag.");
        } else if (this.tag === BaElement.tag) {
            // The child has not implemented this method.
            throw new TypeError("Please implement static abstract method #tag.");
        } else {
            // The child has implemented this method but also called `super.foo()`.
            throw new TypeError("Do not call static abstract method #tag from child.");
        }
    }



}


export default BaElement;
