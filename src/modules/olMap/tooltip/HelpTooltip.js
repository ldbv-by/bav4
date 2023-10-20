/**
 * @module modules/olMap/tooltip/HelpTooltip
 */
import { BaOverlay, BaOverlayTypes } from '../components/BaOverlay';
import Overlay from 'ol/Overlay';
import { $injector } from '../../../injection';

/**
 * A function that returns the message for the tooltip
 * @param {module:modules/olMap/tooltip/HelpTooltip~InteractionState} interactionState
 * @typedef {Function} tooltipMessageProviderFunction
 * @returns {String|null} the message for the tooltip
 */

/**
 * Defines the state at the moment a user interaction event occurred.
 * The object may contain further use-case-specific properties (we should put them to a separate field (e.g `properties`) eventually)
 * @typedef {Object} InteractionState
 * @property {module:domain/coordinateTypeDef~Coordinate} coordinate coordinate (in the map SRID) of the current event
 * @property {boolean} dragging `true` if the current event is a dragging event
 */

export class HelpTooltip {
	constructor() {
		this._overlay = null;
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
		this._tooltipMessageProvideFunction = () => null;
	}

	activate(map) {
		this._map = map;
		this._overlay = this._createOverlay({ offset: [15, 0], positioning: 'center-left' }, BaOverlayTypes.HELP);
		this._map.addOverlay(this._overlay);
	}

	deactivate() {
		if (this._overlay) {
			this._map.removeOverlay(this._overlay);
		}
		this._overlay = null;
		this._map = null;
	}

	notify(interactionState) {
		if (!this.active) {
			return;
		}

		const message = this._tooltipMessageProvideFunction(interactionState);

		if (message != null && !interactionState.dragging) {
			this._updateOverlay(interactionState.coordinate, message);
		} else {
			this._hide();
		}
	}

	get active() {
		return this._overlay !== null;
	}

	set messageProvideFunction(value) {
		this._tooltipMessageProvideFunction = value;
	}

	get messageProvideFunction() {
		return this._tooltipMessageProvideFunction;
	}

	_createOverlay(overlayOptions = {}, type) {
		const overlay = document.createElement(BaOverlay.tag);
		overlay.type = type;
		return new Overlay({ ...overlayOptions, element: overlay });
	}

	_updateOverlay(coordinate, message) {
		const element = this._overlay.getElement();
		element.value = message;
		this._overlay.setPosition(coordinate);
	}

	_hide() {
		this._overlay.setPosition(undefined);
	}
}
