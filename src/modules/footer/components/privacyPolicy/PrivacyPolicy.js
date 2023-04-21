/**
 * @module modules/footer/components/privacyPolicy/PrivacyPolicy
 */
import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import css from './privacyPolicy.css';

/**
 * Displays the privacy policy.
 * @class
 * @author alsturm
 */
export class PrivacyPolicy extends MvuElement {
	constructor() {
		super();
		const { TranslationService: translationService } = $injector.inject('TranslationService');
		this._translationService = translationService;
	}

	createView() {
		const translate = (key) => this._translationService.translate(key);

		return html`
			<style>
				${css}
			</style>
			<div class="privacy_policy-container">
				<a
					class="privacy-policy-link"
					title="${translate('footer_privacy_policy_link')}"
					href="${translate('global_privacy_policy_url')}"
					target="_blank"
					>${translate('footer_privacy_policy_link')}</a
				>
			</div>
		`;
	}

	static get tag() {
		return 'ba-privacy-policy';
	}
}
