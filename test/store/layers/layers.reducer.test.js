import {
	layersReducer,
	index,
	sort,
	createDefaultLayerProperties,
	createDefaultLayer,
	createDefaultLayersConstraints,
	initialState,
	getTimestamp,
	extendedLayersReducer,
	getStyle,
	_DefaultColors
} from '../../../src/store/layers/layers.reducer';
import {
	addLayer,
	removeLayer,
	modifyLayer,
	setReady,
	geoResourceChanged,
	removeLayerOf,
	removeAndSetLayers,
	addLayerIfNotPresent,
	cloneAndAddLayer,
	SwipeAlignment,
	LayerState,
	modifyLayerProps,
	openLayerFilterUI,
	closeLayerFilterUI,
	openLayerSettingsUI,
	closeLayerSettingsUI
} from '../../../src/store/layers/layers.action';
import { TestUtils } from '../../test-utils.js';
import { GeoResourceFuture, VectorGeoResource, VectorSourceType, XyzGeoResource } from '../../../src/domain/geoResources';
import { EventLike, equals } from '../../../src/utils/storeUtils.js';
import { $injector } from '../../../src/injection/index.js';

describe('defaultLayerProperties', () => {
	it('returns an object containing default layer properties', () => {
		const defaultLayerProperties = createDefaultLayerProperties();
		expect(Object.keys(defaultLayerProperties).length).toBe(11);
		expect(defaultLayerProperties.visible).toBeTrue();
		expect(defaultLayerProperties.opacity).toBe(1);
		expect(defaultLayerProperties.zIndex).toBe(-1);
		expect(defaultLayerProperties.state).toEqual(LayerState.OK);
		expect(defaultLayerProperties.props).toEqual({});
		expect(defaultLayerProperties.style).toBeNull();
		expect(defaultLayerProperties.timestamp).toBeNull();
		expect(defaultLayerProperties.grChangedFlag).toBeNull();
		expect(defaultLayerProperties.constraints).toEqual(createDefaultLayersConstraints());
		expect(defaultLayerProperties.activeFilterUI).toBeNull();
		expect(defaultLayerProperties.activeSettingsUI).toBeNull();
	});
});

describe('createDefaultLayersConstraints', () => {
	it('returns an object containing all layer specific default constraint properties', () => {
		const defaultLayerConstraints = createDefaultLayersConstraints();
		expect(Object.keys(defaultLayerConstraints).length).toBe(7);
		expect(defaultLayerConstraints.alwaysTop).toBeFalse();
		expect(defaultLayerConstraints.hidden).toBeFalse();
		expect(defaultLayerConstraints.cloneable).toBeTrue();
		expect(defaultLayerConstraints.metaData).toBeTrue();
		expect(defaultLayerConstraints.filter).toBeNull();
		expect(defaultLayerConstraints.swipeAlignment).toEqual(SwipeAlignment.NOT_SET);
		expect(defaultLayerConstraints.updateInterval).toBeNull();
	});
});

describe('createDefaultLayer', () => {
	it('returns a layer object with default properties and values for a given id', () => {
		const layer = createDefaultLayer('foo');

		expect(layer.id).toBe('foo');
		expect(layer.geoResourceId).toBe('foo');
		expect(layer.constraints).toEqual(createDefaultLayersConstraints());
	});

	it('returns a layer object with default properties and values for given id and geoResourceId', () => {
		const layer = createDefaultLayer('foo', 'bar');

		expect(layer.id).toBe('foo');
		expect(layer.geoResourceId).toBe('bar');
		expect(layer.constraints).toEqual(createDefaultLayersConstraints());
	});
});

