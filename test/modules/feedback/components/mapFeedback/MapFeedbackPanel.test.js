import { IFrameComponents } from '../../../../../src/domain/iframeComponents';
import { PathParameters } from '../../../../../src/domain/pathParameters';
import { $injector } from '../../../../../src/injection';
import { MapFeedbackPanel } from '../../../../../src/modules/feedback/components/mapFeedback/MapFeedbackPanel';
import { MapFeedback } from '../../../../../src/services/FeedbackService';
import { LevelTypes } from '../../../../../src/store/notifications/notifications.action';
import { createNoInitialStateMediaReducer } from '../../../../../src/store/media/media.reducer';
import { notificationReducer } from '../../../../../src/store/notifications/notifications.reducer';
import { IFRAME_ENCODED_STATE, IFRAME_GEOMETRY_REFERENCE_ID } from '../../../../../src/utils/markup';
import { TestUtils } from '../../../../test-utils';

window.customElements.define(MapFeedbackPanel.tag, MapFeedbackPanel);

const configServiceMock = {
	getValueAsPath: () => {}
};

const feedbackServiceMock = {
	getCategories: () => ['Foo', 'Bar'],
	save: () => {},
	getOverlayGeoResourceId: () => 'overlay'
};

const shareServiceMock = {
	encodeState: () => 'http://foo.bar?x=0',
	copyToClipboard() {}
};

const fileStorageServiceMock = {
	isFileId(id) {
		return id.startsWith('f_');
	},
	isAdminId(id) {
		return id.startsWith('a_');
	}
};

const securityServiceMock = {
	sanitizeHtml: () => {}
};

let store;

const setup = (state = {}) => {
	const initialState = {
		media: {
			portrait: true
		},
		...state
	};

	store = TestUtils.setupStoreAndDi(initialState, {
		media: createNoInitialStateMediaReducer(),
		notifications: notificationReducer
	});

	$injector
		.registerSingleton('TranslationService', { translate: (key) => key })
		.registerSingleton('ConfigService', configServiceMock)
		.registerSingleton('FeedbackService', feedbackServiceMock)
		.registerSingleton('ShareService', shareServiceMock)
		.registerSingleton('FileStorageService', fileStorageServiceMock)
		.registerSingleton('SecurityService', securityServiceMock);

	return TestUtils.renderAndLogLifecycle(MapFeedbackPanel.tag);
};

