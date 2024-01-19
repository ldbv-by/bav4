/**
 * @module modules/chips/components/assistChips/RoutingChip
 */
import { CoordinateProposalType } from '../../../../domain/routing';
import { $injector } from '../../../../injection/index';
import { reset, setProposal } from '../../../../store/routing/routing.action';
import { AbstractAssistChip } from './AbstractAssistChip';
import routingSvg from './assets/direction.svg';

const Update_Coordinate = 'update_coordinate';

/**
 * An AssistChip to start a routing with a proposal {@link module:domain/coordinateTypeDef~Coordinate}
 * @class
 * @extends {AbstractAssistChip}
 * @property {module:domain/coordinateTypeDef~Coordinate} coordinate the coordinate which should be used as a routing point(start or destination)
 * @author thiloSchlemmer
 */
export class RoutingChip extends AbstractAssistChip {
	constructor() {
		super({
			coordinate: []
		});
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_Coordinate:
				return { ...model, coordinate: [...data] };
		}
	}

	getIcon() {
		return routingSvg;
	}

	getLabel() {
		const translate = (key) => this._translationService.translate(key);
		return translate('chips_assist_chip_start_routing_here');
	}

	isVisible() {
		return true;
	}

	onClick() {
		const { coordinate } = this.getModel();
		reset();
		setProposal(coordinate, CoordinateProposalType.START_OR_DESTINATION);
	}

	static get tag() {
		return 'ba-routing-chip';
	}

	set coordinate(value) {
		this.signal(Update_Coordinate, value);
	}
}
