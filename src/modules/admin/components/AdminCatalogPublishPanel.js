/**
 * @module modules/admin/components/AdminCatalogPublishPanel
 */
import { html, nothing } from 'lit-html';
import { $injector } from '../../../injection';
import { MvuElement } from '../../MvuElement';
import css from './adminCatalogPublishPanel.css?inline';
import { Environment } from '../services/AdminCatalogService';
import { BA_FORM_ELEMENT_VISITED_CLASS } from '../../../utils/markup';
import { emitNotification, LevelTypes } from '../../../store/notifications/notifications.action';

const Update_Environment = 'update_environment';

/**
 * Publishes a provided topic for a topic-catalog
 * @property {Function} onSubmit Initially registers a callback function which will be called when the form was submitted successfully
 * @property {string} topicId The topic id to publish to
 * @class
 * @author herrmutig
 */
export class AdminCatalogPublishPanel extends MvuElement {
	constructor() {
		super({ environment: Environment.STAGE });

		const { AdminCatalogService: adminCatalogService, TranslationService: translationService } = $injector.inject(
			'AdminCatalogService',
			'TranslationService'
		);

		this._adminCatalogService = adminCatalogService;
		this._translationService = translationService;

		this._publishMessage = '';
		this._editor = '';
		this._topicId = '';
		this._warningHint = null;
		this._onSubmit = () => {};
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_Environment:
				return { ...model, environment: data };
		}
	}

	/**
	 *@override
	 */
	createView(model) {
		const translate = (key) => this._translationService.translate(key);
		const environment = model.environment;

		const onEnvironmentChange = (evt) => {
			this.signal(Update_Environment, evt.currentTarget.value);
		};

		const onEditorChange = (evt) => {
			this._addVisitedClass(evt.target.parentNode);
			this._editor = evt.target.value;
		};

		const onPublishMessageChange = (evt) => {
			this._addVisitedClass(evt.target.parentNode);
			this._publishMessage = evt.target.value;
		};

		const onFormSubmit = () => {
			const editorElement = this.shadowRoot.getElementById('editor-input');
			const publishMessageElement = this.shadowRoot.getElementById('publish-message-input');

			if (environment === Environment.PRODUCTION) {
				this._addVisitedClass(editorElement.parentNode);
				this._addVisitedClass(publishMessageElement.parentNode);
				//@ts-ignore
				this._editor = editorElement.value;
				//@ts-ignore
				this._publishMessage = publishMessageElement.value;
				//@ts-ignore
				if (!editorElement.reportValidity() || !publishMessageElement.reportValidity()) {
					return;
				}
			}

			this._publish();
		};

		const getWarningHintHtml = () => {
			if (this._warningHint) {
				return html`<div class="warning-container">
					<span class="warning-icon"></span>
					<span>${this._warningHint}</span>
				</div> `;
			}
			return nothing;
		};

		return html`
			<style>
				${css}
			</style>

			<div>
				${getWarningHintHtml()}
				<div class="ba-form-element">
					<select id="environment-select" required @change=${onEnvironmentChange}>
						<option value=${Environment.STAGE}>${translate('admin_environment_stage')}</option>
						<option value=${Environment.PRODUCTION}>${translate('admin_environment_production')}</option>
					</select>
					<label for="environment-select" class="control-label">${translate('admin_environment')}</label>
				</div>
				${environment === Environment.PRODUCTION
					? html` <div class="ba-form-element">
								<input
									id="editor-input"
									placeholder=${translate('admin_modal_publish_editor')}
									value=${this._editor}
									required
									@input=${onEditorChange}
								/>
								<label for="editor-input" class="control-label">${translate('admin_modal_publish_editor')}</label>
								<label class="error-label">${translate('admin_required_field_error')}</label>
							</div>

							<div class="ba-form-element">
								<input
									id="publish-message-input"
									placeholder=${translate('admin_modal_publish_message')}
									value=${this._publishMessage}
									required
									@input=${onPublishMessageChange}
								/>
								<label for="publish-message-input" class="control-label">${translate('admin_modal_publish_message')}</label>
								<label class="error-label">${translate('admin_required_field_error')}</label>
							</div>`
					: nothing}
				<div class="ba-form-element">
					<ba-button id="confirm-button" .type=${'primary'} .label=${translate('admin_catalog_publish')} @click=${() => onFormSubmit()}></ba-button>
				</div>
			</div>
		`;
	}

	async _publish() {
		const environment = this.getModel().environment;
		const body = environment === Environment.PRODUCTION ? { editor: this._editor, message: this._publishMessage } : {};

		const translate = (key, params) => this._translationService.translate(key, params);
		const translatedEnvironment = translate(`admin_environment_${environment}`);
		try {
			await this._adminCatalogService.publishCatalog(environment, this._topicId, body);
			emitNotification(translate('admin_catalog_published_notification', [translatedEnvironment]), LevelTypes.INFO);
			this._onSubmit();
		} catch (e) {
			console.error(e);
			emitNotification(translate(translate('admin_catalog_publish_failed_notification')), LevelTypes.ERROR);
		}
	}

	_addVisitedClass(element) {
		element.classList.add(BA_FORM_ELEMENT_VISITED_CLASS);
	}

	set warningHint(value) {
		this._warningHint = value;
	}

	set topicId(value) {
		this._topicId = value;
	}

	set onSubmit(callback) {
		this._onSubmit = callback;
	}

	static get tag() {
		return 'ba-admin-catalog-publish-panel';
	}
}
