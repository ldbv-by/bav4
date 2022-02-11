import { $injector } from '../../../../src/injection';
import { EMPTY_GEOMETRY_STATISTICS, GeometryInfo } from '../../../../src/modules/featureInfo/components/GeometryInfo';
import { MvuElement } from '../../../../src/modules/MvuElement';
import { TestUtils } from '../../../test-utils';

window.customElements.define(GeometryInfo.tag, GeometryInfo);

describe('GeometryInfo', () => {

	const coordinateServiceMock = {
		stringify() { },
		toLonLat() { }
	};

	const setup = () => {

		TestUtils.setupStoreAndDi();
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('CoordinateService', coordinateServiceMock)
			.registerSingleton('UnitsService', {
				formatDistance: (distance) => {
					return distance + ' m';
				},

				formatArea: (area) => {
					return area + ' m²';
				}
			});
		return TestUtils.render(GeometryInfo.tag);
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
			const model = new GeometryInfo().getModel();

			expect(model).toEqual({
				statistics: {
					coordinate: null,
					azimuth: null,
					length: null,
					area: null
				}
			});
		});
	});

	describe('when initialized', () => {

		it('renders nothing for default stats (empty)', async () => {
			const emptyStats = EMPTY_GEOMETRY_STATISTICS;

			const element = await setup();
			element.statistics = emptyStats;

			expect(element.shadowRoot.querySelector('.stats-container')).toBeFalsy();
		});

		it('renders point stats', async () => {
			const pointStats = { coordinate: [21, 42], azimuth: null, length: null, area: null };

			const element = await setup();
			element.statistics = pointStats;

			expect(element.shadowRoot.querySelector('.stats-container')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.stats-point')).toBeTruthy();
		});

		it('renders the items with line stats', async () => {
			const element = await setup();
			element.statistics = { coordinate: null, azimuth: null, length: 42, area: null };

			expect(element.shadowRoot.querySelector('.stats-container')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.stats-line-azimuth')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.stats-line-length')).toBeTruthy();

			element.statistics = { coordinate: null, azimuth: 42, length: 42, area: null };

			expect(element.shadowRoot.querySelector('.stats-container')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.stats-line-azimuth')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.stats-line-length')).toBeTruthy();
		});


		it('renders the items with polygon stats', async () => {

			const element = await setup();
			element.statistics = { coordinate: null, azimuth: null, length: 42, area: 42 };

			expect(element.shadowRoot.querySelector('.stats-container')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.stats-polygon-length')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.stats-polygon-area')).toBeTruthy();
		});


		it('renders the items with smallest polygon stats', async () => {

			const element = await setup();
			element.statistics = { coordinate: null, azimuth: null, length: 0.001, area: 0 };

			expect(element.shadowRoot.querySelector('.stats-container')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.stats-polygon-length')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.stats-polygon-area')).toBeTruthy();
		});
	});
});
