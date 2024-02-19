/**
 * @module modules/routing/components/contextMenu/ProposalContextContent
 */
import { html } from 'lit-html';
import { CoordinateProposalType } from '../../../../domain/routing';
import { $injector } from '../../../../injection/index';
import { removeWaypoint, setDestination, setIntermediate, setStart } from '../../../../store/routing/routing.action';
import { MvuElement } from '../../../MvuElement';
import css from './proposalContextContent.css';
import { closeBottomSheet } from '../../../../store/bottomSheet/bottomSheet.action';
import { closeContextMenu } from '../../../../store/mapContextMenu/mapContextMenu.action';

const Update_Proposal = 'update_proposal';
const Update_Prevent_Close = 'update_prevent_close';

const Routing_Button_Configs = [
	{
		id: 'start',
		matcher: (proposalType) => proposalType === CoordinateProposalType.START || proposalType === CoordinateProposalType.START_OR_DESTINATION,
		label: 'routing_contextContent_start',
		action: (coordinate) => setStart(coordinate)
	},
	{
		id: 'destination',
		matcher: (proposalType) => proposalType === CoordinateProposalType.DESTINATION || proposalType === CoordinateProposalType.START_OR_DESTINATION,
		label: 'routing_contextContent_destination',
		action: (coordinate) => setDestination(coordinate)
	},
	{
		id: 'intermediate',
		matcher: (proposalType) => proposalType === CoordinateProposalType.INTERMEDIATE,
		label: 'routing_contextContent_intermediate',
		action: (coordinate) => setIntermediate(coordinate)
	},
	{
		id: 'remove',
		matcher: (proposalType) =>
			proposalType === CoordinateProposalType.EXISTING_INTERMEDIATE || proposalType === CoordinateProposalType.EXISTING_START_OR_DESTINATION,
		label: 'routing_contextContent_remove_waypoint',
		action: (coordinate) => removeWaypoint(coordinate)
	}
];

/**
 * Renders action-buttons based on the current state of
 * the proposal in the 'routing' slice-of-state.
 *
 * @class
 * @property {boolean} preventClose=false Whether the component should trigger {@link module:store/mapContextMenu/mapContextMenu_action~closeContextMenu} or {@link module:store/bottomSheet/bottomSheet_action~closeBottomSheet} after an button in this component is clicked or not
 * @author thiloSchlemmer
 */
export class ProposalContextContent extends MvuElement {
	constructor() {
		super({ proposal: null, preventClose: false });

		const { TranslationService: translationService } = $injector.inject('TranslationService');
		this._translationService = translationService;
	}

	onInitialize() {
		this.observe(
			(state) => state.routing.proposal,
			(proposal) => this.signal(Update_Proposal, proposal)
		);
	}

	update(type, data, model) {
		switch (type) {
			case Update_Proposal:
				return { ...model, proposal: data?.payload };
			case Update_Prevent_Close:
				return { ...model, preventClose: data };
		}
	}

	createView(model) {
		const { proposal, preventClose } = model;

		const translate = (key) => this._translationService.translate(key);

		const onClick = (proposalAction) => {
			const closeAfterAction = !preventClose;

			proposalAction(proposal.coord);
			if (closeAfterAction) {
				closeBottomSheet();
				closeContextMenu();
			}
		};

		const getButton = (buttonConfig, proposal) => {
			return buttonConfig.matcher(proposal.type)
				? html`<button id=${buttonConfig.id} @click=${() => onClick(buttonConfig.action)}>
						<span class="icon ${buttonConfig.id}"></span>
						<span class="text">${translate(buttonConfig.label)}</span>
					</button>`
				: null;
		};

		const buttons = proposal ? [...Routing_Button_Configs.map((buttonConfig) => getButton(buttonConfig, proposal))] : [];
		return html`<style>
				${css}
			</style>
			<div class="container">${buttons}</div>`;
	}

	set preventClose(value) {
		this.signal(Update_Prevent_Close, value);
	}

	static get tag() {
		return 'ba-proposal-context-content';
	}
}
