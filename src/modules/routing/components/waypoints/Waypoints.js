/**
 * @module modules/routing/components/waypoints/Waypoints
 */
import { html, nothing } from '../../../../../node_modules/lit-html/lit-html';
import { repeat } from 'lit-html/directives/repeat.js';
import { RoutingStatusCodes } from '../../../../domain/routing';
import { $injector } from '../../../../injection/index';
import { MvuElement } from '../../../MvuElement';
import css from './waypoints.css';
import { setDestination, setStart, setWaypoints } from '../../../../store/routing/routing.action';
import { getPlaceholder, isDraggable, isPlaceholder } from './WaypointItem';
import arrowDownUpSvg from '../assets/arrow-down-up.svg';

const Update_Status = 'update_status';
const Update_Waypoints = 'update_waypoints';
const Update_Dragged_Item = 'update_dragged_item';

export class Waypoints extends MvuElement {
	constructor() {
		super({ status: null, waypoints: [], draggedItem: null });
		const { TranslationService, EnvironmentService } = $injector.inject('TranslationService', 'EnvironmentService');
		this._translationService = TranslationService;
		this._environmentService = EnvironmentService;
		this._storeSubscriptions = [];
	}

	onInitialize() {
		this._storeSubscriptions = [
			this.observe(
				(store) => store.routing.status,
				(status) => this.signal(Update_Status, status)
			),

			this.observe(
				(store) => store.routing.waypoints,
				(waypoints) => this.signal(Update_Waypoints, waypoints)
			)
		];
	}

	onDisconnect() {
		while (this._storeSubscriptions.length > 0) {
			this._storeSubscriptions.shift()();
		}
	}

	update(type, data, model) {
		switch (type) {
			case Update_Status:
				return { ...model, status: data };
			case Update_Waypoints:
				return {
					...model,
					waypoints: [...data]
				};
			case Update_Dragged_Item:
				return { ...model, draggedItem: data };
		}
	}

	createView(model) {
		const { status } = model;
		const isVisible = status === RoutingStatusCodes.Ok;

		const buttons = this._getButtons(model);
		const waypointItems = this._getWaypoints(model);
		return isVisible
			? html`<style>
						${css}
					</style>
					<div class="container">
						<div class="overflow-container">
							<ul class="waypoints">
								${waypointItems}
							</ul>
						</div>
						${buttons}
					</div>`
			: nothing;
	}

	_getButtons(model) {
		const translate = (key) => this._translationService.translate(key);
		const { waypoints } = model;

		const reverse = () => {
			setWaypoints([...waypoints].reverse());
		};

		return waypoints.length > 0
			? html`<div class="waypoints__actions">
					<ba-icon
						id="button_reverse"
						.icon="${arrowDownUpSvg}"
						.size=${1.5}
						.title=${translate('routing_waypoints_reverse')}
						@click=${reverse}
					></ba-icon>
			  </div>`
			: nothing;
	}

