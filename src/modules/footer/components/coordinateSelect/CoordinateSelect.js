/**
 * @module modules/footer/components/coordinateSelect/CoordinateSelect
 */
import { html, nothing } from 'lit-html';
import { $injector } from '../../../../injection';
import css from './coordinateSelect.css';
import { MvuElement } from '../../../MvuElement';

const Update_Pointer_Coordinate = 'update_pointer_coordinate';
const Selected_Cr_Changed = 'selected_cr_changed';
/**
 * Dropdown element for displaying the current mouse-over coordinate.
 * @class
 * @author bakir_en
 * @author taulinger
 */
export class CoordinateSelect extends MvuElement {
	constructor() {
		super({
			selectedCr: null,
			pointerPosition: []
		});

		const { CoordinateService, EnvironmentService, MapService, TranslationService } = $injector.inject(
			'CoordinateService',
			'EnvironmentService',
			'MapService',
			'TranslationService'
		);
		this._coordinateService = CoordinateService;
		this._environmentService = EnvironmentService;
		this._mapService = MapService;
		this._translationService = TranslationService;
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_Pointer_Coordinate:
				return { ...model, pointerPosition: [...data] };
			case Selected_Cr_Changed:
				return { ...model, selectedCr: data };
		}
	}

	/**
	 * @override
	 */
	onInitialize() {
		this._items = this._mapService.getCoordinateRepresentations();
		// initially set selected CoordinateRepresentation
		this.signal(Selected_Cr_Changed, this._items[0]);
		this.observe(
			(state) => state.pointer.move,
			(move) => this.signal(Update_Pointer_Coordinate, move.payload.coordinate),
			false
		);
	}

	/**
	 * @override
	 */
	isRenderingSkipped() {
		return this._environmentService.isTouch();
	}

	/**
	 *@override
	 */
	createView(model) {
		const translate = (key) => this._translationService.translate(key);

		const { pointerPosition, selectedCr } = model;

		const getStringifiedCoordinate = () => {
			// the first CoordinateReference returned from MapService#getCoordinateRepresentations() is the current "default" CoordinateReference
			const coordinateRepresentation = this._mapService
				.getCoordinateRepresentations(pointerPosition)
				//the CR must just be of the same group here
				.filter((cr) => cr.group === selectedCr.group)[0];

			return coordinateRepresentation ? this._coordinateService.stringify(pointerPosition, coordinateRepresentation) : ' - ';
		};

		const onChange = (event) => {
			this.signal(
				Selected_Cr_Changed,
				this._items.find((cr) => cr.label === event.target.value)
			);
		};
		return html`
			<style>
				${css}
			</style>
			<div class="coordinate-container">
				<select class="select-coordinate" @change="${onChange}" title="${translate('footer_coordinate_select')}">
					${this._items.map((item) => html`<option class="select-coordinate-option" value="${item.label}">${item.label}</option>`)}
				</select>
				${pointerPosition.length ? html`<div class="coordinate-label">${getStringifiedCoordinate()}</div>` : nothing}
			</div>
		`;
	}

	static get tag() {
		return 'ba-coordinate-select';
	}
}
