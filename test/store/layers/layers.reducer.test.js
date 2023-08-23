import {
	layersReducer,
	index,
	sort,
	createDefaultLayerProperties,
	createDefaultLayer,
	createDefaultLayersConstraints
} from '../../../src/store/layers/layers.reducer';
import { addLayer, removeLayer, modifyLayer, setReady, geoResourceChanged } from '../../../src/store/layers/layers.action';
import { TestUtils } from '../../test-utils.js';
import { GeoResourceFuture } from '../../../src/domain/geoResources';

describe('defaultLayerProperties', () => {
	it('returns an object containing default layer properties', () => {
		const defaultLayerProperties = createDefaultLayerProperties();
		expect(defaultLayerProperties.visible).toBeTrue();
		expect(defaultLayerProperties.opacity).toBe(1);
		expect(defaultLayerProperties.zIndex).toBe(-1);
		expect(defaultLayerProperties.grChangedFlag).toBeNull();
		expect(defaultLayerProperties.constraints).toEqual(createDefaultLayersConstraints());
	});
});

describe('createDefaultLayersConstraints', () => {
	it('returns an object containing all layer specific default constraint properties', () => {
		const defaultLayerConstraints = createDefaultLayersConstraints();
		expect(defaultLayerConstraints.alwaysTop).toBeFalse();
		expect(defaultLayerConstraints.hidden).toBeFalse();
		expect(defaultLayerConstraints.cloneable).toBeTrue();
		expect(defaultLayerConstraints.metaData).toBeTrue();
	});
});

describe('createDefaultLayer', () => {
	it('returns a layer object with default properties and values for a given id', () => {
		const layer = createDefaultLayer('foo');

		expect(layer.id).toBe('foo');
		expect(layer.geoResourceId).toBe('foo');
		expect(layer.visible).toBeTrue();
		expect(layer.opacity).toBe(1);
		expect(layer.zIndex).toBe(-1);
		expect(layer.grChangedFlag).toBeNull();
		expect(layer.constraints).toEqual(createDefaultLayersConstraints());
	});

	it('returns a layer object with default properties and values for given id and geoResourceId', () => {
		const layer = createDefaultLayer('foo', 'bar');

		expect(layer.id).toBe('foo');
		expect(layer.geoResourceId).toBe('bar');
		expect(layer.visible).toBeTrue();
		expect(layer.opacity).toBe(1);
		expect(layer.zIndex).toBe(-1);
		expect(layer.grChangedFlag).toBeNull();
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
		expect(store.getState().layers.active.length).toBe(0);
		expect(store.getState().layers.ready).toBeFalse();
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

	it('adds layers and complements missing optional properties', () => {
		const store = setup();

		const layerProperties1 = { geoResourceId: 'geoResourceId1', constraints: { cloneable: false } };

		addLayer('id0'); // no layer properties
		addLayer('id1', layerProperties1);

		expect(store.getState().layers.active.length).toBe(2);
		expect(store.getState().layers.active[0].id).toBe('id0');
		expect(store.getState().layers.active[0].geoResourceId).toBe('id0');
		expect(store.getState().layers.active[0].zIndex).toBe(0);
		expect(store.getState().layers.active[0].constraints).toEqual(createDefaultLayersConstraints());

		expect(store.getState().layers.active[1].id).toBe('id1');
		expect(store.getState().layers.active[1].geoResourceId).toBe('geoResourceId1');
		expect(store.getState().layers.active[1].zIndex).toBe(1);
		expect(store.getState().layers.active[1].constraints.hidden).toBeFalse();
		expect(Object.keys(store.getState().layers.active[1].constraints).length).toBe(4);
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

	it('marks the state as ready', () => {
		const store = setup();

		expect(store.getState().layers.ready).toBeFalse();

		setReady();

		expect(store.getState().layers.ready).toBeTrue();
	});
});
