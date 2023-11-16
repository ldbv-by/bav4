/**
 * @module modules/routing/components/contextMenu/MenuContent
 */
import { html } from 'lit-html';
import { CoordinateProposalType } from '../../../../domain/routing';
import { $injector } from '../../../../injection/index';
import { removeWaypoint, setDestination, setIntermediate, setStart } from '../../../../store/routing/routing.action';
import { MvuElement } from '../../../MvuElement';
import startIcon from '../assets/start.svg';
import destinationIcon from '../assets/destination.svg';
import intermediateIcon from '../assets/intermediate.svg';
import removeIcon from '../assets/trash.svg';
import css from './menuContent.css';

const Update_Proposal = 'update_proposal';

const Routing_Button_Configs = [
	{
		id: 'start',
		matcher: (proposalType) => proposalType === CoordinateProposalType.START || proposalType === CoordinateProposalType.START_OR_DESTINATION,
		icon: startIcon,
		label: 'map_contextMenuContent_routing_start',
		action: (coordinate) => setStart(coordinate)
	},
	{
		id: 'destination',
		matcher: (proposalType) => proposalType === CoordinateProposalType.DESTINATION || proposalType === CoordinateProposalType.START_OR_DESTINATION,
		icon: destinationIcon,
		label: 'map_contextMenuContent_routing_destination',
		action: (coordinate) => setDestination(coordinate)
	},
	{
		id: 'intermediate',
		matcher: (proposalType) => proposalType === CoordinateProposalType.INTERMEDIATE,
		icon: intermediateIcon,
		label: 'map_contextMenuContent_routing_intermediate',
		action: (coordinate) => setIntermediate(coordinate)
	},
	{
		id: 'remove_existing_waypoint',
		matcher: (proposalType) =>
			proposalType === CoordinateProposalType.EXISTING_INTERMEDIATE || proposalType === CoordinateProposalType.EXISTING_START_OR_DESTINATION,
		icon: removeIcon,
		label: 'map_contextMenuContent_routing_remove_waypoint',
		action: (coordinate) => removeWaypoint(coordinate)
	}
];

/**
 * Renders action buttons based on the current state of
 * the proposal in the 'routing' slice-of-state.
 *
 * @class
 * @author thiloSchlemmer
 */
export class MenuContent extends MvuElement {
	constructor() {
		super({ proposal: null });

		const { TranslationService: translationService } = $injector.inject('TranslationService');
		this._translationService = translationService;
		this._unsubscribe = null;
	}

	onInitialize() {
		this._unsubscribeFromStore = this.observe(
			(state) => state.routing.proposal,
			(proposal) => this.signal(Update_Proposal, proposal)
		);
	}

	onDisconnect() {
		this._unsubscribeFromStore();
	}

	update(type, data, model) {
		switch (type) {
			case Update_Proposal:
				return { ...model, proposal: data.payload };
		}
	}

	createView(model) {
		const { proposal } = model;

		const translate = (key) => this._translationService.translate(key);
		const getButton = (buttonConfig, proposal) => {
			return buttonConfig.matcher(proposal.type)
				? html`<ba-button
						id=${buttonConfig.id}
						.label=${translate(buttonConfig.label)}
						.icon=${buttonConfig.icon}
						.type=${'primary'}
						@click=${buttonConfig.action(proposal.coordinate)}
				  ></ba-button>`
				: null;
		};

		const buttons = [...Routing_Button_Configs.map((buttonConfig) => getButton(buttonConfig, proposal))];
		return html`<style>
				${css}
			</style>
			<div class="container">${buttons}</div>`;
	}

	static get tag() {
		return 'ba-routing-map-menu';
	}
}
