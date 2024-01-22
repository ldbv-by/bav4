/**
 * @module modules/map/components/geolocationButton/GeolocationButton
 */
import { html } from 'lit-html';

import { $injector } from '../../../../injection';
import css from './geolocationButton.css';
import { classMap } from 'lit-html/directives/class-map.js';
import { activate, deactivate } from '../../../../store/geolocation/geolocation.action';
import { MvuElement } from '../../../MvuElement';

const Update_Active = 'update_active';
const Update_Denied = 'update_denied';

/**
 * Button that activates-deactivates geolocation
 * @class
 * @author thiloSchlemmer
 */

export class GeolocationButton extends MvuElement {
	constructor() {
		super({ active: false, denied: false });
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}

	onInitialize() {
		this.observe(
			(store) => store.geolocation.active,
			(active) => this.signal(Update_Active, active)
		),
			this.observe(
				(store) => store.geolocation.denied,
				(denied) => this.signal(Update_Denied, denied)
			);
	}

	update(type, data, model) {
		switch (type) {
			case Update_Active:
				return { ...model, active: data };
			case Update_Denied:
				return { ...model, denied: data };
		}
	}

	createView(model) {
		const { active, denied } = model;
		const translate = (key) => this._translationService.translate(key);
		const onClick = () => {
			if (active) {
				deactivate();
			} else {
				activate();
			}
		};

		const getTitle = () => {
			if (active) {
				return translate('map_geolocationButton_title_deactivate');
			}
			if (denied) {
				return translate('map_geolocationButton_title_denied');
			}
			return translate('map_geolocationButton_title_activate');
		};

		const classes = {
			inactive: !active,
			active: active,
			denied: denied
		};
		return html`
			<style>
				${css}
			</style>
			<div class="geolocation">
				<button class="geolocation-button ${classMap(classes)}" @click=${onClick} title=${getTitle()}>
					<i class="icon geolocation-icon"></i>
				</button>
			</div>
		`;
	}
	static get tag() {
		return 'ba-geolocation-button';
	}
}
