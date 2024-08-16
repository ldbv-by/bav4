/* eslint-disable no-undef */
import { TimeTravel } from '../../../../src/modules/timeTravel/components/TimeTravel.js';
import { $injector } from '../../../../src/injection/index.js';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer.js';
import { TestUtils } from '../../../test-utils.js';

window.customElements.define(TimeTravel.tag, TimeTravel);

describe('TimeTravel', () => {
	const Initial_Value = 1900;
	const Min = 1900;
	const Max = 1999;
	const Time_Travel_Data = Object.freeze([
		{
			json_featuretype: 'metamap',
			bezeichnung: 'Karte des Deutschen Reiches 1:100000',
			years: '1900,1902,1903,1908',
			zoomlevel: 8
		},

		{
			json_featuretype: 'metamap',
			bezeichnung: 'Deutsche Karte 1:50000',
			years: '1921,1923,1924,1927,1937,1939,1940,1949,1951',
			zoomlevel: 9
		}
	]);

	const setup = (state = {}, config = {}) => {
		const { embed = false } = config;
		// state of store
		const initialState = {
			media: {
				portrait: true
			},
			...state
		};
		TestUtils.setupStoreAndDi(initialState, {
			media: createNoInitialStateMediaReducer()
		});
		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed
			})
			.registerSingleton('TimeTravelService', {
				all: () => Time_Travel_Data,
				getInitialValue: () => Initial_Value,
				getMin: () => Min,
				getMax: () => Max
			})
			.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.renderAndLogLifecycle(TimeTravel.tag);
	};

	describe('constructor', () => {
		it('sets a default model', async () => {
			setup();
			const element = new TimeTravel();

			expect(element.getModel()).toEqual({
				data: null,
				activeYear: null,
				min: null,
				max: null,
				isPortrait: false
			});
		});
	});

	describe('when instantiated', () => {
		it('renders nothing when embedded', async () => {
			const element = await setup({}, { embed: true });

			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('renders a time travel component', async () => {});

		it('layouts for portrait mode', async () => {
			const state = {
				media: {
					portrait: true
				}
			};

			const element = await setup(state);
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(1);
		});

		it('layouts landscape mode', async () => {
			const state = {
				media: {
					portrait: false
				}
			};
			const element = await setup(state);
			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(1);
		});
	});

	describe('when actions buttons are clicked', () => {
		it('decrease Year', async () => {});

		it('increase Year', async () => {});

		it('start', async () => {});

		it('stop', async () => {});

		it('reset', async () => {});
	});

	describe('responsive layout ', () => {
		it('layouts for landscape', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(0);
		});

		it('layouts for portrait ', async () => {
			const state = {
				media: {
					portrait: true
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(1);
		});
	});
});
