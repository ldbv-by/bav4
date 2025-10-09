/**
 * @module modules/oaf/components/OafFilterGroup
 */

import { html } from 'lit-html';
import { MvuElement } from '../../MvuElement';
import { oafFiltersToCqlExpressionGroup, createDefaultOafFilter } from '../utils/oafUtils';
import css from './oafFilterGroup.css';
import { $injector } from '../../../injection';
import closeSvg from '../../../assets/icons/x-square.svg';
import cloneSvg from './assets/clone.svg';
import editSvg from './assets/edit.svg';
import { repeat } from 'lit-html/directives/repeat.js';
import { nothing } from '../../../../node_modules/lit-html/lit-html';

const Update_Queryables = 'update_queryables';
const Update_Filters = 'update_filters';
const Update_Expression = 'update_expression';
const Update_Is_Muted = 'update_is_muted';

/**
 * A Container for OGC Feature API specific filters that are "AND" connected with each other
 *
 * @property {Array<Object>} oafFilters The Collection of filters that were added onto this group
 * @property {Array<OafQueryable>} queryables The OafQueryable to create oafFilters for this group
 *
 * @fires change Fires when this component or one of it's filters changes
 * @fires remove Fires when the filter group informs it's parent that it wants to be removed
 *
 * @class
 * @author herrmutig
 */
export class OafFilterGroup extends MvuElement {
	#translationService;

	constructor() {
		super({
			queryables: [],
			oafFilters: [],
			expression: '',
			isMuted: false
		});

		const { TranslationService: translationService } = $injector.inject('TranslationService');
		this.#translationService = translationService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_Queryables:
				return { ...model, queryables: [...data] };
			case Update_Filters:
				return { ...model, oafFilters: [...data] };
			case Update_Expression:
				return { ...model, expression: data };
			case Update_Is_Muted:
				return { ...model, isMuted: data === true };
		}
	}

	createView(model) {
		const translate = (key) => this.#translationService.translate(key);
		const { queryables, oafFilters, isMuted } = model;

		const onAddFilter = (evt) => {
			this._addFilter(evt.target.value);
			// Resets select to "Choose Filter..." Option
			evt.target.selectedIndex = 0;
			evt.target.blur();
		};

		const onFilterChanged = (evt) => {
			const changedOafFilter = evt.target;
			const filters = this.oafFilters;
			const changedFilterIndex = filters.findIndex((oafFilter) => oafFilter.queryable.id === evt.target.queryable.id);

			filters[changedFilterIndex] = {
				...changedOafFilter.getModel()
			};

			this.signal(Update_Expression, oafFiltersToCqlExpressionGroup(filters));
			this.signal(Update_Filters, filters);
			this.dispatchEvent(new CustomEvent('change'));
		};

		const onEditExpression = () => {
			/*this.signal(Update_Show_Cql_Edit, !showCqlEdit);
			
			try {
				const parsedFilterGroups = this.#parserService.parse(expression, queryables);
				console.log('Signal can show graphics');
				this.signal(Update_Display_Filter, true);
			} catch {
				console.log('Signal can showText only');
				this.signal(Update_Display_Filter, false);
			}
			this.dispatchEvent(new CustomEvent('change')); */
		};

		const onRemoveFilter = (evt) => {
			this._removeFilter(evt.target.queryable.id);
		};

		const onRemoveGroup = () => {
			this.dispatchEvent(new CustomEvent('remove'));
		};

		const onDuplicateGroup = () => {
			this.dispatchEvent(new CustomEvent('duplicate'));
		};

		const onToggleMute = () => {
			this.signal(Update_Is_Muted, !isMuted);
			this.dispatchEvent(new CustomEvent('change'));
		};

		return html`
			<style>
				${css}
			</style>
			<div class="filter-group ${isMuted ? 'muted' : ''}" part="filter-group">
				<div class="select-container" part="select-container">
					<div class="ba-form-element" part="form-element">
						<select id="queryable-select" required="" @change=${onAddFilter}>
							<option selected></option>
							${queryables
								.filter((queryable) => !oafFilters.find((oafFilter) => oafFilter.queryable.id === queryable.id))
								.map((queryable) => {
									const description = queryable.description ?? nothing;
									return html`<option title=${description} .value=${queryable.id}>${queryable.title ? queryable.title : queryable.id}</option>`;
								})}
						</select>
						<label id="queryable-label" for="select" class="control-label">${translate('oaf_group_select_filter')}</label><i class="bar"></i>
					</div>
				</div>
				<div class="filter-container" part="filter-container">
					${repeat(
						oafFilters,
						(oafFilter) => oafFilter.queryable.id,
						(oafFilter) => html`
							<ba-oaf-filter
								.operator=${oafFilter.operator}
								.value=${oafFilter.value}
								.maxValue=${oafFilter.maxValue}
								.minValue=${oafFilter.minValue}
								.queryable=${oafFilter.queryable}
								@change=${onFilterChanged}
								@remove=${onRemoveFilter}
							></ba-oaf-filter>
						`
					)}
				</div>
				<div class="toolbar-container" part="toolbar-container">
					<ba-checkbox id="checkbox-mute-cql" .type=${'eye'} tabindex="0" .checked=${!isMuted} @toggle=${onToggleMute}></ba-checkbox>
					<ba-icon id="btn-edit-cql" .type=${'primary'} .size=${1.5} class="toolbar-button" .icon=${editSvg} @click=${onEditExpression}></ba-icon>
					<ba-icon id="btn-duplicate" .type=${'primary'} .size=${2.5} class="toolbar-button" .icon=${cloneSvg} @click=${onDuplicateGroup}></ba-icon>
					<ba-icon id="btn-remove" .size=${1.6} .type=${'primary'} class="toolbar-button" .icon=${closeSvg} @click=${onRemoveGroup}></ba-icon>
				</div>
			</div>
		`;
	}

	_addFilter(queryableId) {
		const { queryables, oafFilters } = this.getModel();
		const queryableToAdd = queryables.find((queryable) => queryable.id === queryableId);

		if (queryableToAdd === undefined) {
			return;
		}

		const filters = [
			...oafFilters,
			{
				...createDefaultOafFilter(),
				queryable: queryableToAdd
			}
		];

		// A newly created filter will invoke a change event initially (see oafFilter.js, onInitialize())
		this.signal(Update_Filters, filters);
		this.signal(Update_Expression, oafFiltersToCqlExpressionGroup(filters));
		this.dispatchEvent(new CustomEvent('change'));
	}

	_removeFilter(queryableId) {
		const filters = this.getModel().oafFilters.filter((oafFilter) => oafFilter.queryable.id !== queryableId);
		this.signal(Update_Filters, filters);
		this.signal(Update_Expression, oafFiltersToCqlExpressionGroup(filters));
		this.dispatchEvent(new CustomEvent('change'));
	}

	get expression() {
		const { isMuted, expression } = this.getModel();
		return isMuted ? '' : expression;
	}

	set expression(value) {
		this.signal(Update_Expression, value);
	}

	set queryables(value) {
		this.signal(Update_Queryables, value);
	}

	set oafFilters(value) {
		this.signal(Update_Filters, value);
	}

	get oafFilters() {
		return this.getModel().oafFilters;
	}

	static get tag() {
		return 'ba-oaf-filter-group';
	}
}
