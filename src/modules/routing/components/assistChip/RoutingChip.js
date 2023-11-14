/**
 * @module modules/routing/components/assistChip/RoutingChip
 */
import { RoutingStatusCodes } from '../../../../domain/routing';
import { $injector } from '../../../../injection/index';
import { AbstractAssistChip } from '../../../chips/components/assistChips/AbstractAssistChip';
import routingSvg from '../assets/direction.svg';

const Update_Coordinate = 'update_coordinate';
const Update_Status = 'update_status';

/**
 * An AssistChip to start a routing with a proposal point
 * @class
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
		this._unsubscribeFromStore = this.observe(
			(state) => state.routing.status,
			(status) => this.signal(Update_Status, status)
		);
	}

	update(type, data, model) {
		switch (type) {
			case Update_Coordinate:
				return { ...model, coordinate: [...data] };
			case Update_Status:
				return { ...model, status: data };
		}
	}

	/**
	 * @override
	 */
	getIcon() {
		return routingSvg;
	}

	/**
	 * @override
	 */
	getLabel() {
		const translate = (key) => this._translationService.translate(key);
		return translate('chips_assist_chip_start_routing_here');
	}

	/**
	 * @override
	 */
	isVisible() {
		const { status, coordinate } = this.getModel();
		return status === RoutingStatusCodes.Start_Destination_Missing && coordinate.length === 2;
	}

	/**
	 * @override
	 */
	onClick() {
		const { coordinate } = this.getModel();
		const force2D = (coordinate) => coordinate.slice(0, 2);

		console.warn('waiting for implementation of proposalCoordinate:', force2D(coordinate));
		// TODO: waiting for s-o-s for a routing proposal coordinate
	}

	/**
	 * @override
	 */
	onDisconnect() {
		this._unsubscribeFromStore();
	}

	static get tag() {
		return 'ba-routing-chip';
	}

	set coordinate(value) {
		this.signal(Update_Coordinate, value);
	}
}