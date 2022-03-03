import { $injector } from '../../../../../../src/injection';
import { AggregateGeoResource, GeoResourceFuture, VectorGeoResource, VectorSourceType, WmsGeoResource, WMTSGeoResource } from '../../../../../../src/services/domain/geoResources';
import { LayerService } from '../../../../../../src/modules/map/components/olMap/services/LayerService';
import { TestUtils } from '../../../../../test-utils';
import { networkReducer } from '../../../../../../src/store/network/network.reducer';
import { Map } from 'ol';
import VectorLayer from 'ol/layer/Vector';


describe('LayerService', () => {

	const vectorLayerService = {
		createVectorLayer: () => { }
	};
	const georesourceService = {
		byId: () => { }
	};

	let instanceUnderTest;
	let store;


	beforeEach(() => {
		store = TestUtils.setupStoreAndDi({}, {
			network: networkReducer
		});
		$injector
			.registerSingleton('VectorLayerService', vectorLayerService)
			.registerSingleton('GeoResourceService', georesourceService);

		instanceUnderTest = new LayerService();
	});

	describe('toOlLayer', () => {

		describe('GeoResourceFuture', () => {

			it('converts a GeoResourceFuture to a placeholder olLayer', () => {
				const id = 'id';
				const wmsGeoresource = new GeoResourceFuture(id, () => { });

				const placeholderOlLayer = instanceUnderTest.toOlLayer(wmsGeoresource);

				expect(placeholderOlLayer.get('id')).toBe(id);
				expect(placeholderOlLayer.get('placeholder')).toBeTrue();
				expect(placeholderOlLayer.getSource()).toBeNull();
				expect(placeholderOlLayer.render()).toBeUndefined();
				expect(placeholderOlLayer.constructor.name).toBe('Layer');
			});
		});

		describe('VectorGeoresource', () => {

			it('converts a VectorGeoresource to an olLayer', () => {
				const olMap = new Map();
				const olLayer = new VectorLayer();
				const vectorGeoresource = new VectorGeoResource('someId', 'Label', VectorSourceType.KML);
				const vectorSourceForUrlSpy = spyOn(vectorLayerService, 'createVectorLayer').and.returnValue(olLayer);

				instanceUnderTest.toOlLayer(vectorGeoresource, olMap);

				expect(vectorSourceForUrlSpy).toHaveBeenCalledWith(vectorGeoresource, olMap);
			});
		});

		describe('WmsGeoresource', () => {

			it('converts a WmsGeoresource to a olLayer', () => {
				const wmsGeoresource = new WmsGeoResource('someId', 'Label', 'https://some.url', 'layer', 'image/png');

				const wmsOlLayer = instanceUnderTest.toOlLayer(wmsGeoresource);

				expect(wmsOlLayer.get('id')).toBe('someId');
				expect(wmsOlLayer.getMinZoom()).toBeNegativeInfinity();
				expect(wmsOlLayer.getMaxZoom()).toBePositiveInfinity();
				const wmsSource = wmsOlLayer.getSource();
				expect(wmsOlLayer.constructor.name).toBe('ImageLayer');
				expect(wmsSource.constructor.name).toBe('ImageWMS');
				expect(wmsSource.getUrl()).toBe('https://some.url');
				expect(wmsSource.getParams().LAYERS).toBe('layer');
				expect(wmsSource.getParams().FORMAT).toBe('image/png');
				expect(wmsSource.getParams().VERSION).toBe('1.1.1');
			});

			it('converts a WmsGeoresource containing optional properties to a olLayer', () => {
				const wmsGeoresource = new WmsGeoResource('someId', 'Label', 'https://some.url', 'layer', 'image/png')
					.setOpacity(.5)
					.setMinZoom(5)
					.setMaxZoom(19);

				const wmsOlLayer = instanceUnderTest.toOlLayer(wmsGeoresource);

				expect(wmsOlLayer.get('id')).toBe('someId');
				expect(wmsOlLayer.getOpacity()).toBe(.5);
				expect(wmsOlLayer.getMinZoom()).toBe(5);
				expect(wmsOlLayer.getMaxZoom()).toBe(19);
				const wmsSource = wmsOlLayer.getSource();
				expect(wmsOlLayer.constructor.name).toBe('ImageLayer');
				expect(wmsSource.constructor.name).toBe('ImageWMS');
				expect(wmsSource.getUrl()).toBe('https://some.url');
				expect(wmsSource.getParams().LAYERS).toBe('layer');
				expect(wmsSource.getParams().FORMAT).toBe('image/png');
				expect(wmsSource.getParams().VERSION).toBe('1.1.1');
			});

			it('registers load listerners', () => {
				const wmsGeoresource = new WmsGeoResource('someId', 'Label', 'https://some.url', 'layer', 'image/png');

				const wmsSource = instanceUnderTest.toOlLayer(wmsGeoresource).getSource();

				wmsSource.dispatchEvent('imageloadstart');
				expect(store.getState().network.fetching).toBeTrue();
				wmsSource.dispatchEvent('imageloadend');
				expect(store.getState().network.fetching).toBeFalse();
				wmsSource.dispatchEvent('imageloadstart');
				wmsSource.dispatchEvent('imageloaderror');
				expect(store.getState().network.fetching).toBeFalse();
			});
		});

		describe('WmtsGeoresource', () => {

			it('converts a WmtsGeoresource to a olLayer', () => {
				const wmtsGeoresource = new WMTSGeoResource('someId', 'Label', 'https://some{1-2}/layer/{z}/{x}/{y}');

				const wmtsOlLayer = instanceUnderTest.toOlLayer(wmtsGeoresource);

				expect(wmtsOlLayer.get('id')).toBe('someId');
				expect(wmtsOlLayer.getPreload()).toBe(3);
				expect(wmtsOlLayer.getMinZoom()).toBeNegativeInfinity();
				expect(wmtsOlLayer.getMaxZoom()).toBePositiveInfinity();
				const wmtsSource = wmtsOlLayer.getSource();
				expect(wmtsOlLayer.constructor.name).toBe('TileLayer');
				expect(wmtsSource.constructor.name).toBe('XYZ');
				expect(wmtsSource.getUrls()).toEqual(['https://some1/layer/{z}/{x}/{y}', 'https://some2/layer/{z}/{x}/{y}']);
			});

			it('converts a WmtsGeoresource containing optional properties to a olLayer', () => {
				const wmtsGeoresource = new WMTSGeoResource('someId', 'Label', 'https://some{1-2}/layer/{z}/{x}/{y}')
					.setOpacity(.5)
					.setMinZoom(5)
					.setMaxZoom(19);

				const wmtsOlLayer = instanceUnderTest.toOlLayer(wmtsGeoresource);

				expect(wmtsOlLayer.get('id')).toBe('someId');
				expect(wmtsOlLayer.getPreload()).toBe(3);
				expect(wmtsOlLayer.getOpacity()).toBe(.5);
				expect(wmtsOlLayer.getMinZoom()).toBe(5);
				expect(wmtsOlLayer.getMaxZoom()).toBe(19);
				const wmtsSource = wmtsOlLayer.getSource();
				expect(wmtsOlLayer.constructor.name).toBe('TileLayer');
				expect(wmtsSource.constructor.name).toBe('XYZ');
				expect(wmtsSource.getUrls()).toEqual(['https://some1/layer/{z}/{x}/{y}', 'https://some2/layer/{z}/{x}/{y}']);
			});

			it('registers load listerners', () => {
				const wmtsGeoresource = new WMTSGeoResource('someId', 'Label', 'https://some{1-2}/layer/{z}/{x}/{y}');

				const wmtsSource = instanceUnderTest.toOlLayer(wmtsGeoresource).getSource();

				wmtsSource.dispatchEvent('tileloadstart');
				expect(store.getState().network.fetching).toBeTrue();
				wmtsSource.dispatchEvent('tileloadend');
				expect(store.getState().network.fetching).toBeFalse();
				wmtsSource.dispatchEvent('tileloadstart');
				wmtsSource.dispatchEvent('tileloaderror');
				expect(store.getState().network.fetching).toBeFalse();
			});
		});


		it('converts a AggregateGeoresource to a olLayer(Group)', () => {

			const wmtsGeoresource = new WMTSGeoResource('wmtsId', 'Label', 'https://some{1-2}/layer/{z}/{x}/{y}');
			const wmsGeoresource = new WmsGeoResource('wmsId', 'Label', 'https://some.url', 'layer', 'image/png');
			spyOn(georesourceService, 'byId').and.callFake((id) => {
				switch (id) {
					case wmtsGeoresource.id:
						return wmtsGeoresource;
					case wmsGeoresource.id:
						return wmsGeoresource;
				}
			});
			const aggreggateGeoResource = new AggregateGeoResource('someId', 'label', [wmtsGeoresource.id, wmtsGeoresource.id]);

			const olLayerGroup = instanceUnderTest.toOlLayer(aggreggateGeoResource);

			expect(olLayerGroup.get('id')).toBe('someId');
			expect(olLayerGroup.getMinZoom()).toBeNegativeInfinity();
			expect(olLayerGroup.getMaxZoom()).toBePositiveInfinity();
			expect(olLayerGroup.constructor.name).toBe('LayerGroup');
			const layers = olLayerGroup.getLayers();
			expect(layers.item(0).get('id')).toBe(wmtsGeoresource.id);
			expect(layers.item(1).get('id')).toBe(wmtsGeoresource.id);
		});

		it('converts a AggregateGeoresource containing optional properties to a olLayer(Group)', () => {

			const wmtsGeoresource = new WMTSGeoResource('wmtsId', 'Label', 'https://some{1-2}/layer/{z}/{x}/{y}');
			const wmsGeoresource = new WmsGeoResource('wmsId', 'Label', 'https://some.url', 'layer', 'image/png');
			spyOn(georesourceService, 'byId').and.callFake((id) => {
				switch (id) {
					case wmtsGeoresource.id:
						return wmtsGeoresource;
					case wmsGeoresource.id:
						return wmsGeoresource;
				}
			});
			const aggreggateGeoResource = new AggregateGeoResource('someId', 'label', [wmtsGeoresource.id, wmtsGeoresource.id])
				.setOpacity(.5)
				.setMinZoom(5)
				.setMaxZoom(19);

			const olLayerGroup = instanceUnderTest.toOlLayer(aggreggateGeoResource);

			expect(olLayerGroup.get('id')).toBe('someId');
			expect(olLayerGroup.getOpacity()).toBe(.5);
			expect(olLayerGroup.getMinZoom()).toBe(5);
			expect(olLayerGroup.getMaxZoom()).toBe(19);
			expect(olLayerGroup.constructor.name).toBe('LayerGroup');
			const layers = olLayerGroup.getLayers();
			expect(layers.item(0).get('id')).toBe(wmtsGeoresource.id);
			expect(layers.item(1).get('id')).toBe(wmtsGeoresource.id);
		});


		it('throws an error when georesource type is not supported', () => {

			expect(() => {
				instanceUnderTest.toOlLayer({
					getType() {
						return 'Unknown';
					}
				});
			})
				.toThrowError(/Unknown currently not supported/);
		});

	});

});
