import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import css from './themeToggle.css';
import { toggleSchema } from '../../../../store/media/media.action';
import { MvuElement } from '../../../MvuElement';

const Update_Schema = 'update_schema';

/**
 * Toggles the UI between a light and a dark theme
 * @class
 * @author taulinger
 */
export class ThemeToggle extends MvuElement {
	constructor() {
		super({ darkSchema: false });

		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;

		this.observe(
			(state) => state.media.darkSchema,
			(darkSchema) => this.signal(Update_Schema, darkSchema)
		);
	}

	update(type, data, model) {
		switch (type) {
			case Update_Schema:
				return { ...model, darkSchema: data };
		}
	}

	createView(model) {
		const { darkSchema } = model;
		const titleSuffix = darkSchema ? 'dark' : 'light';
		const title = this._translationService.translate(`uiTheme_toggle_tooltip_${titleSuffix}`);

		return html`
			<style>
				${css}
			</style>
			<ba-toggle .title="${title}" .checked=${darkSchema} @toggle=${toggleSchema}
				><div class="container"><i class="icon adjust"></i></div
			></ba-toggle>
		`;
	}

	static get tag() {
		return 'ba-theme-toggle';
	}
}