	_getWaypoints(model) {
		const { waypoints, draggedItem } = model;
		const translate = (key) => this._translationService.translate(key);
		const draggableItems = this._createDraggableItems(waypoints);

		const isNeighbor = (index, otherIndex) => {
			return index === otherIndex || index - 1 === otherIndex || index + 1 === otherIndex;
		};

		const isValidDropTarget = (draggedItem, dropItemCandidate) => {
			return isPlaceholder(dropItemCandidate) && !isNeighbor(dropItemCandidate.listIndex, draggedItem.listIndex);
		};

		const createPlaceholderElement = (waypoint) => {
			return html`<div id=${'placeholder_' + waypoint.listIndex} class="placeholder"></div>`;
		};

		const createIndexNumberForPlaceholder = (listIndex, waypoint) => {
			const isHigherThenDrag = waypoint.listIndex >= listIndex ? 1 : 0;
			return listIndex / 2 + isHigherThenDrag;
		};

		const createOptionalFlag = (listIndex) => {
			return listIndex === 0
				? ` - ${translate('routing_waypoints_as_start')}`
				: listIndex / 2 === waypoints.length
				  ? ` - ${translate('routing_waypoints_as_destination')}`
				  : '';
		};

		const onDragStart = (e, waypoint) => {
			if (this._environmentService.isTouch()) {
				return;
			}

			this.signal(Update_Dragged_Item, waypoint);

			e.target.classList.add('isdragged');
			e.dataTransfer.dropEffect = 'move';
			e.dataTransfer.effectAllowed = 'move';
			this.shadowRoot.querySelectorAll('.placeholder').forEach((p) => {
				const listIndex = Number.parseFloat(p.id.replace('placeholder_', ''));
				p.innerHTML = `${createIndexNumberForPlaceholder(listIndex, waypoint)}${createOptionalFlag(listIndex)}`;
				if (!isNeighbor(listIndex, waypoint.listIndex)) {
					p.classList.add('placeholder-active');
				}
			});
		};
		const onDragEnd = (e) => {
			e.target.classList.remove('isdragged');
			e.preventDefault();
			this.shadowRoot.querySelectorAll('.placeholder').forEach((p) => p.classList.remove('placeholder-active'));
		};

		const onDrop = (e, waypointItem) => {
			const getNewIndex = (oldIndex) => (oldIndex === this._waypointCount - 1 ? oldIndex - 1 : oldIndex);

			if (isPlaceholder(waypointItem) && draggedItem) {
				this._moveWaypoint(draggedItem.index, getNewIndex(waypointItem.index));
			}
			e.target.classList.remove('over');

			this.signal(Update_Dragged_Item, false);
		};
		const onDragOver = (e, waypointItem) => {
			e.preventDefault();
			const defaultDropEffect = 'none';

			const getDropEffectFor = (draggedItem) => {
				return isValidDropTarget(draggedItem, waypointItem) ? 'all' : defaultDropEffect;
			};

			e.dataTransfer.dropEffect = draggedItem ? getDropEffectFor(draggedItem) : defaultDropEffect;
		};

		const onDragEnter = (e, waypointItem) => {
			const doNothing = () => {};
			const addClassName = () => (isValidDropTarget(draggedItem, waypointItem) ? e.target.classList.add('over') : doNothing());
			const dragEnterAction = draggedItem ? addClassName : doNothing;
			dragEnterAction();
		};

		const onDragLeave = (e) => {
			e.stopPropagation();
			e.target.classList.remove('over');
		};
		return html`${repeat(
			draggableItems,
			(draggableItem) => draggableItem.listIndex,
			(draggableItem, index) =>
				html` <li
					draggable=${isDraggable(draggableItem)}
					@dragstart=${(e) => onDragStart(e, draggableItem)}
					@dragend=${onDragEnd}
					@drop=${(e) => onDrop(e, draggableItem)}
					@dragover=${(e) => onDragOver(e, draggableItem)}
					@dragenter=${(e) => onDragEnter(e, draggableItem)}
					@dragleave=${onDragLeave}
					index=${index}
					class="draggable waypoint"
				>
					${isPlaceholder(draggableItem) ? createPlaceholderElement(draggableItem) : this._createWaypointElement(draggableItem)}
				</li>`
		)}`;
	}

	_moveWaypoint(from, to) {
		const { waypoints } = this.getModel();
		const waypoint = waypoints[from];

		setWaypoints(waypoints.toSpliced(from, 1).toSpliced(to, 0, waypoint));
	}

	_removeWaypoint(waypoint) {
		const { waypoints } = this.getModel();
		const cleanedWaypoints = waypoints.toSpliced(waypoint.index, 1);
		const getRemoveAction = (waypoint) => {
			if (waypoints.length === 2 && waypoint.isStart) {
				return () => setDestination(cleanedWaypoints[0]);
			}
			if (waypoints.length === 2 && waypoint.isDestination) {
				return () => setStart(cleanedWaypoints[0]);
			}
			return () => setWaypoints(cleanedWaypoints);
		};

		const removeAction = getRemoveAction(waypoint);
		removeAction();
	}

	_createDraggableItems(waypoints) {
		const draggableItems = [getPlaceholder(0, 0)];
		this._waypointCount = waypoints.length;

		for (let waypointIndex = 0, listIndex = 0; waypointIndex < waypoints.length; waypointIndex++) {
			const waypointOption = {
				index: waypointIndex,
				listIndex: listIndex + 1,
				point: waypoints[waypointIndex],
				isStart: waypointIndex === 0,
				isDestination: waypointIndex === waypoints.length - 1
			};
			draggableItems.push(waypointOption);
			draggableItems.push(getPlaceholder(waypointIndex + 1, listIndex + 2));
			listIndex += 2;
		}
		return draggableItems;
	}

	_createWaypointElement(waypoint) {
		const increaseIndex = (waypoint) => {
			this._moveWaypoint(waypoint.index, waypoint.index + 1);
		};

		const decreaseIndex = (waypoint) => {
			if (0 < waypoint.index) {
				this._moveWaypoint(waypoint.index, waypoint.index - 1);
			}
		};

		const remove = (waypoint) => {
			this._removeWaypoint(waypoint);
		};
		return html`<ba-routing-waypoint-item
			.waypoint=${waypoint}
			@increase=${(e) => increaseIndex(e.detail.waypoint)}
			@decrease=${(e) => decreaseIndex(e.detail.waypoint)}
			@remove=${(e) => remove(e.detail.waypoint)}
			data-test-id
		>
		</ba-routing-waypoint-item> `;
	}

	static get tag() {
		return 'ba-routing-waypoints';
	}
}
