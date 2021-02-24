import { $injector } from '../../../../../../injection';

export const StateStoreConsumentMixin = (superClass) => class extends superClass {
    constructor() {
        super();
        const { StoreService } = $injector.inject('StoreService');
        this._storeService = StoreService;
        this._state = {};
    }

    /**
 * @private
 */
    _updateState() {
        const extractedState = this.extractState(this._storeService.getStore().getState());

        // maybe we should use Lo.isEqual later, but for now it does the job
        if (JSON.stringify(this._state) !== JSON.stringify(extractedState)) {
            this._state = extractedState;
            if (typeof this.onStateChanged === 'function') {
                this.onStateChanged();
            }
        }
    }

    connect() {
        const store = this._storeService.getStore();
        this.unsubscribe = store.subscribe(() => this._updateState());
        this._state = this.extractState(store.getState());
    }

    disconnect() {
        this.unsubscribe();
    }

    /**
     * Extract and returns the state of this element from the application-wide state.
     * Extraction shoud be done carefully, and should only contain the state which is needed for this element.
     * 
     * @see {@link BaElement#onStateChanged}
     * @protected
     * @returns state of the elements {Object}
     */
    extractState(/*eslint-disable no-unused-vars */state) {
        return {};
    }



};