describe('layersReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			layers: layersReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();

		expect(store.getState().layers).toEqual({
			active: [],
			ready: false,
			added: jasmine.objectContaining({ payload: [] }),
			removed: jasmine.objectContaining({ payload: [] }),
			activeFilterUI: null,
			activeSettingsUI: null
		});
	});

	it("sets the 'zIndex' property based on an array", () => {
		const layerProperties0 = {};
		const layerProperties1 = {};
		const layerProperties2 = {};

		const array = index([layerProperties0, layerProperties1, layerProperties2]);

		expect(array[0].zIndex).toBe(0);
		expect(array[1].zIndex).toBe(1);
		expect(array[2].zIndex).toBe(2);
	});

	it("sorts an array based on the 'zIndex' property", () => {
		const layerProperties0 = { ...createDefaultLayerProperties(), id: 'id0', zIndex: 2 };
		const layerProperties1 = { ...createDefaultLayerProperties(), id: 'id1', zIndex: 0 };
		const layerProperties2 = { ...createDefaultLayerProperties(), id: 'id2', zIndex: 1 };

		const array = sort([layerProperties0, layerProperties1, layerProperties2]);

		expect(array[0].id).toBe('id1');
		expect(array[1].id).toBe('id2');
		expect(array[2].id).toBe('id0');
	});

	it("sorts an array based on the 'zIndex' property and the 'alwaysTop' constraint", () => {
		const layerProperties0 = { ...createDefaultLayerProperties(), id: 'id0', zIndex: 2 };
		const layerProperties1 = { ...createDefaultLayerProperties(), id: 'id1', zIndex: 0, constraints: { alwaysTop: true } };
		const layerProperties2 = { ...createDefaultLayerProperties(), id: 'id2', zIndex: 1 };

		const array = sort([layerProperties0, layerProperties1, layerProperties2]);

		expect(array[0].id).toBe('id2');
		expect(array[1].id).toBe('id0');
		expect(array[2].id).toBe('id1');
	});

	it("sorts an array based on the 'alwaysTop' constraint", () => {
		const layerProperties0 = { ...createDefaultLayerProperties(), id: 'label0', constraints: { alwaysTop: true } };
		const layerProperties1 = { ...createDefaultLayerProperties(), id: 'label1', constraints: { alwaysTop: true } };
		const layerProperties2 = { ...createDefaultLayerProperties(), id: 'label2', constraints: { alwaysTop: true } };

		const array = sort([layerProperties0, layerProperties1, layerProperties2]);

		expect(array[0].id).toBe('label0');
		expect(array[1].id).toBe('label1');
		expect(array[2].id).toBe('label2');
	});

	describe('addLayer', () => {
		it('adds layers and complements missing optional properties', () => {
			const store = setup();

			const layerProperties1 = { geoResourceId: 'geoResourceId1', constraints: { cloneable: false } };

			addLayer('id0'); // no layer properties
			addLayer('id1', layerProperties1);

			expect(store.getState().layers.active.length).toBe(2);
			expect(store.getState().layers.active[0].id).toBe('id0');
			expect(store.getState().layers.active[0].geoResourceId).toBe('id0');
			expect(store.getState().layers.active[0].zIndex).toBe(0);
			expect(store.getState().layers.active[0].visible).toBeTrue();
			expect(store.getState().layers.active[0].opacity).toBe(1);
			expect(store.getState().layers.active[0].timestamp).toBeNull();
			expect(store.getState().layers.active[0].state).toEqual(LayerState.OK);
			expect(store.getState().layers.active[0].props).toEqual({});
			expect(store.getState().layers.active[0].style).toBeNull();
			expect(store.getState().layers.active[0].constraints).toEqual(createDefaultLayersConstraints());

			expect(store.getState().layers.active[1].id).toBe('id1');
			expect(store.getState().layers.active[1].geoResourceId).toBe('geoResourceId1');
			expect(store.getState().layers.active[1].zIndex).toBe(1);
			expect(store.getState().layers.active[1].constraints.hidden).toBeFalse();
			expect(Object.keys(store.getState().layers.active[1].constraints).length).toBe(7);
		});

		it("adds layers regarding a 'z-index' property of 0", () => {
			const store = setup();
			expect(store.getState().layers.active.length).toBe(0);

			const layerProperties0 = {};
			const layerProperties1 = { zIndex: 0 };

			addLayer('id0', layerProperties0);
			addLayer('id1', layerProperties1);

			expect(store.getState().layers.active.length).toBe(2);
			expect(store.getState().layers.active[0].id).toBe('id1');
			expect(store.getState().layers.active[0].zIndex).toBe(0);

			expect(store.getState().layers.active[1].id).toBe('id0');
			expect(store.getState().layers.active[1].zIndex).toBe(1);
		});

		it("adds layers regarding a 'z-index' property of > 0", () => {
			const store = setup();

			const layerProperties0 = {};
			const layerProperties1 = {};
			const layerProperties2 = { zIndex: 1 };

			addLayer('id0', layerProperties0);
			addLayer('id1', layerProperties1);
			addLayer('id2', layerProperties2);

			expect(store.getState().layers.active.length).toBe(3);
			expect(store.getState().layers.active[0].id).toBe('id0');
			expect(store.getState().layers.active[0].zIndex).toBe(0);

			expect(store.getState().layers.active[1].id).toBe('id2');
			expect(store.getState().layers.active[1].zIndex).toBe(1);

			expect(store.getState().layers.active[2].id).toBe('id1');
			expect(store.getState().layers.active[2].zIndex).toBe(2);
		});

		it("adds layers ignoring a negative 'z-index' property", () => {
			const store = setup();

			const layerProperties0 = {};
			const layerProperties1 = {};
			const layerProperties2 = { zIndex: -1 };

			addLayer('id0', layerProperties0);
			addLayer('id1', layerProperties1);
			addLayer('id2', layerProperties2);

			expect(store.getState().layers.active.length).toBe(3);
			expect(store.getState().layers.active[0].id).toBe('id0');
			expect(store.getState().layers.active[0].zIndex).toBe(0);

			expect(store.getState().layers.active[1].id).toBe('id1');
			expect(store.getState().layers.active[1].zIndex).toBe(1);

			expect(store.getState().layers.active[2].id).toBe('id2');
			expect(store.getState().layers.active[2].zIndex).toBe(2);
		});

		it("adds layers regarding 'alwaysTop' constraint", () => {
			const store = setup();

			const layerProperties0 = {};
			const layerProperties1 = {};
			const layerProperties2 = { zIndex: 1, constraints: { alwaysTop: true } };

			addLayer('id2', layerProperties2);
			addLayer('id0', layerProperties0);
			addLayer('id1', layerProperties1);

			expect(store.getState().layers.active.length).toBe(3);
			expect(store.getState().layers.active[0].id).toBe('id0');
			expect(store.getState().layers.active[0].zIndex).toBe(0);

			expect(store.getState().layers.active[1].id).toBe('id1');
			expect(store.getState().layers.active[1].zIndex).toBe(1);

			expect(store.getState().layers.active[2].id).toBe('id2');
			expect(store.getState().layers.active[2].zIndex).toBe(2);
		});

		it('does nothing when layer is already present', () => {
			const store = setup();
			const layerProperties0 = {};
			const layerProperties1 = {};

			addLayer('id0', layerProperties0);
			addLayer('id0', layerProperties1);

			expect(store.getState().layers.active.length).toBe(1);
			expect(store.getState().layers.active[0].id).toBe('id0');
		});

		it('updates the "added" property when layers was added', () => {
			const store = setup();
			const layerProperties0 = {};

			addLayer('id0', layerProperties0);

			expect(store.getState().layers.active.length).toBe(1);
			expect(store.getState().layers.added.payload).toEqual(['id0']);
		});
	});

	describe('Filter-UI', () => {
		it('updates the `activeFilterUI` property', () => {
			const store = setup();

			openLayerFilterUI('layerId');

			expect(store.getState().layers.activeFilterUI).toBe('layerId');

			closeLayerFilterUI();

			expect(store.getState().layers.activeFilterUI).toBeNull();
		});
	});

	describe('Settings-UI', () => {
		it('updates the `activeSettingsUI` property', () => {
			const store = setup();

			openLayerSettingsUI('layerId');

			expect(store.getState().layers.activeSettingsUI).toBe('layerId');

			closeLayerSettingsUI();

			expect(store.getState().layers.activeSettingsUI).toBeNull();
		});
	});

	describe('addLayerIfNotPresent', () => {
		it('adds a layer if its GeoResource is not already present', () => {
			const store = setup();

			const geoResourceId = 'geoResourceId0';
			const layerProperties0 = { geoResourceId };

			addLayerIfNotPresent('id0', layerProperties0);
			addLayerIfNotPresent('id1', layerProperties0);
			addLayerIfNotPresent(geoResourceId);

			expect(store.getState().layers.active.length).toBe(1);
			expect(store.getState().layers.active[0].id).toBe('id0');
			expect(store.getState().layers.active[0].geoResourceId).toBe(geoResourceId);
		});
	});

	describe('cloneAndAddLayer', () => {
		describe('original layer does not exist', () => {
			it('does nothing', () => {
				const store = setup();
				addLayer('id0');

				cloneAndAddLayer('id1');

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe('id0');
			});
		});

		describe('original layer is not allowed to be cloned', () => {
			it('does nothing', () => {
				const store = setup();
				addLayer('id0', { constraints: { cloneable: false } });

				cloneAndAddLayer('id0');

				expect(store.getState().layers.active.length).toBe(1);
				expect(store.getState().layers.active[0].id).toBe('id0');
			});
		});

		describe('containing NO custom CloneLayerOptions', () => {
			it('clones and adds the layer', () => {
				const store = setup();
				const geoResourceId = 'geoResourceId';
				const opacity = 0.5;
				const visible = false;
				const timestamp = '1900';
				const state = LayerState.INCOMPLETE_DATA;
				const props = { featureCount: 5 };
				const style = { baseColor: '#4287f5' };
				const constraints = { ...createDefaultLayersConstraints(), hidden: true };
				addLayer('id0', { geoResourceId, opacity, visible, timestamp, state, style, props, constraints });

				cloneAndAddLayer('id0', 'id0Clone');

				expect(store.getState().layers.active.length).toBe(2);
				expect(store.getState().layers.active[0].id).toBe('id0');
				expect(store.getState().layers.active[0].zIndex).toBe(0);
				expect(store.getState().layers.active[1].id).toBe('id0Clone');
				expect(store.getState().layers.active[1].zIndex).toBe(1);
				expect(store.getState().layers.active[1].geoResourceId).toBe(geoResourceId);
				expect(store.getState().layers.active[1].opacity).toBe(opacity);
				expect(store.getState().layers.active[1].visible).toBe(visible);
				expect(store.getState().layers.active[1].timestamp).toBe(timestamp);
				expect(store.getState().layers.active[1].state).toBe(state);
				expect(store.getState().layers.active[1].props).toEqual(props);
				expect(store.getState().layers.active[1].style).toEqual(style);
				expect(store.getState().layers.active[1].constraints).toEqual(constraints);
			});
		});

		describe('containing custom CloneLayerOptions', () => {
			it('clones and adds the layer', () => {
				const store = setup();
				const geoResourceId = 'geoResourceId';
				const zIndex = 0;
				const opacity = 0.5;
				const visible = false;
				const timestamp = '1900';
				const constraints = { ...createDefaultLayersConstraints(), hidden: true };

				addLayer('id0');

				cloneAndAddLayer('id0', 'id0Clone', { geoResourceId, opacity, visible, zIndex, timestamp, constraints });

				expect(store.getState().layers.active.length).toBe(2);
				expect(store.getState().layers.active[1].id).toBe('id0');
				expect(store.getState().layers.active[1].zIndex).toBe(1);
				expect(store.getState().layers.active[0].id).toBe('id0Clone');
				expect(store.getState().layers.active[0].zIndex).toBe(zIndex);
				expect(store.getState().layers.active[0].geoResourceId).toBe(geoResourceId);
				expect(store.getState().layers.active[0].opacity).toBe(opacity);
				expect(store.getState().layers.active[0].visible).toBe(visible);
				expect(store.getState().layers.active[0].timestamp).toBe(timestamp);
				expect(store.getState().layers.active[0].state).toBe(LayerState.OK);
				expect(store.getState().layers.active[0].props).toEqual({});
				expect(store.getState().layers.active[0].constraints).toEqual(constraints);
			});
		});
	});

	describe('removeLayer', () => {
		it('removes a layer', () => {
			const layerProperties0 = { id: 'id0' };
			const layerProperties1 = { id: 'id1', geoResourceId: 'geoResourceId1' };
			const store = setup({
				layers: {
					active: [layerProperties0, layerProperties1]
				}
			});

			expect(store.getState().layers.active.length).toBe(2);

			removeLayer('id0');

			expect(store.getState().layers.active.length).toBe(1);
			expect(store.getState().layers.active[0].id).toBe('id1');
			expect(store.getState().layers.active[0].geoResourceId).toBe('geoResourceId1');
			expect(store.getState().layers.active[0].zIndex).toBe(0);
		});

		it('updates the "remove" property when layers was removed', () => {
			const initialRemovedValue = new EventLike([]);
			const layerProperties0 = { id: 'id0' };
			const layerProperties1 = { id: 'id1', geoResourceId: 'geoResourceId1' };
			const store = setup({
				layers: {
					active: [layerProperties0, layerProperties1],
					removed: initialRemovedValue
				}
			});

			expect(store.getState().layers.active.length).toBe(2);

			removeLayer('unknown');

			expect(store.getState().layers.removed.payload).toEqual([]);
			expect(store.getState().layers.removed).toEqual(initialRemovedValue);

			removeLayer('id0');

			expect(store.getState().layers.removed.payload).toEqual(['id0']);
		});
	});

	describe('removeLayerOf', () => {
		it('removes a layer by a GeoResource id', () => {
			const layerProperties0 = { id: 'id0', geoResourceId: 'geoResourceId0' };
			const layerProperties1 = { id: 'id1', geoResourceId: 'geoResourceId0' };
			const layerProperties2 = { id: 'id2', geoResourceId: 'geoResourceId2' };
			const store = setup({
				layers: {
					active: [layerProperties0, layerProperties1, layerProperties2]
				}
			});

			expect(store.getState().layers.active.length).toBe(3);

			removeLayerOf('geoResourceId0');

			expect(store.getState().layers.active.length).toBe(1);
			expect(store.getState().layers.active[0].id).toBe('id2');
			expect(store.getState().layers.active[0].geoResourceId).toBe('geoResourceId2');
			expect(store.getState().layers.active[0].zIndex).toBe(0);
		});

		it('updates the "remove" property when layers was removed by a GeoResource id', () => {
			const initialRemovedValue = new EventLike([]);
			const layerProperties0 = { id: 'id0', geoResourceId: 'geoResourceId0' };
			const layerProperties1 = { id: 'id1', geoResourceId: 'geoResourceId1' };
			const store = setup({
				layers: {
					active: [layerProperties0, layerProperties1],
					removed: initialRemovedValue
				}
			});

			expect(store.getState().layers.active.length).toBe(2);

			removeLayerOf('unknown');

			expect(store.getState().layers.removed.payload).toEqual([]);
			expect(store.getState().layers.removed).toEqual(initialRemovedValue);

			removeLayerOf('geoResourceId0');

			expect(store.getState().layers.removed.payload).toEqual(['id0']);
		});
	});

	describe('removeAndSetLayers', () => {
		it('removes and adds layers atomically', () => {
			const layerProperties0 = { id: 'id0' };
			const layerProperties1 = { id: 'id1' };
			const atomicallyAddedLayer2 = { id: 'id2', geoResourceId: 'geoResourceId2' };
			const atomicallyAddedLayer3 = { id: 'id3', visible: false };
			const atomicallyAddedLayer4 = { id: 'id4', opacity: 0.5, constraints: { swipeAlignment: SwipeAlignment.RIGHT } };
			const store = setup({
				layers: {
					...initialState,
					active: [layerProperties0, layerProperties1]
				}
			});

			expect(store.getState().layers.active.length).toBe(2);

			removeAndSetLayers([atomicallyAddedLayer2, atomicallyAddedLayer3, atomicallyAddedLayer4]);

			expect(store.getState().layers.active.length).toBe(3);
			expect(store.getState().layers.active[0].id).toBe('id2');
			expect(store.getState().layers.active[0].geoResourceId).toBe('geoResourceId2');
			expect(store.getState().layers.active[0].visible).toBeTrue();
			expect(store.getState().layers.active[0].opacity).toBe(1);
			expect(store.getState().layers.active[0].zIndex).toBe(0);
			expect(store.getState().layers.active[0].constraints).toEqual(createDefaultLayersConstraints());

			expect(store.getState().layers.active[1].id).toBe('id3');
			expect(store.getState().layers.active[1].geoResourceId).toBe('id3');
			expect(store.getState().layers.active[1].visible).toBeFalse();
			expect(store.getState().layers.active[1].opacity).toBe(1);
			expect(store.getState().layers.active[1].zIndex).toBe(1);
			expect(store.getState().layers.active[1].constraints).toEqual(createDefaultLayersConstraints());

			expect(store.getState().layers.active[2].id).toBe('id4');
			expect(store.getState().layers.active[2].geoResourceId).toBe('id4');
			expect(store.getState().layers.active[2].visible).toBeTrue();
			expect(store.getState().layers.active[2].opacity).toBe(0.5);
			expect(store.getState().layers.active[2].zIndex).toBe(2);
			expect(store.getState().layers.active[2].constraints).toEqual({ ...createDefaultLayersConstraints(), swipeAlignment: SwipeAlignment.RIGHT });

			expect(store.getState().layers.removed.payload).toEqual([layerProperties0.id, layerProperties1.id]);
			expect(store.getState().layers.added.payload).toEqual([atomicallyAddedLayer2.id, atomicallyAddedLayer3.id, atomicallyAddedLayer4.id]);
		});

		describe('property `restoreHiddenLayers` is `true`', () => {
			it('removes and adds layers atomically and restores existing hidden layers', () => {
				const layerProperties0 = { id: 'id0', constraints: { hidden: false } };
				const layerProperties1 = { id: 'id1', constraints: { hidden: true } };
				const layerProperties5 = { id: 'id5', constraints: { hidden: true } };
				const atomicallyAddedLayer2 = { id: 'id2' };
				const atomicallyAddedLayer3 = { id: 'id3' };
				const atomicallyAddedLayer4 = { id: 'id4' };
				const store = setup({
					layers: {
						...initialState,
						active: [layerProperties0, layerProperties1, layerProperties5]
					}
				});

				expect(store.getState().layers.active.length).toBe(3);

				removeAndSetLayers([atomicallyAddedLayer2, atomicallyAddedLayer3, atomicallyAddedLayer4], true);

				expect(store.getState().layers.active.length).toBe(5);
				expect(store.getState().layers.active[0].id).toBe('id2');
				expect(store.getState().layers.active[0].zIndex).toBe(0);

				expect(store.getState().layers.active[1].id).toBe('id3');
				expect(store.getState().layers.active[1].zIndex).toBe(1);

				expect(store.getState().layers.active[2].id).toBe('id4');
				expect(store.getState().layers.active[2].zIndex).toBe(2);

				expect(store.getState().layers.active[3].id).toBe('id1');
				expect(store.getState().layers.active[3].zIndex).toBe(3);

				expect(store.getState().layers.active[4].id).toBe('id5');
				expect(store.getState().layers.active[4].zIndex).toBe(4);

				expect(store.getState().layers.removed.payload).toEqual([layerProperties0.id]);
				expect(store.getState().layers.added.payload).toEqual([atomicallyAddedLayer2.id, atomicallyAddedLayer3.id, atomicallyAddedLayer4.id]);
			});
		});

		it('just removes layers atomically', () => {
			const layerProperties0 = { id: 'id0' };
			const layerProperties1 = { id: 'id1' };
			const store = setup({
				layers: {
					...initialState,
					active: [layerProperties0, layerProperties1]
				}
			});

			expect(store.getState().layers.active.length).toBe(2);

			removeAndSetLayers();

			expect(store.getState().layers.active.length).toBe(0);
			expect(store.getState().layers.removed.payload).toEqual([layerProperties0.id, layerProperties1.id]);
			expect(store.getState().layers.added.payload).toEqual([]);
		});

		it('just adds layers atomically', () => {
			const atomicallyAddedLayer2 = { id: 'id2' };
			const atomicallyAddedLayer3 = { id: 'id3' };
			const atomicallyAddedLayer4 = { id: 'id4' };
			const store = setup({
				layers: {
					...initialState
				}
			});

			expect(store.getState().layers.active.length).toBe(0);

			removeAndSetLayers([atomicallyAddedLayer2, atomicallyAddedLayer3, atomicallyAddedLayer4]);

			expect(store.getState().layers.active.length).toBe(3);
			expect(store.getState().layers.active[0].id).toBe('id2');
			expect(store.getState().layers.active[0].zIndex).toBe(0);
			expect(store.getState().layers.active[1].id).toBe('id3');
			expect(store.getState().layers.active[1].zIndex).toBe(1);
			expect(store.getState().layers.active[2].id).toBe('id4');
			expect(store.getState().layers.active[2].zIndex).toBe(2);
			expect(store.getState().layers.removed.payload).toEqual([]);
			expect(store.getState().layers.added.payload).toEqual([atomicallyAddedLayer2.id, atomicallyAddedLayer3.id, atomicallyAddedLayer4.id]);
		});

		it('avoids unnecessary changes of the `active` property due to event like fields', () => {
			const store = setup();

			addLayer('id0');
			addLayer('id1', { visible: false, grChangedFlag: /**Let's give the layer a grChangedFlag property*/ new EventLike('foo') });

			expect(store.getState().layers.active.length).toBe(2);
			const layerPropBefore = store.getState().layers.active;
			const atomicallyAddedLayer2 = { id: 'id0' };
			const atomicallyAddedLayer3 = { id: 'id1', visible: false };

			removeAndSetLayers([atomicallyAddedLayer2, atomicallyAddedLayer3]);

			const layerPropAfter = store.getState().layers.active;

			expect(equals(layerPropBefore, layerPropAfter)).toBeTrue();
		});
	});

	describe('modifyLayer', () => {
		it("modifies the 'visible' property of a layer", () => {
			const layerProperties0 = { ...createDefaultLayerProperties(), id: 'id0', visible: true };
			const store = setup({
				layers: {
					active: index([layerProperties0])
				}
			});

			expect(store.getState().layers.active[0].visible).toBe(true);

			modifyLayer('id0', { visible: false });

			expect(store.getState().layers.active[0].visible).toBe(false);
		});

		it("modifies the 'opacity' property of a layer", () => {
			const layerProperties0 = { ...createDefaultLayerProperties(), id: 'id0', opacity: 0.5 };
			const store = setup({
				layers: {
					active: index([layerProperties0])
				}
			});

			expect(store.getState().layers.active[0].opacity).toBe(0.5);

			modifyLayer('id0', { opacity: 0.42 });

			expect(store.getState().layers.active[0].opacity).toBe(0.42);
		});

		it("modifies the 'timestamp' property of a layer", () => {
			const layerProperties0 = { ...createDefaultLayerProperties(), id: 'id0', timestamp: 20081231 };
			const store = setup({
				layers: {
					active: index([layerProperties0])
				}
			});

			expect(store.getState().layers.active[0].timestamp).toBe(20081231);

			modifyLayer('id0', { timestamp: 20241231 });

			expect(store.getState().layers.active[0].timestamp).toBe(20241231);
		});

		it("modifies the 'state' property of a layer", () => {
			const layerProperties0 = { ...createDefaultLayerProperties(), id: 'id0', state: LayerState.INCOMPLETE_DATA };
			const store = setup({
				layers: {
					active: index([layerProperties0])
				}
			});

			expect(store.getState().layers.active[0].state).toBe(LayerState.INCOMPLETE_DATA);

			modifyLayer('id0', { state: LayerState.OK });

			expect(store.getState().layers.active[0].state).toBe(LayerState.OK);
		});

		it("modifies the 'props' property of a layer", () => {
			const layerProperties0 = { ...createDefaultLayerProperties(), id: 'id0', props: { featureCount: 7 } };
			const store = setup({
				layers: {
					active: index([layerProperties0])
				}
			});

			expect(store.getState().layers.active[0].props.featureCount).toBe(7);

			modifyLayer('id0', { props: { featureCount: 3 } });

			expect(store.getState().layers.active[0].props.featureCount).toBe(3);
		});

		it("modifies the 'style' property of a layer", () => {
			const layerProperties0 = { ...createDefaultLayerProperties(), id: 'id0', style: { baseColor: '#eb4034' } };
			const store = setup({
				layers: {
					active: index([layerProperties0])
				}
			});

			expect(store.getState().layers.active[0].style.baseColor).toBe('#eb4034');

			modifyLayer('id0', { style: { baseColor: '#5eeb34' } });

			expect(store.getState().layers.active[0].style.baseColor).toBe('#5eeb34');
		});

		it("modifies the 'zIndex' property of a layer", () => {
			const layerProperties0 = { ...createDefaultLayerProperties(), id: 'id0' };
			const layerProperties1 = { ...createDefaultLayerProperties(), id: 'id1' };
			const layerProperties2 = { ...createDefaultLayerProperties(), id: 'id2' };
			const store = setup({
				layers: {
					active: index([layerProperties0, layerProperties1, layerProperties2])
				}
			});

			modifyLayer('id0', { zIndex: 1 });

			expect(store.getState().layers.active[0].id).toBe('id1');
			expect(store.getState().layers.active[1].id).toBe('id0');
			expect(store.getState().layers.active[2].id).toBe('id2');
		});

		it("modifies the 'zIndex' property of a layer, to become lowermost", () => {
			const layerProperties0 = { ...createDefaultLayerProperties(), id: 'id0' };
			const layerProperties1 = { ...createDefaultLayerProperties(), id: 'id1' };
			const layerProperties2 = { ...createDefaultLayerProperties(), id: 'id2' };
			const store = setup({
				layers: {
					active: index([layerProperties0, layerProperties1, layerProperties2])
				}
			});

			modifyLayer('id1', { zIndex: 0 });

			expect(store.getState().layers.active[0].id).toBe('id1');
			expect(store.getState().layers.active[1].id).toBe('id0');
			expect(store.getState().layers.active[2].id).toBe('id2');
		});

		it("modifies the 'zIndex' property of a layer regarding the 'alwaysTop' constraint", () => {
			const layerProperties0 = { ...createDefaultLayerProperties(), id: 'id0' };
			const layerProperties1 = { ...createDefaultLayerProperties(), id: 'id1', constraints: { alwaysTop: true } };
			const layerProperties2 = { ...createDefaultLayerProperties(), id: 'id2' };
			const store = setup({
				layers: {
					active: sort(index([layerProperties0, layerProperties1, layerProperties2]))
				}
			});

			modifyLayer('id0', { zIndex: 1 });

			expect(store.getState().layers.active[0].id).toBe('id2');
			expect(store.getState().layers.active[1].id).toBe('id0');
			expect(store.getState().layers.active[2].id).toBe('id1');
		});

		it("modifies the 'hidden' constraint property of a layer", () => {
			const layerProperties0 = { ...createDefaultLayerProperties(), id: 'id0' };
			const store = setup({
				layers: {
					active: index([layerProperties0])
				}
			});

			expect(store.getState().layers.active[0].constraints.hidden).toBeFalse();

			modifyLayer('id0', { hidden: true });

			expect(store.getState().layers.active[0].constraints.hidden).toBeTrue();
		});

		it("modifies the 'alwaysTop' constraint property of a layer", () => {
			const layerProperties0 = { ...createDefaultLayerProperties(), id: 'id0' };
			const store = setup({
				layers: {
					active: index([layerProperties0])
				}
			});

			expect(store.getState().layers.active[0].constraints.alwaysTop).toBeFalse();

			modifyLayer('id0', { alwaysTop: true });

			expect(store.getState().layers.active[0].constraints.alwaysTop).toBeTrue();
		});

		it("modifies the 'swipeAlignment' constraint property of a layer", () => {
			const layerProperties0 = { ...createDefaultLayerProperties(), id: 'id0' };
			const store = setup({
				layers: {
					active: index([layerProperties0])
				}
			});

			expect(store.getState().layers.active[0].constraints.swipeAlignment).toEqual(SwipeAlignment.NOT_SET);

			modifyLayer('id0', { swipeAlignment: SwipeAlignment.RIGHT });

			expect(store.getState().layers.active[0].constraints.swipeAlignment).toEqual(SwipeAlignment.RIGHT);
		});

		it("modifies the 'filter' constraint property of a layer", () => {
			const layerProperties0 = { ...createDefaultLayerProperties(), id: 'id0' };
			const store = setup({
				layers: {
					active: index([layerProperties0])
				}
			});

			expect(store.getState().layers.active[0].constraints.filter).toBeNull();

			modifyLayer('id0', { filter: 'cql' });

			expect(store.getState().layers.active[0].constraints.filter).toBe('cql');

			modifyLayer('id0', { filter: '' });

			expect(store.getState().layers.active[0].constraints.filter).toBe('');

			modifyLayer('id0', { filter: null });

			expect(store.getState().layers.active[0].constraints.filter).toBeNull();
		});

		it("modifies the 'updateInterval' constraint property of a layer", () => {
			const layerProperties0 = { ...createDefaultLayerProperties(), id: 'id0' };
			const store = setup({
				layers: {
					active: index([layerProperties0])
				}
			});

			expect(store.getState().layers.active[0].constraints.updateInterval).toBeNull();

			modifyLayer('id0', { updateInterval: '123' });

			expect(store.getState().layers.active[0].constraints.updateInterval).toBeNull();

			modifyLayer('id0', { updateInterval: 123 });

			expect(store.getState().layers.active[0].constraints.updateInterval).toBe(123);

			modifyLayer('id0', { updateInterval: null });

			expect(store.getState().layers.active[0].constraints.updateInterval).toBeNull();
		});

		it('does nothing when modified layer is not present', () => {
			const layerProperties0 = { ...createDefaultLayerProperties(), id: 'id0', visible: true };
			const store = setup({
				layers: {
					active: index([layerProperties0])
				}
			});

			expect(store.getState().layers.active[0].visible).toBe(true);

			modifyLayer('id1', { visible: false });

			expect(store.getState().layers.active.length).toBe(1);
			expect(store.getState().layers.active[0].visible).toBe(true);
		});

		it('does nothing when LayerProperties are empty', () => {
			const layerProperties0 = { ...createDefaultLayerProperties(), id: 'id0', visible: true };
			const store = setup({
				layers: {
					active: index([layerProperties0])
				}
			});

			expect(store.getState().layers.active[0].visible).toBe(true);

			modifyLayer('id0');

			expect(store.getState().layers.active.length).toBe(1);
			expect(store.getState().layers.active[0].visible).toBe(true);
		});
	});

	describe('modifyLayerProps', () => {
		it("modifies the 'props' property of a layer", () => {
			const layerProperties0 = { ...createDefaultLayerProperties(), id: 'id0', props: { featureCount: 21, foo: 'bar' } };
			const store = setup({
				layers: {
					active: index([layerProperties0])
				}
			});

			expect(store.getState().layers.active[0].props).toEqual({ featureCount: 21, foo: 'bar' });

			modifyLayerProps('id0', {});

			expect(store.getState().layers.active[0].props).toEqual({ featureCount: 21, foo: 'bar' });

			modifyLayerProps('id0', { featureCount: 42 });

			expect(store.getState().layers.active[0].props).toEqual({ featureCount: 42, foo: 'bar' });

			modifyLayerProps('id0', { featureCount: 55 }, true);

			expect(store.getState().layers.active[0].props).toEqual({ featureCount: 55 });
		});

		it('does nothing when layer is not present', () => {
			const layerProperties0 = { ...createDefaultLayerProperties(), id: 'id0', props: { featureCount: 21, foo: 'bar' } };
			const store = setup({
				layers: {
					active: index([layerProperties0])
				}
			});

			expect(store.getState().layers.active[0].props).toEqual({ featureCount: 21, foo: 'bar' });

			modifyLayerProps('id1', {}, true);

			expect(store.getState().layers.active.length).toBe(1);
			expect(store.getState().layers.active[0].props).toEqual({ featureCount: 21, foo: 'bar' });
		});
	});

	describe('geoResourceChanged', () => {
		it('updates the GeoResource change flag by a GeoResource id', () => {
			const geoResourceId0 = 'geoResourceId0';
			const geoResourceId1 = 'geoResourceId1';
			const layerProperties0 = { ...createDefaultLayerProperties(), id: 'id0', geoResourceId: geoResourceId0 };
			const layerProperties1 = { ...createDefaultLayerProperties(), id: 'id1', geoResourceId: geoResourceId1 };
			const store = setup({
				layers: {
					active: index([layerProperties0, layerProperties1])
				}
			});

			expect(store.getState().layers.active[0].grChangedFlag).toBeNull();
			expect(store.getState().layers.active[1].grChangedFlag).toBeNull();

			geoResourceChanged(geoResourceId0);

			expect(store.getState().layers.active[0].grChangedFlag.payload).toBe(geoResourceId0);
			expect(store.getState().layers.active[1].grChangedFlag).toBeNull();
		});

		it('updates the GeoResource change flag by a GeoResource', () => {
			const geoResourceId0 = 'geoResourceId0';
			const geoResourceId1 = 'geoResourceId1';
			const layerProperties0 = { ...createDefaultLayerProperties(), id: 'id0', geoResourceId: geoResourceId0 };
			const layerProperties1 = { ...createDefaultLayerProperties(), id: 'id1', geoResourceId: geoResourceId1 };
			const store = setup({
				layers: {
					active: index([layerProperties0, layerProperties1])
				}
			});

			expect(store.getState().layers.active[0].grChangedFlag).toBeNull();
			expect(store.getState().layers.active[1].grChangedFlag).toBeNull();

			geoResourceChanged(new GeoResourceFuture(geoResourceId0, () => {}));

			expect(store.getState().layers.active[0].grChangedFlag.payload).toBe(geoResourceId0);
			expect(store.getState().layers.active[1].grChangedFlag).toBeNull();
		});
	});

	it('marks the state as ready', () => {
		const store = setup();

		expect(store.getState().layers.ready).toBeFalse();

		setReady();

		expect(store.getState().layers.ready).toBeTrue();
	});
});

