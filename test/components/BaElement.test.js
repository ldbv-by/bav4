import BaElement from '../../src/components/BaElement';
import { html } from 'lit-html';
import { createStore } from 'redux';
import { $injector } from '../../src/injection';
import { TestUtils } from '../test-utils.js';


class BaElementImpl extends BaElement {

	constructor() {
		super();
		this.callOrderIndex = 0;

	}

	extractState(state) {
		this.extractStateCalled = this.callOrderIndex++;
		//here we extract the local state from the application state
		const { applicationStateIndex } = state;
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

const changeApplicationStoreIndexReducer = (state = [], action) => {
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

	store = createStore(changeApplicationStoreIndexReducer, { applicationStateIndex: 21 });

	const storeService = {
		getStore: function () {
			return store;
		}
	};


	$injector
		.reset()
		.registerSingleton('StoreService', storeService);
};


describe('BaElement', () => {
	let element;

	beforeAll(() => {
		window.classUnderTest = BaElementImpl.name;
	});

	afterAll(() => {
		window.classUnderTest = undefined;
	});


	beforeEach(async () => {

		setupStoreAndDi();
		element = await TestUtils.render(BaElementImpl.tag);
	});


	describe('when initialized', () => {
		it('renders the view', () => {

			expect(element.querySelector('.ba-element-impl')).toBeTruthy();
			expect(element.innerHTML.includes('21')).toBeTruthy();
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

			expect(element.querySelector('.ba-element-impl')).toBeTruthy();

			store.dispatch({
				type: INDEX_CHANGED,
				payload: 42
			});

			expect(element.innerHTML.includes('42')).toBeTruthy();

		});
	});
});
