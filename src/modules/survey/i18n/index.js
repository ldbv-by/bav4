
import { surveyProvide } from './survey.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('surveyProvide', surveyProvide);


