import { QueryParameters } from '../../src/domain/queryParameters';
import { $injector } from '../../src/injection';
import { PublicComponent } from '../../src/modules/public/components/PublicComponent';
import { ObserveWcAttributesPlugin } from '../../src/plugins/ObserveWcAttributesPlugin';
import { initialState, wcAttributeReducer } from '../../src/store/wcAttribute/wcAttribute.reducer';
import { TestUtils } from '../test-utils';

describe('ObserveWcAttributesPlugin', () => {
	const environmentService = {
		isEmbeddedAsWC: () => true
	};

	afterEach(() => {
		document.body.innerHTML = '';
	});

	const setup = () => {
		const state = {
			wcAttributes: initialState
		};

		const store = TestUtils.setupStoreAndDi(state, {
			wcAttributes: wcAttributeReducer
		});
		$injector.registerSingleton('EnvironmentService', environmentService);
		return store;
	};

	it('registers a mutation listener on relevant attributes of the public web component and indicates their changes', async () => {
		const store = setup();

		const instanceUnderTest = new ObserveWcAttributesPlugin();
		const wc = document.createElement(PublicComponent.tag);
		document.body.appendChild(wc);
		await instanceUnderTest.register(store);
		await TestUtils.timeout();
		wc.setAttribute(QueryParameters.ZOOM, '5');
		await TestUtils.timeout();

		expect(store.getState().wcAttributes.changed.payload).toBe(QueryParameters.ZOOM);
	});

	it('does nothing when no public web component is available', async () => {
		const store = setup();

		spyOn(environmentService, 'isEmbeddedAsWC').and.returnValue(false);
		const instanceUnderTest = new ObserveWcAttributesPlugin();
		const wc = document.createElement(PublicComponent.tag);
		document.body.appendChild(wc);
		await instanceUnderTest.register(store);
		await TestUtils.timeout();
		wc.setAttribute(QueryParameters.ZOOM, '5');
		await TestUtils.timeout();

		expect(initialState.changed).toEqual(store.getState().wcAttributes.changed);
	});

	it('ignores irrelevant changes of the public web component', async () => {
		const store = setup();

		const instanceUnderTest = new ObserveWcAttributesPlugin();
		const wc = document.createElement(PublicComponent.tag);
		document.body.appendChild(wc);
		await instanceUnderTest.register(store);

		//add attribute
		await TestUtils.timeout();
		wc.setAttribute('something', '5');
		await TestUtils.timeout();

		expect(initialState.changed).toEqual(store.getState().wcAttributes.changed);

		//add child
		wc.appendChild(document.createElement('div'));
		await TestUtils.timeout();

		expect(initialState.changed).toEqual(store.getState().wcAttributes.changed);
	});
});
