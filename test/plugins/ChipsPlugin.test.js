import { ChipsPlugin } from '../../src/plugins/ChipsPlugin';
import { TestUtils } from '../test-utils.js';
import { $injector } from '../../src/injection';
// import { QueryParameters } from '../../src/domain/queryParameters';
import { chipsReducer } from '../../src/store/chips/chips.reducer';
import { layersReducer } from '../../src/store/layers/layers.reducer.js';
import { setCurrent } from '../../src/store/chips/chips.action';



describe('ChipsPlugin', () => {

	const chipsConfigurationService = {
		all() { }
	};

	const windowMock = {
		location: {
			get search() {
				return null;
			}
		}
	};

	const setup = (state) => {

		const store = TestUtils.setupStoreAndDi(state, {
			chips: chipsReducer,
			layers: layersReducer
		});
		$injector
			.registerSingleton('ChipsConfigurationService', chipsConfigurationService)
			.registerSingleton('EnvironmentService', { getWindow: () => windowMock });

		return store;
	};

	describe('when not yet initialized and toolId changes', () => {

		const getAllMockChips = () => {
			return {
				'id': 'ID1',
				'title': 'Permanent',
				'href': 'https://www.one.com',
				'permanent': true,
				'target': 'modal',
				'observer': null,
				'style': {
					'colorLight': 'var(--primary-color)',
					'backgroundColorLight': 'var(--primary-bg-color)',
					'colorDark': 'var(--primary-color)',
					'backgroundColorDark': 'var(--primary-bg-color)',
					'icon': null
				}
			},
			{
				'id': 'ID2',
				'title': 'Parameter',
				'href': 'https://www.tow.com',
				'permanent': true,
				'target': 'extern',
				'observer': null,
				'style': {
					'colorLight': 'var(--primary-color)',
					'backgroundColorLight': 'var(--primary-bg-color)',
					'colorDark': 'var(--primary-color)',
					'backgroundColorDark': 'var(--primary-bg-color)',
					'icon': null
				}
			},
			{
				'id': 'ID3',
				'title': 'Theme Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy',
				'href': 'https://www.three.com',
				'permanent': false,
				'target': 'extern',
				'observer': {
					'geoResources': [
					],
					'topics': [
						'test'
					]
				},
				'style': {
					'colorLight': 'var(--primary-color)',
					'backgroundColorLight': 'var(--primary-bg-color)',
					'colorDark': 'var(--primary-color)',
					'icon': null
				}
			},
			{
				'id': 'ID4',
				'title': 'GeoResource',
				'href': 'https://www.four.com',
				'permanent': false,
				'target': 'extern',
				'observer': {
					'geoResources': [
						'6f5a389c-4ef3-4b5a-9916-475fd5c5962b',
						'd0e7d4ea-62d8-46a0-a54a-09654530beed'
					],
					'topics': [
					]
				},
				'style': {
					'colorLight': 'black',
					'backgroundColorLight': 'red',
					'colorDark': 'white',
					'backgroundColorDark': 'maroon',
					'icon': '<path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>'
				}
			};
		};

		it('initializes with chips', async () => {
			const store = setup();
			const instanceUnderTest = new ChipsPlugin();
			await instanceUnderTest.register(store);
			spyOn(chipsConfigurationService, 'all').and.resolveTo(getAllMockChips());

			setCurrent();


		});
	});
});
