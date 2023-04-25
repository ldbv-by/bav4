import { $injector } from '../../../../../src/injection';
import { FeedbackType, ToggleFeedbackPanel } from '../../../../../src/modules/feedback/components/toggleFeedback/ToggleFeedbackPanel';
import { TestUtils } from '../../../../test-utils';

window.customElements.define(ToggleFeedbackPanel.tag, ToggleFeedbackPanel);

const setup = (state = {}) => {
	const initialState = {
		...state
	};

	TestUtils.setupStoreAndDi(initialState);

	$injector.registerSingleton('TranslationService', { translate: (key) => key });

	return TestUtils.renderAndLogLifecycle(ToggleFeedbackPanel.tag);
};

describe('MapFeedbackPanel', () => {
	describe('constructor', () => {
		it('sets a default model', async () => {
			setup();
			const element = new ToggleFeedbackPanel();

			expect(element.getModel()).toEqual({
				selectedFeedbackPanel: FeedbackType.NONE
			});
		});
	});

	describe('when initialized', () => {
		it('renders the view', async () => {
			// arrange
			const expectedTitle = 'feedback_toggleFeedback_header';
			const expectedMapButton = 'feedback_toggleFeedback_mapButton';
			const expectedGeneralButton = 'feedback_toggleFeedback_generalButton';

			const element = await setup();

			// assert
			expect(element.shadowRoot.children.length).toBe(7);
			expect(element.shadowRoot.querySelector('#toggleFeedbackPanelTitle').textContent).toBe(expectedTitle);
			expect(element.shadowRoot.querySelector('#selectFeedbackMapButton').label).toBe(expectedMapButton);
			expect(element.shadowRoot.querySelector('#selectFeedbackGeneralButton').label).toBe(expectedGeneralButton);
		});

		// 	it('renders form elements containing correct attributes', async () => {
		// 		// arrange
		// 		const element = await setup();

		// 		const categoryElement = element.shadowRoot.querySelector('#category');
		// 		const descriptionElement = element.shadowRoot.querySelector('#description');
		// 		const emailElement = element.shadowRoot.querySelector('#email');

		// 		// assert
		// 		expect(categoryElement.type).toBe('select-one');
		// 		expect(categoryElement.hasAttribute('required')).toBeTrue;
		// 		expect(categoryElement.hasAttribute('placeholder')).toBeTrue;
		// 		expect(categoryElement.parentElement.querySelector('label').innerText).toBe('mapFeedback_categorySelection');

		// 		expect(descriptionElement.type).toBe('textarea');
		// 		expect(descriptionElement.hasAttribute('required')).toBeTrue;
		// 		expect(descriptionElement.hasAttribute('placeholder')).toBeTrue;
		// 		expect(descriptionElement.parentElement.querySelector('label').innerText).toBe('mapFeedback_changeDescription');

		// 		expect(emailElement.type).toBe('email');
		// 		expect(emailElement.hasAttribute('placeholder')).toBeTrue;
		// 		expect(emailElement.parentElement.querySelector('label').innerText).toBe('mapFeedback_eMail');
		// 		expect(descriptionElement.hasAttribute('placeholder')).toBeFalse;
		// 	});

		// 	it('renders a privacy policy disclaimer', async () => {
		// 		const element = await setup();

		// 		expect(element.shadowRoot.querySelector('#mapFeedback_disclaimer').innerText).toContain('mapFeedback_disclaimer');
		// 		expect(element.shadowRoot.querySelector('#mapFeedback_disclaimer a').href).toContain('global_privacy_policy_url');
		// 		expect(element.shadowRoot.querySelector('#mapFeedback_disclaimer a').innerText).toBe('mapFeedback_privacyPolicy');
		// 	});

		// 	it('creates an iframeObserver', async () => {
		// 		const element = await setup();

		// 		expect(element._iframeObserver).toEqual(jasmine.any(MutationObserver));
		// 	});

		// 	it('calls shareService for iframe-source', async () => {
		// 		const encodeSpy = spyOn(shareServiceMock, 'encodeState').and.callThrough();
		// 		await setup();

		// 		expect(encodeSpy).toHaveBeenCalledWith({ ifc: [IFrameComponents.DRAW_TOOL], l: jasmine.any(String) }, [PathParameters.EMBED]);
		// 	});

		// 	it('listen to iframe-attribute changes', async () => {
		// 		const fileId = 'f_foo';
		// 		const element = await setup();

		// 		const updateFileIdSpy = spyOn(element, '_updateFileId').and.callThrough();
		// 		expect(element._iframeObserver).toEqual(jasmine.any(MutationObserver));

		// 		const iframe = element.shadowRoot.querySelector('iframe');
		// 		iframe.setAttribute(IFRAME_GEOMETRY_REFERENCE_ID, fileId);
		// 		await TestUtils.timeout();

		// 		expect(element.getModel().mapFeedback.fileId).toBe(fileId);

		// 		// no calls by changes on any other attribute
		// 		iframe.setAttribute(IFRAME_ENCODED_STATE, 'foo');

		// 		await TestUtils.timeout();

		// 		expect(updateFileIdSpy).toHaveBeenCalledTimes(1);
		// 	});
	});

	// describe('when using FeedbackService', () => {
	// 	it('logs an error when getCategories fails', async () => {
	// 		// arrange
	// 		const message = 'error message';
	// 		const getMapFeedbackSpy = spyOn(feedbackServiceMock, 'getCategories').and.rejectWith(new Error(message));
	// 		const errorSpy = spyOn(console, 'error');
	// 		const element = await setup();

	// 		// act
	// 		await element._getCategoryOptions();

	// 		// assert
	// 		expect(getMapFeedbackSpy).toHaveBeenCalled();
	// 		expect(errorSpy).toHaveBeenCalledWith(new Error(message));
	// 	});

	// 	it('logs an error when save fails', async () => {
	// 		// arrange
	// 		const message = 'error message';
	// 		const mapFeedbackSaveSpy = spyOn(feedbackServiceMock, 'save').and.rejectWith(new Error(message));
	// 		const errorSpy = spyOn(console, 'error');
	// 		const element = await setup();

	// 		// act
	// 		await element._saveMapFeedback('', '', '');

	// 		// assert
	// 		expect(mapFeedbackSaveSpy).toHaveBeenCalled();
	// 		expect(errorSpy).toHaveBeenCalledWith(new Error(message));

	// 		expect(store.getState().notifications.latest.payload.content).toBe('mapFeedback_could_not_save');
	// 		expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
	// 	});

	// 	it('emits a success notification if save succeeds', async () => {
	// 		// arrange
	// 		const mapFeedbackSaveSpy = spyOn(feedbackServiceMock, 'save').and.resolveTo(true);
	// 		const element = await setup();

	// 		// act
	// 		await element._saveMapFeedback('', '', '');

	// 		// assert
	// 		expect(mapFeedbackSaveSpy).toHaveBeenCalled();

	// 		expect(store.getState().notifications.latest.payload.content).toBe('mapFeedback_saved_successfully');
	// 		expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
	// 	});

	// 	it('calls FeedbackService.getCategories()', async () => {
	// 		// arrange
	// 		const getMapFeedbackSpy = spyOn(feedbackServiceMock, 'getCategories');
	// 		const element = await setup();

	// 		// act
	// 		await element._getCategoryOptions();

	// 		// assert
	// 		expect(getMapFeedbackSpy).toHaveBeenCalled();
	// 	});
	// });

	// describe('when submit is pressed', () => {
	// 	it('does not call FeedbackService.save if required fields are not filled', async () => {
	// 		// arrange
	// 		const element = await setup();
	// 		const saveMapFeedbackSpy = spyOn(feedbackServiceMock, 'save');

	// 		// act
	// 		const submitButton = element.shadowRoot.querySelector('#button0');
	// 		submitButton.click();

	// 		expect(saveMapFeedbackSpy).not.toHaveBeenCalled();
	// 	});

	// 	it('does not call FeedbackService.save if geometry is not set', async () => {
	// 		// arrange
	// 		const element = await setup();
	// 		const saveMapFeedbackSpy = spyOn(feedbackServiceMock, 'save');

	// 		// act
	// 		const submitButton = element.shadowRoot.querySelector('#button0');
	// 		submitButton.click();

	// 		expect(saveMapFeedbackSpy).not.toHaveBeenCalled();
	// 	});

	// 	it('does not call FeedbackService.save if category is not valid', async () => {
	// 		// arrange
	// 		const element = await setup();
	// 		const saveMapFeedbackSpy = spyOn(feedbackServiceMock, 'save');

	// 		const descriptionInput = element.shadowRoot.querySelector('#description');
	// 		descriptionInput.value = 'another text';
	// 		descriptionInput.dispatchEvent(new Event('input'));

	// 		const emailInput = element.shadowRoot.querySelector('#email');
	// 		emailInput.value = 'mail@some.com';
	// 		emailInput.dispatchEvent(new Event('input'));

	// 		// act
	// 		const submitButton = element.shadowRoot.querySelector('#button0');
	// 		submitButton.click();

	// 		expect(saveMapFeedbackSpy).not.toHaveBeenCalled();
	// 	});

	// 	it('does not call FeedbackService.save if description is not valid', async () => {
	// 		// arrange
	// 		const element = await setup();
	// 		const saveMapFeedbackSpy = spyOn(feedbackServiceMock, 'save');

	// 		const categorySelect = element.shadowRoot.querySelector('#category');
	// 		categorySelect.value = 'Foo';
	// 		categorySelect.dispatchEvent(new Event('change'));

	// 		const emailInput = element.shadowRoot.querySelector('#email');
	// 		emailInput.value = 'mail@some.com';
	// 		emailInput.dispatchEvent(new Event('input'));

	// 		// act
	// 		const submitButton = element.shadowRoot.querySelector('#button0');
	// 		submitButton.click();

	// 		expect(saveMapFeedbackSpy).not.toHaveBeenCalled();
	// 	});

	// 	it('does not call FeedbackService.save if email is set and not valid', async () => {
	// 		// arrange
	// 		const element = await setup();
	// 		const saveMapFeedbackSpy = spyOn(feedbackServiceMock, 'save');

	// 		const categorySelect = element.shadowRoot.querySelector('#category');
	// 		categorySelect.value = 'Foo';
	// 		categorySelect.dispatchEvent(new Event('change'));

	// 		const descriptionInput = element.shadowRoot.querySelector('#description');
	// 		descriptionInput.value = 'another text';
	// 		descriptionInput.dispatchEvent(new Event('input'));

	// 		const emailInput = element.shadowRoot.querySelector('#email');
	// 		emailInput.value = 'no email';
	// 		emailInput.dispatchEvent(new Event('input'));

	// 		// act
	// 		const submitButton = element.shadowRoot.querySelector('#button0');
	// 		submitButton.click();

	// 		expect(saveMapFeedbackSpy).not.toHaveBeenCalled();
	// 	});

	// 	it('calls FeedbackService.save after all fields are filled', async () => {
	// 		// arrange
	// 		const saveMapFeedbackSpy = spyOn(feedbackServiceMock, 'save');
	// 		const element = await setup();

	// 		element._updateFileId('geometryId');

	// 		const categorySelect = element.shadowRoot.querySelector('#category');
	// 		categorySelect.value = 'Foo';
	// 		categorySelect.dispatchEvent(new Event('change'));

	// 		const descriptionInput = element.shadowRoot.querySelector('#description');
	// 		descriptionInput.value = 'description';
	// 		descriptionInput.dispatchEvent(new Event('input'));

	// 		const emailInput = element.shadowRoot.querySelector('#email');
	// 		emailInput.value = 'email@some.com';
	// 		emailInput.dispatchEvent(new Event('input'));

	// 		const submitButton = element.shadowRoot.querySelector('#button0');

	// 		// act
	// 		submitButton.click();

	// 		// assert
	// 		expect(saveMapFeedbackSpy).toHaveBeenCalled();
	// 		expect(saveMapFeedbackSpy).toHaveBeenCalledWith(new MapFeedback('', 'Foo', 'description', 'geometryId', 'email@some.com'));
	// 	});

	// 	it('calls FeedbackService.save after all fields besides email are filled', async () => {
	// 		// arrange
	// 		const saveMapFeedbackSpy = spyOn(feedbackServiceMock, 'save');
	// 		const element = await setup();

	// 		element._updateFileId('geometryId');

	// 		const categorySelect = element.shadowRoot.querySelector('#category');
	// 		categorySelect.value = 'Foo';
	// 		categorySelect.dispatchEvent(new Event('change'));

	// 		const descriptionInput = element.shadowRoot.querySelector('#description');
	// 		descriptionInput.value = 'description';
	// 		descriptionInput.dispatchEvent(new Event('input'));

	// 		const submitButton = element.shadowRoot.querySelector('#button0');

	// 		// act
	// 		submitButton.click();

	// 		// assert
	// 		expect(saveMapFeedbackSpy).toHaveBeenCalled();
	// 		expect(saveMapFeedbackSpy).toHaveBeenCalledWith(new MapFeedback('', 'Foo', 'description', 'geometryId'));
	// 	});
	// });

	// describe('when disconnected', () => {
	// 	it('removes all observers', async () => {
	// 		const element = await setup();

	// 		expect(element._iframeObserver).toEqual(jasmine.any(MutationObserver));

	// 		element.onDisconnect(); // we call onDisconnect manually

	// 		expect(element._iframeObserver).toBeNull();
	// 	});
	// });
});