describe('productiveLayersReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			layers: extendedLayersReducer
		});
	};

	/**
	 * We implicitly test the call of the getTimestamp() util fn
	 */
	describe('call the `getTimestamp` and `getStyle` util fn', () => {
		const geoResourceService = {
			byId: () => {}
		};
		afterEach(() => {
			$injector.reset();
		});

		it('for LAYER_ADDED action type', () => {
			const store = setup();
			$injector.registerSingleton('GeoResourceService', geoResourceService);
			const timestamp = '1900';
			const style = { baseColor: "'#ff0000'" };
			const geoResourceId = 'geoResourceId';
			const geoResource = new VectorGeoResource(geoResourceId, 'label', VectorSourceType.EWKT).setTimestamps([timestamp]).setStyle(style);
			const spy = spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(geoResource);

			addLayer('id0', { geoResourceId });

			expect(spy).toHaveBeenCalled();
			expect(store.getState().layers.active[0].timestamp).toBe(timestamp);
			expect(store.getState().layers.active[0].style).toBe(style);
		});

		it('for LAYER_REMOVED action type', () => {
			const geoResourceId = 'geoResourceId';
			const layerProperties0 = createDefaultLayer('id0', geoResourceId);
			const layerProperties1 = createDefaultLayer('id1', 'geoResourceId1');
			const store = setup({
				layers: {
					active: [layerProperties0, layerProperties1]
				}
			});
			$injector.registerSingleton('GeoResourceService', geoResourceService);
			const timestamp = '1900';
			const style = { baseColor: "'#ff0000'" };
			const geoResource = new VectorGeoResource(geoResourceId, 'label', VectorSourceType.EWKT).setTimestamps([timestamp]).setStyle(style);
			const spy = spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(geoResource);

			removeLayer('id1', { geoResourceId });

			expect(spy).toHaveBeenCalled();
			expect(store.getState().layers.active[0].timestamp).toBe(timestamp);
			expect(store.getState().layers.active[0].style).toBe(style);
		});

		it('for LAYER_REMOVE_AND_SET action type', () => {
			const geoResourceId = 'geoResourceId';
			const layerProperties0 = createDefaultLayer('id0', geoResourceId);
			const layerProperties1 = createDefaultLayer('id1', 'geoResourceId1');
			const store = setup({
				layers: {
					active: [layerProperties1]
				}
			});
			$injector.registerSingleton('GeoResourceService', geoResourceService);
			const timestamp = '1900';
			const style = { baseColor: "'#ff0000'" };
			const geoResource = new VectorGeoResource(geoResourceId, 'label', VectorSourceType.EWKT).setTimestamps([timestamp]).setStyle(style);
			const spy = spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(geoResource);

			removeAndSetLayers([layerProperties0]);

			expect(spy).toHaveBeenCalled();
			expect(store.getState().layers.active[0].timestamp).toBe(timestamp);
			expect(store.getState().layers.active[0].style).toBe(style);
		});

		it('for LAYER_MODIFIED action type', () => {
			const id = 'id0';
			const geoResourceId = 'geoResourceId';
			const layerProperties0 = createDefaultLayer(id, geoResourceId);
			const store = setup({
				layers: {
					active: [layerProperties0]
				}
			});
			$injector.registerSingleton('GeoResourceService', geoResourceService);
			const timestamp = '1900';
			const style = { baseColor: "'#ff0000'" };
			const geoResource = new VectorGeoResource(geoResourceId, 'label', VectorSourceType.EWKT).setTimestamps([timestamp]).setStyle(style);
			const spy = spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(geoResource);

			modifyLayer(id, { visible: true });

			expect(spy).toHaveBeenCalled();
			expect(store.getState().layers.active[0].timestamp).toBe(timestamp);
			expect(store.getState().layers.active[0].style).toBe(style);
		});
	});
});

