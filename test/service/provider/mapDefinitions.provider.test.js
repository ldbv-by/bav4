import { $injector } from '../../../src/injection';
import { getBvvMapDefinitions } from '../../../src/services/provider/mapDefinitions.provider';

describe('MapDefinitions provider', () => {
	describe('Bvv mapDefinitions provider', () => {
		const coordinateService = {
			toLonLat: () => {}
		};

		beforeAll(() => {
			$injector.registerSingleton('CoordinateService', coordinateService);
		});

		it('provides map related meta data', () => {
			const {
				defaultExtent,
				localProjectedSridExtent,
				srid,
				defaultSridForView,
				localProjectedSridDefinitionsForView,
				localProjectedSrid,
				minZoomLevel,
				maxZoomLevel,
				globalSridDefinitionsForView
			} = getBvvMapDefinitions();

			expect(defaultExtent).toEqual([995772.9694449581, 5982715.763684852, 1548341.2904285304, 6544564.28740462]);
			expect(localProjectedSridExtent).toEqual([5, -80, 14, 80]);
			expect(srid).toBe(3857);
			expect(defaultSridForView).toBe(25832);
			expect(localProjectedSridDefinitionsForView()).toEqual([
				{ label: 'UTM', code: 25832, digits: 0 },
				{ label: 'WGS84', code: 4326, digits: 5 }
			]);
			expect(localProjectedSrid).toEqual(25832);
			expect(minZoomLevel).toBe(0);
			expect(maxZoomLevel).toBe(20);
			expect(globalSridDefinitionsForView).toEqual([
				{ label: 'UTM', code: null, digits: 0 },
				{ label: 'WGS84', code: 4326, digits: 5 }
			]);
		});

		it('localProjectedSridDefinitionsForView provides coordinate dependent definitions for a 25832 coordinate', () => {
			const fakeCoord3857In32 = [42, 42];
			spyOn(coordinateService, 'toLonLat').and.returnValue([11.18526, 48.64087]);
			const { localProjectedSridDefinitionsForView } = getBvvMapDefinitions();

			expect(localProjectedSridDefinitionsForView(fakeCoord3857In32)).toEqual([
				{ label: 'UTM', code: 25832, digits: 0 },
				{ label: 'WGS84', code: 4326, digits: 5 }
			]);
		});

		it('localProjectedSridDefinitionsForView provides coordinate dependent definitions for a 25833 coordinate', () => {
			const fakeCoord3857In33 = [42, 42];
			spyOn(coordinateService, 'toLonLat').and.returnValue([12.18526, 48.64087]);
			const { localProjectedSridDefinitionsForView } = getBvvMapDefinitions();

			expect(localProjectedSridDefinitionsForView(fakeCoord3857In33)).toEqual([
				{ label: 'UTM', code: 25833, digits: 0 },
				{ label: 'UTM', code: 25832, digits: 0 },
				{ label: 'WGS84', code: 4326, digits: 5 }
			]);
		});

		it('localProjectedSridDefinitionsForView provides coordinate dependent definitions for a coordinate with a longitude value < 6°', () => {
			const fakeCoord3857In33 = [42, 42];
			spyOn(coordinateService, 'toLonLat').and.returnValue([5.18526, 48.64087]);
			const { localProjectedSridDefinitionsForView } = getBvvMapDefinitions();

			expect(localProjectedSridDefinitionsForView(fakeCoord3857In33)).toEqual([{ label: 'WGS84', code: 4326, digits: 5 }]);
		});

		it('localProjectedSridDefinitionsForView provides coordinate dependent definitions for a coordinate with a longitude value > 18°', () => {
			const fakeCoord3857In33 = [42, 42];
			spyOn(coordinateService, 'toLonLat').and.returnValue([18.18526, 48.64087]);
			const { localProjectedSridDefinitionsForView } = getBvvMapDefinitions();

			expect(localProjectedSridDefinitionsForView(fakeCoord3857In33)).toEqual([{ label: 'WGS84', code: 4326, digits: 5 }]);
		});
	});
});
