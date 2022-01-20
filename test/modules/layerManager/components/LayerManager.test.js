import { LayerManager } from '../../../../src/modules/layerManager/components/LayerManager';
import { Checkbox } from '../../../../src/modules/commons/components/checkbox/Checkbox';
import { layersReducer, createDefaultLayerProperties } from '../../../../src/store/layers/layers.reducer';
import { TestUtils } from '../../../test-utils';
import { $injector } from '../../../../src/injection';
import { LayerItem } from '../../../../src/modules/layerManager/components/LayerItem';
import { modifyLayer } from '../../../../src/store/layers/layers.action';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../src/utils/markup';

window.customElements.define(Checkbox.tag, Checkbox);
window.customElements.define(LayerItem.tag, LayerItem);
window.customElements.define(LayerManager.tag, LayerManager);


describe('LayerManager', () => {
	let store;

	const environmentServiceMock = {
		isTouch: () => false
	};
	const setup = async (state) => {

		store = TestUtils.setupStoreAndDi(state, { layers: layersReducer });
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
		$injector.registerSingleton('EnvironmentService', environmentServiceMock);
		return TestUtils.render(LayerManager.tag);
	};

	describe('when initialized', () => {
		it('with empty layers displays no layer item', async () => {
			const stateEmpty = {
				layers: {
					active: [],
					background: 'null'
				}
			};
			const element = await setup(stateEmpty);

			expect(element.shadowRoot.querySelector('.layer')).toBeFalsy();
		});

		it('with one layer displays one layer item', async () => {
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0', label: 'label0', visible: true, zIndex: 0
			};
			const state = {
				layers: {
					active: [layer],
					background: 'bg0'
				}
			};
			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.layer').length).toBe(1);
			expect(element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)).toHaveSize(1);
			expect(element.shadowRoot.querySelector('.layer').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
		});

		it('with one not visible layer displays one layer item', async () => {
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0', label: 'label0', visible: false, zIndex: 0
			};
			const state = {
				layers: {
					active: [layer],
					background: 'bg0'
				}
			};
			const element = await setup(state);
			const layerItem = element.shadowRoot.querySelector('ba-layer-item');
			const checkboxElement = layerItem.shadowRoot.querySelector('ba-checkbox');

			expect(checkboxElement.checked).toBeFalse();
		});

		it('displays one out of two layers - one is hidden', async () => {
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0', label: 'label0', visible: true, zIndex: 0
			};

			const hiddenLayer = {
				...createDefaultLayerProperties(),
				id: 'id1', label: 'label1', visible: false, zIndex: 0, constraints: { hidden: true, alwaysOnTop: false }
			};
			const state = {
				layers: {
					active: [layer, hiddenLayer],
					background: 'bg0'
				}
			};
			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.layer').length).toBe(1);
		});

		it('shows a title', async () => {
			const stateEmpty = {
				layers: {
					active: [],
					background: 'null'
				}
			};
			const element = await setup(stateEmpty);

			expect(element.shadowRoot.querySelector('.title').innerText).toBe('layerManager_title');
		});
	});


	describe('when layer items are rendered', () => {
		let element;
		beforeEach(async () => {
			const layer0 = { ...createDefaultLayerProperties(), id: 'id0', label: '', visible: true, zIndex: 0, draggable: true };
			const layer1 = { ...createDefaultLayerProperties(), id: 'id0', label: '', visible: true, zIndex: 1, draggable: true };
			const layer2 = { ...createDefaultLayerProperties(), id: 'id0', label: '', visible: true, zIndex: 2, draggable: true };
			const state = {
				layers: {
					active: [layer0, layer1, layer2],
					background: 'bg0'
				}
			};
			element = await setup(state);
		});

		it('renders placeholder for dragging around the layers', () => {

			const listElements = element.shadowRoot.querySelectorAll('li');
			const layerElements = element.shadowRoot.querySelectorAll('.layer');
			const placeholderElements = element.shadowRoot.querySelectorAll('.placeholder');
			expect(listElements.length).toBe(7);
			expect(layerElements.length).toBe(3);
			expect(placeholderElements.length).toBe(4);
		});


		it('have only non-draggable placeholder items', () => {
			const placeholderElements = [...element.shadowRoot.querySelectorAll('.placeholder')];

			const nonDraggablePlaceholderElements = placeholderElements.filter((element) => {
				return !element.draggable;
			});

			expect(placeholderElements.length).toBe(4);
			expect(nonDraggablePlaceholderElements.length).toBe(4);

		});
	});

	describe('when layer items dragged', () => {
		let element;
		beforeEach(async () => {
			const layer0 = { ...createDefaultLayerProperties(), id: 'id0', label: 'Label 0', visible: true, zIndex: 0 };
			const layer1 = { ...createDefaultLayerProperties(), id: 'id1', label: 'Label 1', visible: true, zIndex: 1 };
			const layer2 = { ...createDefaultLayerProperties(), id: 'id2', label: 'Label 2', visible: true, zIndex: 2 };
			const state = {
				layers: {
					active: [layer0, layer1, layer2],
					background: 'bg0'
				}
			};
			element = await setup(state);
		});
		const createNewDataTransfer = () => {
			let data = {};
			return {
				clearData: function (key) {
					if (key === undefined) {
						data = {};
					}
					else {
						delete data[key];
					}
				},
				getData: function (key) {
					return data[key];
				},
				setData: function (key, value) {
					data[key] = value;
				},
				setDragImage: function () { },
				dropEffect: 'none',
				files: [],
				items: [],
				types: []
				// also effectAllowed
			};
		};

		it('on dragstart should abort on touch-devices', () => {
			const layerElement = element.shadowRoot.querySelector('.layer');
			spyOn(environmentServiceMock, 'isTouch').and.callFake(() => true);
			const dragstartEvt = document.createEvent('MouseEvents');
			dragstartEvt.initMouseEvent('dragstart', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, layerElement);
			dragstartEvt.dataTransfer = createNewDataTransfer();
			layerElement.dispatchEvent(dragstartEvt);

			expect(element._draggedItem).toBeFalse();

		});


		it('on dragstart should update internal draggedItem', () => {
			const layerElement = element.shadowRoot.querySelector('.layer');

			const dragstartEvt = document.createEvent('MouseEvents');
			dragstartEvt.initMouseEvent('dragstart', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, layerElement);
			dragstartEvt.dataTransfer = createNewDataTransfer();
			layerElement.dispatchEvent(dragstartEvt);

			expect(element._draggedItem).not.toBeFalse();

		});

		it('on dragstart should update placeholder-content for dragging 1th layer', () => {
			const layers = element.shadowRoot.querySelectorAll('.layer');
			const layerElement = layers[0];

			const dragstartEvt = document.createEvent('MouseEvents');
			dragstartEvt.initMouseEvent('dragstart', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, layerElement);
			dragstartEvt.dataTransfer = createNewDataTransfer();
			layerElement.dispatchEvent(dragstartEvt);

			const placeholders = [...element.shadowRoot.querySelectorAll('.placeholder')];
			const activePlaceholders = [...element.shadowRoot.querySelectorAll('.placeholder-active')];
			expect(placeholders.length).toBe(4);
			expect(activePlaceholders.length).toBe(2);
			expect(activePlaceholders[0].innerText).toBe('2');
			expect(activePlaceholders[1].innerText).toBe('3');
		});

		it('on dragstart should update placeholder-content for dragging 2th layer', () => {
			const layers = element.shadowRoot.querySelectorAll('.layer');
			const layerElement = layers[1];
			const dragstartEvt = document.createEvent('MouseEvents');
			dragstartEvt.initMouseEvent('dragstart', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, layerElement);
			dragstartEvt.dataTransfer = createNewDataTransfer();
			layerElement.dispatchEvent(dragstartEvt);

			const placeholders = [...element.shadowRoot.querySelectorAll('.placeholder')];
			const activePlaceholders = [...element.shadowRoot.querySelectorAll('.placeholder-active')];
			expect(placeholders.length).toBe(4);
			expect(activePlaceholders.length).toBe(2);
			expect(activePlaceholders[0].innerText).toBe('1');
			expect(activePlaceholders[1].innerText).toBe('3');
		});

		it('on dragstart should update placeholder-content for dragging 3th layer', () => {
			const layers = element.shadowRoot.querySelectorAll('.layer');
			const layerElement = layers[2];
			const dragstartEvt = document.createEvent('MouseEvents');
			dragstartEvt.initMouseEvent('dragstart', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, layerElement);
			dragstartEvt.dataTransfer = createNewDataTransfer();
			layerElement.dispatchEvent(dragstartEvt);

			const placeholders = [...element.shadowRoot.querySelectorAll('.placeholder')];
			const activePlaceholders = [...element.shadowRoot.querySelectorAll('.placeholder-active')];
			expect(placeholders.length).toBe(4);
			expect(activePlaceholders.length).toBe(2);
			expect(activePlaceholders[0].innerText).toBe('1');
			expect(activePlaceholders[1].innerText).toBe('2');
		});

		it('on dragEnter of neighbouring placeholder no style changed', () => {

			const neighbourPlaceholder = element.shadowRoot.querySelector('#placeholder_0');
			element._draggedItem = element._draggableItems.filter(element => element.listIndex === 1)[0];
			const dragstartEvt = document.createEvent('MouseEvents');
			dragstartEvt.initMouseEvent('dragenter', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, neighbourPlaceholder);
			dragstartEvt.dataTransfer = createNewDataTransfer();
			neighbourPlaceholder.dispatchEvent(dragstartEvt);

			expect(neighbourPlaceholder.classList.contains('over')).toBeFalse();

		});

		it('on dragEnter of not neighbouring placeholder add style class', () => {

			const neighbourPlaceholder = element.shadowRoot.querySelector('#placeholder_4');
			element._draggedItem = element._draggableItems.filter(element => element.listIndex === 1)[0];
			const dragstartEvt = document.createEvent('MouseEvents');
			dragstartEvt.initMouseEvent('dragenter', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, neighbourPlaceholder);
			dragstartEvt.dataTransfer = createNewDataTransfer();
			neighbourPlaceholder.dispatchEvent(dragstartEvt);

			expect(neighbourPlaceholder.classList.contains('over')).toBeTrue();

		});

		it('on dragEnd call event.preventDefault()', () => {

			const listElement = element.shadowRoot.querySelector('li');

			const dragendEvt = document.createEvent('MouseEvents');
			dragendEvt.initMouseEvent('dragend', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, listElement);
			dragendEvt.dataTransfer = createNewDataTransfer();
			dragendEvt.preventDefault = jasmine.createSpy();
			listElement.dispatchEvent(dragendEvt);

			expect(dragendEvt.preventDefault).toHaveBeenCalled();

		});

		it('on dragleave of not neighbouring placeholder remove style class', () => {

			const neighbourPlaceholder = element.shadowRoot.querySelector('#placeholder_4');
			element._draggedItem = element._draggableItems.filter(element => element.listIndex === 1)[0];
			const dragstartEvt = document.createEvent('MouseEvents');
			dragstartEvt.initMouseEvent('dragleave', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, neighbourPlaceholder);
			dragstartEvt.dataTransfer = createNewDataTransfer();

			neighbourPlaceholder.classList.add('over');
			neighbourPlaceholder.dispatchEvent(dragstartEvt);

			expect(neighbourPlaceholder.classList.contains('over')).toBeFalse();

		});

		it('on dragover of not neighbouring placeholder dropEffect to \'all\'', () => {

			const neighbourPlaceholder = element.shadowRoot.querySelector('#placeholder_4');
			element._draggedItem = element._draggableItems.filter(element => element.listIndex === 1)[0];
			const dragoverEvt = document.createEvent('MouseEvents');
			dragoverEvt.initMouseEvent('dragover', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, neighbourPlaceholder);
			dragoverEvt.dataTransfer = createNewDataTransfer();

			neighbourPlaceholder.dispatchEvent(dragoverEvt);

			expect(dragoverEvt.dataTransfer.dropEffect).toBe('all');

		});

		it('on dragover of not neighbouring placeholder dropEffect to \'none\'', () => {

			const neighbourPlaceholder = element.shadowRoot.querySelector('#placeholder_2');
			element._draggedItem = element._draggableItems.filter(element => element.listIndex === 1)[0];
			const dragoverEvt = document.createEvent('MouseEvents');
			dragoverEvt.initMouseEvent('dragover', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, neighbourPlaceholder);
			dragoverEvt.dataTransfer = createNewDataTransfer();
			dragoverEvt.dataTransfer.dropEffect = 'foo';
			neighbourPlaceholder.dispatchEvent(dragoverEvt);

			expect(dragoverEvt.dataTransfer.dropEffect).toBe('none');

		});

		it('drops firstlayer on placeholder to be penultimate layer', () => {

			const neighbourPlaceholder = element.shadowRoot.querySelector('#placeholder_4');
			element._draggedItem = element._draggableItems.filter(element => element.listIndex === 1)[0];
			expect(element._draggedItem.id).toBe('id0');
			const dropEvt = document.createEvent('MouseEvents');
			dropEvt.initMouseEvent('drop', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, neighbourPlaceholder);
			dropEvt.dataTransfer = createNewDataTransfer();

			/*
			*  0     0    1     1    2     2     3
			* [p0] [id0] [p2] [id1] [p4] [id2] [p5]
			*        |_______________^
			*/

			neighbourPlaceholder.classList.add('over');
			neighbourPlaceholder.dispatchEvent(dropEvt);

			expect(store.getState().layers.active[0].id).toBe('id1');
			expect(store.getState().layers.active[1].id).toBe('id0');
			expect(store.getState().layers.active[2].id).toBe('id2');
			expect(neighbourPlaceholder.classList.contains('over')).toBeFalse();

		});

		it('drops last on placeholder to be penultimate layer', () => {

			const neighbourPlaceholder = element.shadowRoot.querySelector('#placeholder_2');
			element._draggedItem = element._draggableItems.filter(element => element.listIndex === 5)[0];
			expect(element._draggedItem.id).toBe('id2');
			const dropEvt = document.createEvent('MouseEvents');
			dropEvt.initMouseEvent('drop', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, neighbourPlaceholder);
			dropEvt.dataTransfer = createNewDataTransfer();

			/*
			*  0     0    1     1    2     2     3
			* [p0] [id0] [p2] [id1] [p4] [id2] [p5]
			*              ^_______________|
			*/

			neighbourPlaceholder.classList.add('over');
			neighbourPlaceholder.dispatchEvent(dropEvt);

			expect(store.getState().layers.active[0].id).toBe('id0');
			expect(store.getState().layers.active[1].id).toBe('id2');
			expect(store.getState().layers.active[2].id).toBe('id1');
			expect(neighbourPlaceholder.classList.contains('over')).toBeFalse();

		});
	});

	describe('when layers are modified', () => {

		it('renders changed layer.label', async () => {
			const layer = {
				...createDefaultLayerProperties(),
				id: 'id0', label: 'Foo'
			};
			const state = {
				layers: {
					active: [layer],
					background: 'bg0'
				}
			};
			const modifyableLayerProperties = { label: 'Bar' };

			const element = await setup(state);
			const layerItem = element.shadowRoot.querySelector('ba-layer-item');
			const layerLabel = layerItem.shadowRoot.querySelector('.ba-list-item__text');
			expect(layerLabel.innerText).toBe('Foo');

			modifyLayer('id0', modifyableLayerProperties);
			expect(store.getState().layers.active[0].label).toBe(modifyableLayerProperties.label);
			expect(layerLabel.innerText).toBe(modifyableLayerProperties.label);
		});

		it('renders changed layer.opacity', async () => {
			const layer = {
				...createDefaultLayerProperties(), id: 'id0'
			};
			const state = {
				layers: {
					active: [layer],
					background: 'bg0'
				}
			};
			const modifyableLayerProperties = { opacity: .55 };

			const element = await setup(state);
			const layerItem = element.shadowRoot.querySelector('ba-layer-item');

			const slider = layerItem.shadowRoot.querySelector('.opacity-slider');

			expect(slider.value).toBe('100');

			modifyLayer('id0', modifyableLayerProperties);
			expect(store.getState().layers.active[0].opacity).toBe(.55);
			expect(slider.value).toBe('55');
		});

		it('renders changed layer.visible', async () => {
			const layer = {
				...createDefaultLayerProperties(), id: 'id0', visible: false
			};
			const state = {
				layers: {
					active: [layer],
					background: 'bg0'
				}
			};
			const modifyableLayerProperties = { visible: true };

			const element = await setup(state);
			const layerItem = element.shadowRoot.querySelector('ba-layer-item');
			const checkbox = layerItem.shadowRoot.querySelector('ba-checkbox');
			expect(checkbox.checked).toBe(false);

			modifyLayer('id0', modifyableLayerProperties);
			expect(store.getState().layers.active[0].visible).toBe(true);
			expect(checkbox.checked).toBe(true);
		});
	});


});
