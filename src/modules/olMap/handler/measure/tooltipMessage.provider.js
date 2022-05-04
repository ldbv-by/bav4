import { InteractionSnapType, InteractionStateType } from '../../olInteractionUtils';
import { $injector } from '../../../../injection';

export const provide = (interactionState) => {
	const { TranslationService } = $injector.inject('TranslationService');
	const translate = (key) => TranslationService.translate(key);
	if (interactionState.type === InteractionStateType.ACTIVE) {
		return translate('olMap_handler_measure_start');
	}

	if (interactionState.type === InteractionStateType.DRAW) {
		const appendDeleteLastPoint = (message) => {
			if (interactionState.pointCount > 2) {
				return message + '<br/>' + translate('map_olMap_handler_delete_last_point');
			}
			else {
				return message;
			}
		};

		if (interactionState.snap === InteractionSnapType.FIRSTPOINT) {
			return appendDeleteLastPoint(translate('olMap_handler_measure_snap_first_point'));
		}
		if (interactionState.snap === InteractionSnapType.LASTPOINT) {
			return appendDeleteLastPoint(translate('olMap_handler_measure_snap_last_point'));
		}

		return appendDeleteLastPoint(translate('olMap_handler_measure_continue_line'));
	}

	if (interactionState.type === InteractionStateType.MODIFY) {

		if (interactionState.snap === InteractionSnapType.VERTEX) {
			return translate('map_olMap_handler_measure_modify_click_or_drag');
		}
		if (interactionState.snap === InteractionSnapType.EDGE) {
			return translate('map_olMap_handler_measure_modify_click_new_point');
		}
		return translate('map_olMap_handler_measure_modify_key_for_delete');
	}

	if (interactionState.type === InteractionStateType.SELECT) {
		return translate('map_olMap_handler_measure_select');
	}

	if (interactionState.type === InteractionStateType.OVERLAY) {
		return translate('map_olMap_handler_measure_modify_click_drag_overlay');
	}
};
