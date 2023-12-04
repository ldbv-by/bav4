/**
 * @module modules/routing/components/assistChip/RoutingChip
 */
import { CoordinateProposalType, RoutingStatusCodes } from '../../../../domain/routing';
import { $injector } from '../../../../injection/index';
import { setProposal } from '../../../../store/routing/routing.action';
import { AbstractAssistChip } from '../../../chips/components/assistChips/AbstractAssistChip';
import routingSvg from '../assets/direction.svg';

const Update_Coordinate = 'update_coordinate';
const Update_Status = 'update_status';

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
			coordinate: [],
			status: null
		});
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}

	onInitialize() {
		this._unsubscribeFromStore = this.observe(
			(state) => state.routing.status,
			(status) => this.signal(Update_Status, status)
		);
	}

	onDisconnect() {
		this._unsubscribeFromStore();
	}

	update(type, data, model) {
		switch (type) {
			case Update_Coordinate:
				return { ...model, coordinate: [...data] };
			case Update_Status:
				return { ...model, status: data };
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
		const { status, coordinate } = this.getModel();
		return status === RoutingStatusCodes.Start_Destination_Missing && coordinate.length === 2;
	}

	onClick() {
		const { coordinate } = this.getModel();
		setProposal(coordinate, CoordinateProposalType.START_OR_DESTINATION);
	}

	static get tag() {
		return 'ba-routing-chip';
	}

	set coordinate(value) {
		this.signal(Update_Coordinate, value);
	}
}
