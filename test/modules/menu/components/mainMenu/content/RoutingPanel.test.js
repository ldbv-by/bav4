import { TabIds } from '../../../../../../src/domain/mainMenu';
import { RoutingStatusCodes } from '../../../../../../src/domain/routing';
import { $injector } from '../../../../../../src/injection';
import { AbstractMvuContentPanel } from '../../../../../../src/modules/menu/components/mainMenu/content/AbstractMvuContentPanel';
import { RoutingPanel } from '../../../../../../src/modules/menu/components/mainMenu/content/routing/RoutingPanel';
import { createNoInitialStateMainMenuReducer } from '../../../../../../src/store/mainMenu/mainMenu.reducer';
import { createNoInitialStateMediaReducer } from '../../../../../../src/store/media/media.reducer';
import { routingReducer } from '../../../../../../src/store/routing/routing.reducer';
import { isTemplateResult } from '../../../../../../src/utils/checks';
import { TestUtils } from '../../../../../test-utils';

window.customElements.define(RoutingPanel.tag, RoutingPanel);

describe('RoutingPanel', () => {
	let store;
	const setup = (state) => {
		const initialState = {
			mainMenu: {
				open: true,
				tab: null
			},
			media: {
				portrait: false
			},
			...state
		};

		store = TestUtils.setupStoreAndDi(initialState, {
			mainMenu: createNoInitialStateMainMenuReducer(),
			media: createNoInitialStateMediaReducer(),
			routing: routingReducer
		});
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(RoutingPanel.tag);
	};

	describe('class', () => {
		it('inherits from AbstractMvuContentPanel', async () => {
			const element = await setup();

			expect(element instanceof AbstractMvuContentPanel).toBeTrue();
		});
	});

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			await setup();
			const model = new RoutingPanel().getModel();

			expect(model).toEqual({});
		});
	});

	describe('when initialized', () => {
		it('renders the routing components', async () => {
			const element = await setup();

			const container = element.shadowRoot.querySelectorAll('.container');

			expect(container).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-routing-waypoints')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-routing-category-bar')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-routing-info')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-routing-details')).toHaveSize(1);

			expect(element.shadowRoot.querySelectorAll('ba-profile-chip')).toHaveSize(1);

			expect(element.shadowRoot.querySelectorAll('.demo')).toHaveSize(1);
		});
	});

	describe('when close icon is clicked', () => {
		it('updates the store', async () => {
			const element = await setup();

			const closeIcon = element.shadowRoot.querySelector('ba-icon');

			closeIcon.click();

			expect(store.getState().mainMenu.tab).toBe(TabIds.MAPS);
		});
	});

	describe('when demo content needed', () => {
		it('renders demo content', async () => {
			const element = await setup();
			expect(isTemplateResult(element._getDemoContent())).toBeTrue();
		});
	});

	describe('when demo buttons pressed', () => {
		it('loads demo content', async () => {
			const element = await setup();

			const button1 = element.shadowRoot.querySelector('#button1');
			const button2 = element.shadowRoot.querySelector('#button2');

			button1.click();

			expect(store.getState().routing.status).toBe(RoutingStatusCodes.Start_Destination_Missing);
			expect(store.getState().routing.waypoints).toEqual([]);

			button2.click();

			expect(store.getState().routing.status).toBe(RoutingStatusCodes.Ok);
			expect(store.getState().routing.waypoints).toHaveSize(3);
		});
	});
});
