/**
 * @module modules/auth/components/BvvPlusPasswordCredentialFooter
 */
import { $injector } from '../../../injection/index';
import { MvuElement } from '../../MvuElement';
import css from './bvvpluspasswordcredentialfooter.css';
import { html } from 'lit-html';

/**
 * BVV specific footer component to provide information for login and registration
 * @class
 * @author thiloSchlemmer
 */
export class BvvPlusPasswordCredentialFooter extends MvuElement {
	constructor() {
		super();
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}
	createView() {
		const translate = (key) => this._translationService.translate(key);
		return html`<style>
				${css}
			</style>
			<div class="footer_register">
				${translate('auth_passwordCredentialPanel_footer_register_for_role_prefix')}
				<ba-badge .color=${'var(--text3)'} .background=${'var(--primary-color)'} .label=${'Plus'}></ba-badge>
				${translate('auth_passwordCredentialPanel_footer_register_for_role_suffix')}
				${translate('auth_passwordCredentialPanel_footer_register_information_prefix')}
				<a href="https://www.ldbv.bayern.de/produkte/dienste/bayernatlas.html"
					>${translate('auth_passwordCredentialPanel_footer_register_information')}</a
				>
				${translate('auth_passwordCredentialPanel_footer_register_information_suffix')}
			</div>
			<div class="footer_forgot_login">
				<div>
					<a href="https://geodatenonline.bayern.de/geodatenonline/anwendungen4/kontakt"
						>${translate('auth_passwordCredentialPanel_footer_forgot_login')}</a
					>
				</div>
				<div>
					<a href="https://geodatenonline.bayern.de/geodatenonline/anwendungen4/passwortvergessen"
						>${translate('auth_passwordCredentialPanel_footer_forgot_password')}</a
					>
				</div>
			</div>`;
	}

	static get tag() {
		return 'ba-auth-password-credential-bvv-footer';
	}
}
