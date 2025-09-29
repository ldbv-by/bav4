/**
 * @module modules/admin/components/AdminCatalogPublishPanel
 */
import { html, nothing } from 'lit-html';
import { $injector } from '../../../injection';
import { MvuElement } from '../../MvuElement';
import { Environment } from '../services/AdminCatalogService';
import { BA_FORM_ELEMENT_VISITED_CLASS } from '../../../utils/markup';

const Update_Environment = 'update_environment';

/**
 * @class
 * @author herrmutig
 */
export class AdminCatalogPublishPanel extends MvuElement {
	#publishMessage = '';
	#editor = '';

	constructor() {
		super({ environment: Environment.STAGE });

		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
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
			this.#editor = evt.target.value;
		};

		const onPublishMessageChange = (evt) => {
			this._addVisitedClass(evt.target.parentNode);
			this.#publishMessage = evt.target.value;
		};

		const onConfirm = () => {
			const editorElement = this.shadowRoot.getElementById('editor');
			const publishMessageElement = this.shadowRoot.getElementById('publishMessage');

			if (environment === Environment.PRODUCTION) {
				this._addVisitedClass(editorElement.parentNode);
				this._addVisitedClass(publishMessageElement.parentNode);

				//@ts-ignore
				if (!editorElement.reportValidity() || !publishMessageElement.reportValidity()) {
					return;
				}
			}

			this.dispatchEvent(new CustomEvent('confirm'));
		};

		return html`
			<div>
				<div class="ba-form-element">
					<select id="environment" required @change=${onEnvironmentChange}>
						<option value=${Environment.STAGE}>${translate('admin_environment_stage')}</option>
						<option value=${Environment.PRODUCTION}>${translate('admin_environment_production')}</option>
					</select>
					<label for="environment" class="control-label">${translate('admin_modal_publish_title')}</label><i class="bar"></i>
				</div>
				${environment === Environment.PRODUCTION
					? html` <div class="ba-form-element">
								<input id="editor" placeholder=${translate('admin_modal_publish_editor')} value=${this.#editor} required @input=${onEditorChange} />
								<label for="editor" class="control-label">${translate('admin_modal_publish_editor')}</label>
								<label class="error-label">${translate('admin_required_field_error')}</label>
							</div>

							<div class="ba-form-element">
								<input
									id="publishMessage"
									placeholder=${translate('admin_modal_publish_message')}
									value=${this.#publishMessage}
									required
									@input=${onPublishMessageChange}
								/>
								<label for="publishMessage" class="control-label">${translate('admin_modal_publish_message')}</label>
								<label class="error-label">${translate('admin_required_field_error')}</label>
							</div>`
					: nothing}
				<div class="ba-form-element">
					<ba-button id="btn_confirm" .type=${'primary'} .label=${translate('admin_modal_button_publish')} @click=${() => onConfirm()}></ba-button>
				</div>
			</div>
		`;
	}

	_addVisitedClass(element) {
		element.classList.add(BA_FORM_ELEMENT_VISITED_CLASS);
	}

	get environment() {
		return this.getModel().environment;
	}

	static get tag() {
		return 'ba-admin-catalog-publish-panel';
	}
}
