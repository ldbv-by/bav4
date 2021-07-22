
import { MeasurementOverlay, MeasurementOverlayTypes } from './MeasurementOverlay';
import Overlay from 'ol/Overlay';

import { $injector } from '../../../../../../injection';
import { MeasureSnapType, MeasureStateType } from './OlMeasurementHandler';

export class HelpTooltip {

	constructor() {
		this._overlay = null;
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}

	activate(map) {
		this._map = map;
		this._overlay = this._createOverlay({ offset: [15, 0], positioning: 'center-left' }, MeasurementOverlayTypes.HELP);
		this._map.addOverlay(this._overlay);
	}

	deactivate() {
		if (this._overlay) {
			this._map.removeOverlay(this._overlay);
		}
		this._overlay = null;
		this._map = null;
	}

	notify(measureState) {
		if (!this.active) {
			return;
		}

		const translate = (key) => this._translationService.translate(key);
		let message = null;
		if (measureState.type === MeasureStateType.ACTIVE) {
			message = translate('map_olMap_handler_measure_start');
		}

		if (measureState.type === MeasureStateType.DRAW) {
			message = translate('map_olMap_handler_measure_continue_line');
			if (measureState.snap === MeasureSnapType.FIRSTPOINT) {
				message = translate('map_olMap_handler_measure_snap_first_point');
			}
			if (measureState.snap === MeasureSnapType.LASTPOINT) {
				message = translate('map_olMap_handler_measure_snap_last_point');
			}
			if (measureState.pointCount > 2) {
				message += '<br/>' + translate('map_olMap_handler_delete_last_point');
			}
		}

		if (measureState.type === MeasureStateType.MODIFY) {
			message = translate('map_olMap_handler_measure_modify_key_for_delete');
			if (measureState.snap === MeasureSnapType.VERTEX) {
				message = translate('map_olMap_handler_measure_modify_click_or_drag');
			}
			if (measureState.snap === MeasureSnapType.EDGE) {
				message = translate('map_olMap_handler_measure_modify_click_new_point');
			}
		}

		if (measureState.type === MeasureStateType.SELECT) {
			message = translate('map_olMap_handler_measure_select');
		}

		if (measureState.type === MeasureStateType.OVERLAY) {
			message = translate('map_olMap_handler_measure_modify_click_drag_overlay');
		}

		if (message != null && !measureState.dragging) {
			this._updateOverlay(measureState.coordinate, message);
		}
		else {
			this._hide();
		}

	}

	get active() {
		return this._overlay !== null;
	}

	_createOverlay(overlayOptions = {}, type) {
		const measurementOverlay = document.createElement(MeasurementOverlay.tag);
		measurementOverlay.type = type;
		return new Overlay({ ...overlayOptions, element: measurementOverlay });
	}

	_updateOverlay(coordinate, message) {
		const element = this._overlay.getElement();
		element.value = message;
		this._overlay.setPosition(coordinate);
	}

	_hide() {
		if (this._overlay) {
			this._overlay.setPosition(undefined);
		}
	}

}