describe('getTimestamp', () => {
	const geoResourceService = {
		byId: () => {}
	};
	describe('GeoResourceService is available', () => {
		beforeEach(() => {
			$injector.registerSingleton('GeoResourceService', geoResourceService);
		});

		afterEach(() => {
			$injector.reset();
		});

		describe('referenced GeoResource has no timestamps', () => {
			it('returns `null`', () => {
				const geoResourceId = 'geoResourceId';
				const geoResource = new XyzGeoResource(geoResourceId, 'label', 'url');
				spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(geoResource);
				const layer = createDefaultLayer('id', geoResourceId);

				expect(getTimestamp(layer)).toBeNull();
			});
		});
		describe('referenced GeoResource is unknown', () => {
			it('returns `null`', () => {
				const geoResourceId = 'geoResourceId';
				spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(null);
				const layer = createDefaultLayer('id', geoResourceId);

				expect(getTimestamp(layer)).toBeNull();
			});
		});
		describe('the layer contains a timestamp', () => {
			it('returns the timestamp of the layer', () => {
				const timestamp = '1900';
				const geoResourceId = 'geoResourceId';
				const geoResource = new XyzGeoResource(geoResourceId, 'label', 'url').setTimestamps(['2000']);
				spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(geoResource);
				const layer = createDefaultLayer('id', geoResourceId);

				expect(getTimestamp({ ...layer, timestamp })).toBe(timestamp);
			});
		});
		describe('the layer does NOT contain a timestamp', () => {
			it('returns the latest timestamp of the GeoResource', () => {
				const timestamp = '1900';
				const geoResourceId = 'geoResourceId';
				const geoResource = new XyzGeoResource(geoResourceId, 'label', 'url').setTimestamps([timestamp, '2000']);
				spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(geoResource);
				const layer = createDefaultLayer('id', geoResourceId);

				expect(getTimestamp(layer)).toBe(timestamp);
			});
		});
	});
});

