import BaElement from '../../src/components/BaElement';
import { html } from 'lit-html';
import { TestUtils } from '../test-utils.js';


class BaElementImpl extends BaElement {

	constructor() {
		super();
		this.callOrderIndex = 0;

	}

	extractState(store) {
		this.extractStateCalled = this.callOrderIndex++;
		//here we extract the local state from the application store
		const { root: { applicationStateIndex } } = store;
		return { elementStateIndex: applicationStateIndex };
	}

	initialize() {
		this.initializeCalled = this.callOrderIndex++;
	}

	onBeforeRender() {
		this.onBeforeRenderCalled = this.callOrderIndex++;
	}

	onAfterRender() {
		this.onAfterRenderCalled = this.callOrderIndex++;
	}


	createView() {
		return html`<div class='ba-element-impl'> ${this.state.elementStateIndex}</div>`;
	}

	static get tag() {
		return 'ba-element-impl';
	}
}


window.customElements.define(BaElementImpl.tag, BaElementImpl);

let store;

const INDEX_CHANGED = 'CHANGE_INDEX';

//reducer with default state
const changeApplicationStoreIndexReducer = (state = { applicationStateIndex: -1 }, action) => {
	switch (action.type) {
		case INDEX_CHANGED:
			return {
				...state,
				applicationStateIndex: action.payload
			};
		default:
			return state;
	}
};
const setupStoreAndDi = () => {
	//Reducer as Object, state field is 'root'
	//see: https://redux.js.org/recipes/structuring-reducers/initializing-state#combined-reducers
	store = TestUtils.setupStoreAndDi({ root: { applicationStateIndex: 21 } }, { root: changeApplicationStoreIndexReducer });
};


describe('BaElement', () => {
	let element;

	beforeEach(async () => {

		setupStoreAndDi();
		element = await TestUtils.render(BaElementImpl.tag);
	});


	describe('when initialized', () => {
		it('renders the view', () => {

			expect(element.shadowRoot.querySelector('.ba-element-impl')).toBeTruthy();
			expect(element.shadowRoot.innerHTML.includes('21')).toBeTruthy();
		});

		it('calls hooks in correct order', () => {

			expect(element.extractStateCalled).toBe(0);
			expect(element.initializeCalled).toBe(1);
			expect(element.onBeforeRenderCalled).toBe(2);
			expect(element.onAfterRenderCalled).toBe(3);
		});
	});

	describe('when state changed', () => {
		it('calls #onStateChanged, #render and updates the view', () => {

			expect(element.shadowRoot.querySelector('.ba-element-impl')).toBeTruthy();

			store.dispatch({
				type: INDEX_CHANGED,
				payload: 42
			});

			expect(element.shadowRoot.innerHTML.includes('42')).toBeTruthy();

		});
	});
});
