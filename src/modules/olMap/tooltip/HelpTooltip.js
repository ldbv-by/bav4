/**
 * @module modules/olMap/tooltip/HelpTooltip
 */
import { BaOverlay, BaOverlayTypes } from '../components/BaOverlay';
import Overlay from 'ol/Overlay';
import { $injector } from '../../../injection';

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
