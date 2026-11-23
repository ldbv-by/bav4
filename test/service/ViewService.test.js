import { AggregateGeoResource, GeoResourceTypes, VectorGeoResource, WmsGeoResource, XyzGeoResource } from '@src/domain/geoResources';
import { Tools } from '@src/domain/tools';
import { ViewMode } from '@src/domain/view';
import { $injector } from '@src/injection';
import { ViewService } from '@src/services/ViewService';

describe('ViewService', () => {
	const geoResources = new Map();
	const geoResourceService = {
		byId: (id) => geoResources.get(id) ?? null
	};

	const setup = (viewMode = ViewMode.D2) => {
		$injector
			.reset()
			.registerSingleton('GeoResourceService', geoResourceService)
			.registerSingleton('StoreService', {
				getStore: () => ({
					getState: () => ({
						view: {
							mode: viewMode
						}
					})
				})
			});
		return new ViewService();
	};

	beforeEach(() => {
		geoResources.clear();
	});

	describe('isGeoResourceAvailable', () => {
		it('returns true for XYZ, WMS and vector geo resources', () => {
			geoResources.set('xyz', new XyzGeoResource('xyz', 'XYZ', 'https://example.com/{z}/{x}/{y}'));
			geoResources.set('wms', new WmsGeoResource('wms', 'WMS', 'https://example.com/wms', 'layer', 'image/png'));
			geoResources.set('vector', new VectorGeoResource('vector', 'Vector'));
			const instanceUnderTest = setup();

			expect(instanceUnderTest.isGeoResourceAvailable('xyz')).toBe(true);
			expect(instanceUnderTest.isGeoResourceAvailable('wms')).toBe(true);
			expect(instanceUnderTest.isGeoResourceAvailable('vector')).toBe(true);
		});

		it('returns false for unsupported or missing geo resources', () => {
			geoResources.set('unsupported', {
				getType: () => GeoResourceTypes.FUTURE
			});
			const instanceUnderTest = setup();

			expect(instanceUnderTest.isGeoResourceAvailable('unsupported')).toBe(false);
			expect(instanceUnderTest.isGeoResourceAvailable('missing')).toBe(false);
		});

		it('returns true only when all aggregate children are available', () => {
			geoResources.set('xyz', new XyzGeoResource('xyz', 'XYZ', 'https://example.com/{z}/{x}/{y}'));
			geoResources.set('wms', new WmsGeoResource('wms', 'WMS', 'https://example.com/wms', 'layer', 'image/png'));
			geoResources.set('supportedAggregate', new AggregateGeoResource('supportedAggregate', 'Aggregate', ['xyz', 'wms']));
			geoResources.set('unsupportedAggregate', new AggregateGeoResource('unsupportedAggregate', 'Aggregate', ['xyz', 'missing']));
			const instanceUnderTest = setup();

			expect(instanceUnderTest.isGeoResourceAvailable('supportedAggregate')).toBe(true);
			expect(instanceUnderTest.isGeoResourceAvailable('unsupportedAggregate')).toBe(false);
		});
	});

	describe('isToolAvailable', () => {
		it('allows every configured 2D tool', () => {
			const instanceUnderTest = setup(ViewMode.D2);

			Object.values(Tools).forEach((toolId) => {
				expect(instanceUnderTest.isToolAvailable(toolId)).toBe(true);
			});
		});

		it('allows only share, import and export in 3D', () => {
			const instanceUnderTest = setup(ViewMode.D3);

			expect(instanceUnderTest.isToolAvailable(Tools.SHARE)).toBe(true);
			expect(instanceUnderTest.isToolAvailable(Tools.IMPORT)).toBe(true);
			expect(instanceUnderTest.isToolAvailable(Tools.EXPORT)).toBe(true);
			expect(instanceUnderTest.isToolAvailable(Tools.MEASURE)).toBe(false);
			expect(instanceUnderTest.isToolAvailable(Tools.DRAW)).toBe(false);
			expect(instanceUnderTest.isToolAvailable(Tools.ROUTING)).toBe(false);
			expect(instanceUnderTest.isToolAvailable(Tools.COMPARE)).toBe(false);
		});

		it('defaults to 2D for an unknown view mode', () => {
			const instanceUnderTest = setup('unknown');

			expect(instanceUnderTest.isToolAvailable(Tools.DRAW)).toBe(true);
		});

		it('returns false for an unknown tool', () => {
			const instanceUnderTest = setup();

			expect(instanceUnderTest.isToolAvailable('unknown')).toBe(false);
		});
	});

	describe('_getCurrentViewMode', () => {
		it('returns D3 only for the D3 state', () => {
			expect(setup(ViewMode.D3)._getCurrentViewMode()).toBe(ViewMode.D3);
		});

		it('returns D2 for D2 and unknown states', () => {
			expect(setup(ViewMode.D2)._getCurrentViewMode()).toBe(ViewMode.D2);
			expect(setup('unknown')._getCurrentViewMode()).toBe(ViewMode.D2);
		});
	});
});
