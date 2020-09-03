// import { createStore, combineReducers } from 'redux';
import { createStore } from 'redux';
import events from './map/MapReducer.js';
import { ZOOM_CHANGED, POSITION_CHANGED } from './map/MapReducer';
import ReduxQuerySync from 'redux-query-sync';


// https://redux-toolkit.js.org/usage/usage-guide
// https://github.com/Treora/redux-query-sync

// const store = {};
// const store = createStore(copyingReducer,initialState,window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
// export default store;



export class StoreService {

        constructor() {
                const initialState = {
                        map: {

                                zoom: 12,
                                position: [1288239.2412306187, 6130212.561641981]

                        }
                };

                const storeEnhancer = ReduxQuerySync.enhancer({
                        params: {
                                zoom: {
                                        selector: state => state.map.zoom,
                                        action: value => ({ type: ZOOM_CHANGED, payload: value }),

                                        // Cast the parameter value to a number (we map invalid values to 1, which will then
                                        // hide the parameter).
                                        stringToValue: (string) => Number.parseFloat(string) || initialState.map.zoom,

                                        // We then also specify the inverse function (this example one is the default)
                                        valueToString: value => `${value}`,

                                        // When state.pageNumber equals 1, the parameter p is hidden (and vice versa).
                                        // defaultValue: initialState.map.zoom,
                                        defaultValue: initialState.map.zoom,
                                },
                                position: {
                                        selector: state => state.map.position,
                                        action: value => ({ type: POSITION_CHANGED, payload: value }),

                                        //TODO: handler non parseable string
                                        stringToValue: (string) => string.split(',').map(Number.parseFloat),

                                        valueToString: value => { return value.join(','); },

                                        defaultValue: initialState.map.position,
                                },
                        },
                        initialTruth: 'location',

                        // Use replaceState so the browser's back/forward button will skip over these page changes.
                        // replaceState: true,
                });

                this.store = createStore(events, initialState, storeEnhancer);

        }

        getStore() {
                return this.store;

        }
}



// const positionReducer = (state, action) => {

//         // const { type, payload } = action;

//         // if (typeof state === 'undefined') {
//         //         return 0
//         // }

//         // switch (type) {
//         //         case 'ZOOM_CHANGED':
//         //                 return { zoom: payload }

//         // }

//         return state;
// }

// const store = createStore(events, initialState, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
// const store = createStore(events, initialState);



// let getStore = () => {
//         return store;
// };


// export { getStore };