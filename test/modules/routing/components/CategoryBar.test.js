import { $injector } from '../../../../src/injection';
import { MvuElement } from '../../../../src/modules/MvuElement';
import { CategoryBar } from '../../../../src/modules/routing/components/categoryBar/CategoryBar';

import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';
import { routingReducer } from '../../../../src/store/routing/routing.reducer';
import { TestUtils } from '../../../test-utils';

window.customElements.define(CategoryBar.tag, CategoryBar);

describe('CategoryBar', () => {
	const configService = {
		getValue: () => {},
		getValueAsPath: () => {}
	};

	const categories = [
		{
			id: 'category_1',
			label: 'label_category_1',
			style: { color: 'red', icon: 'icon_category_1' },
			subcategories: [
				{
					id: 'category_11',
					label: 'label_category_11',
					style: { color: 'red', icon: 'icon_category_11' },
					subcategories: []
				},
				{
					id: 'category_12',
					label: 'label_category_12',
					style: {},
					subcategories: []
				}
			]
		},
		{
			id: 'category_2',
			label: 'label_category_2',
			style: { color: 'blue', icon: 'icon_category_2' },
			subcategories: [
				{
					id: 'category_21',
					label: 'label_category_21',
					style: { color: 'blue', icon: 'icon_category_21' },
					subcategories: []
				}
			]
		},
		{
			id: 'category_3',
			label: 'label_category_3',
			style: { color: 'green' },
			subcategories: []
		}
	];
	const routingServiceMock = {
		getCategoryById: () => {},
		getCategories: () => categories,
		getParent: (id) => (id !== 'category_3' && id !== null && id.length > 10 ? id.slice(0, -1) : id)
	};
	let store;

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
		$injector.registerSingleton('RoutingService', routingServiceMock).registerSingleton('ConfigService', configService);
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
			const element = await setup({});

			const buttons = element.shadowRoot.querySelectorAll('button');

			expect(buttons).toHaveSize(3);
		});

		it('renders icon defined by category id', async () => {
			const element = await setup({});

			const icon = element.shadowRoot.querySelectorAll('.category-icon');

			expect(icon).toHaveSize(2);
			expect(icon[0].innerHTML.includes('icon_category_1')).toBeTrue();

			expect(icon[1].innerHTML.includes('icon_category_2')).toBeTrue();
		});

		it('renders an active subcategory', async () => {
			const element = await setup({ routing: { categoryId: 'category_12' } });

			const icon = element.shadowRoot.querySelectorAll('.category-icon');

			expect(icon).toHaveSize(2);
			expect(icon[0].innerHTML.includes('icon_category_1')).toBeTrue();
			expect(icon[0].classList.contains('is-active')).toBeTrue();

			expect(icon[1].innerHTML.includes('icon_category_2')).toBeTrue();
		});

		it('renders an active category', async () => {
			const element = await setup({ routing: { categoryId: 'category_2' } });

			const icon = element.shadowRoot.querySelectorAll('.category-icon');

			expect(icon).toHaveSize(2);
			expect(icon[0].innerHTML.includes('icon_category_1')).toBeTrue();

			expect(icon[1].innerHTML.includes('icon_category_2')).toBeTrue();
			expect(icon[1].classList.contains('is-active')).toBeTrue();
		});
	});

	describe('when category button is clicked', () => {
		it('updates the store', async () => {
			const element = await setup({});

			const category1Button = element.shadowRoot.querySelector('#category_1-button');

			category1Button.click();

			expect(store.getState().routing.categoryId).toBe('category_1');
		});
	});
});
