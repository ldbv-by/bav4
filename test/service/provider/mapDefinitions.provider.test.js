import { BvvCoordinateRepresentations, GlobalCoordinateRepresentations } from '../../../src/domain/coordinateRepresentation';
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
				localProjectedCoordinateRepresentations,
				localProjectedSrid,
				minZoomLevel,
				maxZoomLevel,
				globalCoordinateRepresentations
			} = getBvvMapDefinitions();

			expect(defaultExtent).toEqual([995772.9694449581, 5982715.763684852, 1548341.2904285304, 6544564.28740462]);
			expect(localProjectedSridExtent).toEqual([5, -80, 14, 80]);
			expect(srid).toBe(3857);
			expect(localProjectedCoordinateRepresentations()).toEqual([BvvCoordinateRepresentations.UTM32, GlobalCoordinateRepresentations.WGS84]);
			expect(localProjectedSrid).toEqual(25832);
			expect(minZoomLevel).toBe(0);
			expect(maxZoomLevel).toBe(20);
			expect(globalCoordinateRepresentations).toEqual([
				GlobalCoordinateRepresentations.UTM,
				GlobalCoordinateRepresentations.WGS84,
				GlobalCoordinateRepresentations.MGRS
			]);
		});

		describe('localProjectedCoordinateCoordinateRepresentation function', () => {
			it('provides coordinate dependent definitions for a 25832 coordinate', () => {
				const fakeCoord3857In32 = [42, 42];
				spyOn(coordinateService, 'toLonLat').and.returnValue([11.18526, 48.64087]);
				const { localProjectedCoordinateRepresentations } = getBvvMapDefinitions();

				expect(localProjectedCoordinateRepresentations(fakeCoord3857In32)).toEqual([
					BvvCoordinateRepresentations.UTM32,
					GlobalCoordinateRepresentations.WGS84
				]);
			});

			it('provides coordinate dependent definitions for a 25833 coordinate', () => {
				const fakeCoord3857In33 = [42, 42];
				spyOn(coordinateService, 'toLonLat').and.returnValue([12.18526, 48.64087]);
				const { localProjectedCoordinateRepresentations } = getBvvMapDefinitions();

				expect(localProjectedCoordinateRepresentations(fakeCoord3857In33)).toEqual([
					BvvCoordinateRepresentations.UTM33,
					BvvCoordinateRepresentations.UTM32,
					GlobalCoordinateRepresentations.WGS84
				]);
			});

			it('provides coordinate dependent definitions for a coordinate with a longitude value < 6°', () => {
				const fakeCoord3857In33 = [42, 42];
				spyOn(coordinateService, 'toLonLat').and.returnValue([5.9, 48]);
				const { localProjectedCoordinateRepresentations } = getBvvMapDefinitions();

				expect(localProjectedCoordinateRepresentations(fakeCoord3857In33)).toEqual([
					GlobalCoordinateRepresentations.UTM,
					GlobalCoordinateRepresentations.WGS84
				]);
			});

			it('provides coordinate dependent definitions for a coordinate with a longitude value > 18°', () => {
				const fakeCoord3857In33 = [42, 42];
				spyOn(coordinateService, 'toLonLat').and.returnValue([18.1, 48]);
				const { localProjectedCoordinateRepresentations } = getBvvMapDefinitions();

				expect(localProjectedCoordinateRepresentations(fakeCoord3857In33)).toEqual([
					GlobalCoordinateRepresentations.UTM,
					GlobalCoordinateRepresentations.WGS84
				]);
			});

			it('provides coordinate dependent definitions for a coordinate with a latitude value > 54°', () => {
				const fakeCoord3857In33 = [42, 42];
				spyOn(coordinateService, 'toLonLat').and.returnValue([10, 54.1]);
				const { localProjectedCoordinateRepresentations } = getBvvMapDefinitions();

				expect(localProjectedCoordinateRepresentations(fakeCoord3857In33)).toEqual([
					GlobalCoordinateRepresentations.UTM,
					GlobalCoordinateRepresentations.WGS84
				]);
			});

			it('provides coordinate dependent definitions for a coordinate with a latitude value < 42°', () => {
				const fakeCoord3857In33 = [42, 42];
				spyOn(coordinateService, 'toLonLat').and.returnValue([10, 41.9]);
				const { localProjectedCoordinateRepresentations } = getBvvMapDefinitions();

				expect(localProjectedCoordinateRepresentations(fakeCoord3857In33)).toEqual([
					GlobalCoordinateRepresentations.UTM,
					GlobalCoordinateRepresentations.WGS84
				]);
			});
		});
	});
});
