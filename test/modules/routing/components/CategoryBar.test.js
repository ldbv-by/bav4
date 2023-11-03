import { $injector } from '../../../../src/injection';
import { MvuElement } from '../../../../src/modules/MvuElement';
import { CategoryBar } from '../../../../src/modules/routing/components/categoryBar/CategoryBar';
import { BvvRoutingService } from '../../../../src/services/RoutingService';

import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { routingReducer } from '../../../../src/store/routing/routing.reducer';
import { TestUtils } from '../../../test-utils';

window.customElements.define(CategoryBar.tag, CategoryBar);

describe('CategoryBar', () => {
	const configService = {
		getValue: () => {},
		getValueAsPath: () => {}
	};
	const routingService = new BvvRoutingService();
	let store;
	const categories = [
		{
			id: 'category_1',
			label: 'label_category_1',
			subcategories: []
		},
		{
			id: 'category_2',
			label: 'label_category_2',
			subcategories: []
		},
		{
			id: 'category_3',
			label: 'label_category_3',
			subcategories: []
		}
	];

	const setup = (state) => {
		const initialState = {
			media: {
				portrait: false
			},
			...state
		};

		store = TestUtils.setupStoreAndDi(initialState, {
			media: createNoInitialStateMediaReducer(),
			routing: routingReducer
		});
		$injector.registerSingleton('RoutingService', routingService).registerSingleton('ConfigService', configService);
		return TestUtils.render(CategoryBar.tag);
	};

	describe('class', () => {
		it('inherits from MvuElement', async () => {
			const element = await setup();

			expect(element instanceof MvuElement).toBeTrue();
		});
	});

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			await setup();
			const model = new CategoryBar().getModel();

			expect(model).toEqual({
				selectedCategory: null
			});
		});
	});

	describe('when initialized', () => {
		it('renders a category bar with buttons', async () => {
			spyOn(routingService, 'getCategories').and.returnValue(categories);
			const element = await setup({});

			const buttons = element.shadowRoot.querySelectorAll('button');

			expect(buttons).toHaveSize(3);
		});

		it('renders button defined by category id', async () => {
			spyOn(routingService, 'getCategories').and.returnValue(categories);
			const element = await setup({});

			const buttons = element.shadowRoot.querySelectorAll('button');

			expect(buttons).toHaveSize(3);
			expect(buttons[0].classList.contains('category-button')).toBeTrue();
			expect(buttons[0].classList.contains('icon-category_1')).toBeTrue();
			expect(buttons[1].classList.contains('category-button')).toBeTrue();
			expect(buttons[1].classList.contains('icon-category_2')).toBeTrue();
			expect(buttons[2].classList.contains('category-button')).toBeTrue();
			expect(buttons[2].classList.contains('icon-category_3')).toBeTrue();
		});
	});

	describe('when category button is clicked', () => {
		it('updates the store', async () => {
			spyOn(routingService, 'getCategories').and.returnValue(categories);
			const element = await setup({});

			const category1Button = element.shadowRoot.querySelector('#category_1-button');

			category1Button.click();

			expect(store.getState().routing.categoryId).toBe('category_1');
		});
	});
});