describe('MapFeedbackPanel', () => {
	describe('when instantiated', () => {
		it('sets a default model', async () => {
			await setup();
			const element = new MapFeedbackPanel();

			expect(element.getModel()).toEqual({
				mapFeedback: {
					state: null,
					category: null,
					description: null,
					email: null,
					fileId: null
				},
				categoryOptions: [],
				isPortrait: false
			});
		});

		it('has default callback methods', async () => {
			await setup();
			const instanceUnderTest = new MapFeedbackPanel();

			expect(instanceUnderTest._onSubmit).toBeDefined();
		});
	});

	describe('when initialized', () => {
		it('renders the view', async () => {
			// arrange
			const expectedTitle = 'feedback_mapFeedback_header';
			const expectedCategory = '';
			const expectedCategoryOptions = ['', 'Foo', 'Bar'];
			const expectedDescription = '';
			const expectedEmail = '';

			const element = await setup();

			// assert
			expect(element.shadowRoot.children.length).toBe(3);
			expect(element.shadowRoot.querySelector('#feedbackPanelTitle').textContent).toBe(expectedTitle);

			const category = element.shadowRoot.querySelector('#category');
			expect(category.value).toBe(expectedCategory);
			const actualOptions = Array.from(category.querySelectorAll('option')).map((option) => option.value);
			expect(actualOptions).toEqual(expectedCategoryOptions);
			expect(element.shadowRoot.querySelector('#description').textContent).toBe(expectedDescription);
			expect(element.shadowRoot.querySelector('#email').textContent).toBe(expectedEmail);
		});

		it('renders form elements containing correct attributes', async () => {
			// arrange
			const element = await setup();

			const categoryElement = element.shadowRoot.querySelector('#category');
			const descriptionElement = element.shadowRoot.querySelector('#description');
			const emailElement = element.shadowRoot.querySelector('#email');

			// assert
			expect(categoryElement.type).toBe('select-one');
			expect(categoryElement.hasAttribute('required')).toBeTrue;
			expect(categoryElement.hasAttribute('placeholder')).toBeTrue;
			expect(categoryElement.parentElement.querySelector('label').innerText).toBe('feedback_mapFeedback_categorySelection');

			expect(descriptionElement.type).toBe('textarea');
			expect(descriptionElement.hasAttribute('required')).toBeTrue;
			expect(descriptionElement.hasAttribute('placeholder')).toBeTrue;
			expect(descriptionElement.getAttribute('maxlength')).toBe('10000');
			expect(descriptionElement.parentElement.querySelector('label').innerText).toBe('feedback_mapFeedback_changeDescription');

			expect(emailElement.type).toBe('email');
			expect(emailElement.hasAttribute('placeholder')).toBeTrue;
			expect(emailElement.parentElement.querySelector('label').innerText).toBe('feedback_mapFeedback_eMail');
			expect(descriptionElement.hasAttribute('placeholder')).toBeFalse;
		});

		it('renders a privacy policy disclaimer', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelector('#feedback_mapFeedback_disclaimer').innerText).toContain('feedback_mapFeedback_disclaimer');
			expect(element.shadowRoot.querySelector('#feedback_mapFeedback_disclaimer a').href).toContain('global_privacy_policy_url');
			expect(element.shadowRoot.querySelector('#feedback_mapFeedback_disclaimer a').innerText).toBe('feedback_mapFeedback_privacyPolicy');
			expect(element.shadowRoot.querySelector('#feedback_mapFeedback_disclaimer a').target).toBe('_blank');
		});

		it('creates an iframeObserver', async () => {
			const element = await setup();

			expect(element._iframeObserver).toEqual(jasmine.any(MutationObserver));
		});

		it('calls shareService for iframe-source', async () => {
			const encodeSpy = spyOn(shareServiceMock, 'encodeState').and.callThrough();
			await setup();

			expect(encodeSpy).toHaveBeenCalledWith({ ifc: [IFrameComponents.DRAW_TOOL], l: jasmine.any(String) }, [PathParameters.EMBED]);
		});

		it('filters iframe-source for user-generated layers', async () => {
			const encodedState = 'http://foo.bar/baz?l=atkis,f_foo&foo=bar';
			const expectedEncodedState = 'http://foo.bar/baz?l=atkis&foo=bar';
			const encodeSpy = spyOn(shareServiceMock, 'encodeState').and.returnValue(encodedState);
			const element = await setup();

			const iframeElement = element.shadowRoot.querySelector('iframe');
			expect(encodeSpy).toHaveBeenCalledWith({ ifc: [IFrameComponents.DRAW_TOOL], l: feedbackServiceMock.getOverlayGeoResourceId() }, [
				PathParameters.EMBED
			]);
			expect(iframeElement.src).toBe(expectedEncodedState);
		});

		it('gets the correct elements from _allInvolvedElements', async () => {
			// arrange
			const element = await setup();

			const allInvolvedElements = element._allInvolvedElements();

			const nodeValues = [];
			allInvolvedElements.forEach((element) => {
				if (element.attributes.length === 1) {
					nodeValues.push(element.attributes['class'].nodeValue);
				}
				if (element.attributes.length > 1) {
					nodeValues.push(element.attributes['id'].nodeValue);
				}
			});

			// assert
			expect(element._allInvolvedElements).toBeDefined();
			expect(allInvolvedElements.length).toBe(4);
			expect(nodeValues.length).toBe(4);
			expect(nodeValues.includes('map-feedback__iframe')).toBeTrue();
			expect(nodeValues.includes('description-form-element')).toBeTrue();
			expect(nodeValues.includes('category-form-element')).toBeTrue();
			expect(nodeValues.includes('email-form-element')).toBeTrue();
		});
	});

	describe('when listen to iframe-attribute changes', () => {
		it('updates mapFeedback.fileId and .state', async () => {
			const fileId = 'f_foo';
			const element = await setup();

			const updateFileIdSpy = spyOn(element, '_updateFileId').and.callThrough();
			const updateStateSpy = spyOn(element, '_updateState').and.callThrough();

			expect(element._iframeObserver).toEqual(jasmine.any(MutationObserver));

			const iframe = element.shadowRoot.querySelector('iframe');
			iframe.setAttribute(IFRAME_GEOMETRY_REFERENCE_ID, fileId);
			await TestUtils.timeout();

			expect(element.getModel().mapFeedback.fileId).toBe(fileId);

			// no calls by changes on any other attribute
			iframe.setAttribute('foo', 'bar');

			await TestUtils.timeout();

			expect(updateFileIdSpy).toHaveBeenCalledTimes(1);
			expect(updateStateSpy).toHaveBeenCalledTimes(1);
		});

		it('updates mapFeedback.state', async () => {
			const frontendUrl = 'http://frontend.url';
			const iframeUrl = 'http://iframe.url';
			const searchParams = 'l=foo,bar';
			const element = await setup();

			spyOn(configServiceMock, 'getValueAsPath').withArgs('FRONTEND_URL').and.returnValue(frontendUrl);
			const updateStateSpy = spyOn(element, '_updateState').and.callThrough();
			expect(element._iframeObserver).toEqual(jasmine.any(MutationObserver));

			const iframe = element.shadowRoot.querySelector('iframe');
			iframe.setAttribute(IFRAME_ENCODED_STATE, `${iframeUrl}?${searchParams}`);
			await TestUtils.timeout();

			expect(element.getModel().mapFeedback.state).toBe(`${frontendUrl}?${searchParams}`);

			// no calls by changes on any other attribute
			iframe.setAttribute('foo', 'bar');

			await TestUtils.timeout();

			expect(updateStateSpy).toHaveBeenCalledTimes(1);
		});

		it('updates mapFeedback.state with existing fileId', async () => {
			const fileId = 'f_id';
			const frontendUrl = 'http://frontend.url';
			const iframeUrl = 'http://iframe.url';
			const searchParams = 'l=foo,bar';
			const expectedSearchParams = `l=foo,bar,${fileId}`;
			const element = await setup();

			element._updateFileId(fileId);
			spyOn(configServiceMock, 'getValueAsPath').withArgs('FRONTEND_URL').and.returnValue(frontendUrl);

			const iframe = element.shadowRoot.querySelector('iframe');
			iframe.setAttribute(IFRAME_ENCODED_STATE, `${iframeUrl}?${searchParams}`);
			await TestUtils.timeout();

			expect(element.getModel().mapFeedback.state).toBe(`${frontendUrl}?${expectedSearchParams}`);
		});

		it('does not update mapFeedback.state with existing fileId', async () => {
			const fileId = 'f_id';
			const frontendUrl = 'http://frontend.url';
			const iframeUrl = 'http://iframe.url';
			const iframeSearchParams = 'l=foo,f_id,bar';

			const element = await setup();

			element._updateFileId(fileId);
			spyOn(configServiceMock, 'getValueAsPath').withArgs('FRONTEND_URL').and.returnValue(frontendUrl);

			const iframe = element.shadowRoot.querySelector('iframe');
			iframe.setAttribute(IFRAME_ENCODED_STATE, `${iframeUrl}?${iframeSearchParams}`);
			await TestUtils.timeout();

			expect(element.getModel().mapFeedback.state).toBe(`${frontendUrl}?${iframeSearchParams}`);
		});
	});

	describe('when using FeedbackService', () => {
		it('logs an error when getCategories fails', async () => {
			// arrange
			const message = 'error message';
			const getMapFeedbackSpy = spyOn(feedbackServiceMock, 'getCategories').and.rejectWith(new Error(message));
			const errorSpy = spyOn(console, 'error');
			const element = await setup();

			// act
			await element._getCategoryOptions();

			// assert
			expect(getMapFeedbackSpy).toHaveBeenCalled();
			expect(errorSpy).toHaveBeenCalledWith(new Error(message));
		});

		it('logs an error when save fails', async () => {
			// arrange
			const message = 'error message';
			const mapFeedbackSaveSpy = spyOn(feedbackServiceMock, 'save').and.rejectWith(new Error(message));
			const errorSpy = spyOn(console, 'error');
			const element = await setup();

			// act
			await element._saveMapFeedback('', '', '');

			// assert
			expect(mapFeedbackSaveSpy).toHaveBeenCalled();
			expect(errorSpy).toHaveBeenCalledWith(new Error(message));

			expect(store.getState().notifications.latest.payload.content).toBe('feedback_mapFeedback_could_not_save');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.ERROR);
		});

		it('emits a success notification if save succeeds and calls the onClose callback', async () => {
			// arrange
			const onSubmitCallback = jasmine.createSpy();
			const mapFeedbackSaveSpy = spyOn(feedbackServiceMock, 'save').and.resolveTo(true);
			const element = await setup();
			element.onSubmit = onSubmitCallback;

			// act
			await element._saveMapFeedback('', '', '');

			// assert
			expect(mapFeedbackSaveSpy).toHaveBeenCalled();

			expect(store.getState().notifications.latest.payload.content).toBe('feedback_mapFeedback_saved_successfully');
			expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
			expect(onSubmitCallback).toHaveBeenCalled();
		});

		it('calls FeedbackService.getCategories()', async () => {
			// arrange
			const getMapFeedbackSpy = spyOn(feedbackServiceMock, 'getCategories');
			const element = await setup();

			// act
			await element._getCategoryOptions();

			// assert
			expect(getMapFeedbackSpy).toHaveBeenCalled();
		});
	});

	describe('when submit is pressed', () => {
		it('does not call FeedbackService.save if required fields are not filled', async () => {
			// arrange
			const element = await setup();
			const saveMapFeedbackSpy = spyOn(feedbackServiceMock, 'save');

			// act
			const submitButton = element.shadowRoot.querySelector('#button0');
			submitButton.click();

			expect(saveMapFeedbackSpy).not.toHaveBeenCalled();
		});

		it('does not call FeedbackService.save if geometry is not set', async () => {
			// arrange
			const element = await setup();
			const saveMapFeedbackSpy = spyOn(feedbackServiceMock, 'save');

			// act
			const submitButton = element.shadowRoot.querySelector('#button0');
			submitButton.click();

			expect(saveMapFeedbackSpy).not.toHaveBeenCalled();
		});

		it('does not call FeedbackService.save if category is not valid', async () => {
			// arrange
			const element = await setup();
			const saveMapFeedbackSpy = spyOn(feedbackServiceMock, 'save');

			const descriptionInput = element.shadowRoot.querySelector('#description');
			descriptionInput.value = 'another text';
			descriptionInput.dispatchEvent(new Event('input'));

			const emailInput = element.shadowRoot.querySelector('#email');
			emailInput.value = 'mail@some.com';
			emailInput.dispatchEvent(new Event('input'));

			// act
			const submitButton = element.shadowRoot.querySelector('#button0');
			submitButton.click();

			expect(saveMapFeedbackSpy).not.toHaveBeenCalled();
		});

		it('does not call FeedbackService.save if description is not valid', async () => {
			// arrange
			const element = await setup();
			const saveMapFeedbackSpy = spyOn(feedbackServiceMock, 'save');

			const categorySelect = element.shadowRoot.querySelector('#category');
			categorySelect.value = 'Foo';
			categorySelect.dispatchEvent(new Event('change'));

			const emailInput = element.shadowRoot.querySelector('#email');
			emailInput.value = 'mail@some.com';
			emailInput.dispatchEvent(new Event('input'));

			// act
			const submitButton = element.shadowRoot.querySelector('#button0');
			submitButton.click();

			expect(saveMapFeedbackSpy).not.toHaveBeenCalled();
		});

		it('does not call FeedbackService.save if email is set and not valid', async () => {
			// arrange
			const element = await setup();
			const saveMapFeedbackSpy = spyOn(feedbackServiceMock, 'save');

			const categorySelect = element.shadowRoot.querySelector('#category');
			categorySelect.value = 'Foo';
			categorySelect.dispatchEvent(new Event('change'));

			const descriptionInput = element.shadowRoot.querySelector('#description');
			descriptionInput.value = 'another text';
			descriptionInput.dispatchEvent(new Event('input'));

			const emailInput = element.shadowRoot.querySelector('#email');
			emailInput.value = 'no email';
			emailInput.dispatchEvent(new Event('input'));

			// act
			const submitButton = element.shadowRoot.querySelector('#button0');
			submitButton.click();

			expect(saveMapFeedbackSpy).not.toHaveBeenCalled();
		});

		it('calls FeedbackService.save after all fields are filled', async () => {
			// arrange
			const saveMapFeedbackSpy = spyOn(feedbackServiceMock, 'save');
			spyOn(securityServiceMock, 'sanitizeHtml').and.callFake((value) => value);
			const element = await setup();

			element._updateFileId('geometryId');
			element._updateState('Foo');

			const categorySelect = element.shadowRoot.querySelector('#category');
			categorySelect.value = 'Bar';
			categorySelect.dispatchEvent(new Event('change'));

			const descriptionInput = element.shadowRoot.querySelector('#description');
			descriptionInput.value = 'description';
			descriptionInput.dispatchEvent(new Event('input'));

			const emailInput = element.shadowRoot.querySelector('#email');
			emailInput.value = 'email@some.com';
			emailInput.dispatchEvent(new Event('input'));

			const submitButton = element.shadowRoot.querySelector('#button0');

			// act
			submitButton.click();

			// assert
			expect(saveMapFeedbackSpy).toHaveBeenCalled();
			expect(saveMapFeedbackSpy).toHaveBeenCalledWith(new MapFeedback('Foo', 'Bar', 'description', 'geometryId', 'email@some.com'));
		});

		it('calls FeedbackService.save after all fields besides email are filled', async () => {
			// arrange
			const saveMapFeedbackSpy = spyOn(feedbackServiceMock, 'save');
			spyOn(securityServiceMock, 'sanitizeHtml').and.callFake((value) => value);
			const element = await setup();

			element._updateFileId('geometryId');
			element._updateState('Foo');

			const categorySelect = element.shadowRoot.querySelector('#category');
			categorySelect.value = 'Bar';
			categorySelect.dispatchEvent(new Event('change'));

			const descriptionInput = element.shadowRoot.querySelector('#description');
			descriptionInput.value = 'description';
			descriptionInput.dispatchEvent(new Event('input'));

			const submitButton = element.shadowRoot.querySelector('#button0');

			// act
			submitButton.click();

			// assert
			expect(saveMapFeedbackSpy).toHaveBeenCalled();
			expect(saveMapFeedbackSpy).toHaveBeenCalledWith(new MapFeedback('Foo', 'Bar', 'description', 'geometryId'));
		});

		it('all involved elements receive the "wasTouched" class', async () => {
			// arrange
			const element = await setup();
			const allInvolvedElements = element._allInvolvedElements();

			// act
			const submitButton = element.shadowRoot.querySelector('#button0');
			submitButton.click();

			// assert
			allInvolvedElements.forEach((element) => {
				const nodeValue = element.attributes['class'].nodeValue;
				expect(nodeValue.includes('wasTouched')).toBeTrue();
			});
		});
	});

	describe('when disconnected', () => {
		it('removes all observers', async () => {
			const element = await setup();

			expect(element._iframeObserver).toEqual(jasmine.any(MutationObserver));

			element.onDisconnect(); // we call onDisconnect manually

			expect(element._iframeObserver).toBeNull();
		});
	});

	describe('when description is changed', () => {
		it('sanitizes the input value', async () => {
			// arrange
			const descriptionValue = 'description';
			const element = await setup();
			const sanitizeSpy = spyOn(securityServiceMock, 'sanitizeHtml').and.callThrough();

			// act
			const descriptionInput = element.shadowRoot.querySelector('#description');
			descriptionInput.value = descriptionValue;
			descriptionInput.dispatchEvent(new Event('input'));

			// assert
			expect(sanitizeSpy).toHaveBeenCalledWith(descriptionValue);
		});

		it('its parent receives the "wasTouched" class', async () => {
			// arrange
			const descriptionValue = 'description';
			const element = await setup();

			// act
			const descriptionInput = element.shadowRoot.querySelector('#description');
			descriptionInput.value = descriptionValue;
			descriptionInput.dispatchEvent(new Event('input'));

			// assert
			const nodeValue = descriptionInput.parentElement.attributes['class'].nodeValue;
			expect(nodeValue.includes('wasTouched')).toBeTrue();
		});
	});

	describe('when email is changed', () => {
		it('sanitizes the input value', async () => {
			// arrange
			const emailValue = 'email@some.com';
			const element = await setup();
			const sanitizeSpy = spyOn(securityServiceMock, 'sanitizeHtml').and.callThrough();

			// act
			const emailInput = element.shadowRoot.querySelector('#email');
			emailInput.value = emailValue;
			emailInput.dispatchEvent(new Event('input'));

			// assert
			expect(sanitizeSpy).toHaveBeenCalledWith(emailValue);
		});

		fit('its parent receives the "wasTouched" class', async () => {
			// arrange
			const emailValue = 'email';
			const element = await setup();

			// act
			const emailInput = element.shadowRoot.querySelector('#email');
			emailInput.value = emailValue;
			emailInput.dispatchEvent(new Event('input'));

			// assert
			const nodeValue = emailInput.parentElement.attributes['class'].nodeValue;
			expect(nodeValue.includes('wasTouched')).toBeTrue();
		});
	});

	describe('when category is changed', () => {
		it('sanitizes the input value', async () => {
			// arrange
			const categoryValue = 'Bar';
			const element = await setup();
			const sanitizeSpy = spyOn(securityServiceMock, 'sanitizeHtml').and.callThrough();

			// act
			const categorySelect = element.shadowRoot.querySelector('#category');
			categorySelect.value = categoryValue;
			categorySelect.dispatchEvent(new Event('change'));

			// assert
			expect(sanitizeSpy).toHaveBeenCalledWith(categoryValue);
		});

		it('its parent receives the "wasTouched" class', async () => {
			// arrange
			const categoryValue = 'Bar';
			const element = await setup();

			// act
			const categorySelect = element.shadowRoot.querySelector('#category');
			categorySelect.value = categoryValue;
			categorySelect.dispatchEvent(new Event('change'));

			// assert
			const nodeValue = categorySelect.parentElement.attributes['class'].nodeValue;
			expect(nodeValue.includes('wasTouched')).toBeTrue();
		});
	});

	describe('responsive layout ', () => {
		it('layouts for landscape', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(0);
		});

		it('layouts for portrait ', async () => {
			const state = {
				media: {
					portrait: true
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(1);
		});
	});
});