describe('getStyle', () => {
	const geoResourceService = {
		byId: () => {}
	};
	describe('GeoResourceService is available', () => {
		beforeEach(() => {
			$injector.registerSingleton('GeoResourceService', geoResourceService);
		});

		afterEach(() => {
			$injector.reset();
		});

		describe('layer style', () => {
			it('provides an array of default colors', () => {
				expect(Object.isFrozen(_DefaultColors)).toBeTrue();
				expect(_DefaultColors).toEqual(['#ff0000', '#ffa500', '#0000ff', '#00ffff', '#00ff00', '#800080', '#008000']);
			});
		});

		describe('layer has no style', () => {
			describe('GeoResources is an AbstractVectorGeoResource', () => {
				describe('referenced GeoResource has no style', () => {
					it('returns a random style based on the id of the GeoResource', () => {
						const geoResourceId0 = 'geoResourceId';
						const geoResourceId1 = 'geoResourceId1';
						const geoResource0 = new VectorGeoResource(geoResourceId0, 'label', VectorSourceType.EWKT);
						const geoResource1 = new VectorGeoResource(geoResourceId1, 'label', VectorSourceType.EWKT);
						spyOn(geoResourceService, 'byId').and.returnValue(geoResource0, geoResource0, geoResource1, geoResource1);
						const layer0 = createDefaultLayer('id', geoResourceId0);
						const layer1 = createDefaultLayer('id', geoResourceId1);

						expect(getStyle(layer0)).toEqual({ baseColor: '#ff0000' });
						expect(getStyle(layer0)).toEqual({ baseColor: '#ff0000' });
						expect(getStyle(layer1)).toEqual({ baseColor: '#008000' });
						expect(getStyle(layer1)).toEqual({ baseColor: '#008000' });
					});
				});
				describe('referenced GeoResource contains a style', () => {
					it('returns the style of the GeoResource', () => {
						const geoResourceId = 'geoResourceId';
						const geoResource = new VectorGeoResource(geoResourceId, 'label', VectorSourceType.EWKT).setStyle({ baseColor: '#0000ff' });
						spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(geoResource);
						const layer = createDefaultLayer('id', geoResourceId);

						expect(getStyle(layer)).toEqual({ baseColor: '#0000ff' });
						expect(getStyle(layer)).toEqual({ baseColor: '#0000ff' });
					});
				});
			});

			describe('GeoResources is an AbstractVectorGeoResource', () => {
				it('returns `null`', () => {
					const geoResourceId = 'geoResourceId';
					const geoResource = new XyzGeoResource(geoResourceId, 'label', 'url');
					spyOn(geoResourceService, 'byId').withArgs(geoResourceId).and.returnValue(geoResource);
					const layer = createDefaultLayer('id', geoResourceId);

					expect(getStyle(layer)).toBeNull();
				});
			});
		});

		describe('layer has already a style', () => {
			it('returns the style', () => {
				const geoResourceId = 'geoResourceId';
				const style = { baseColor: "'#ff0000'" };
				const layer = { ...createDefaultLayer('id', geoResourceId), style };

				expect(getStyle(layer)).toEqual(style);
			});
		});
	});
});
