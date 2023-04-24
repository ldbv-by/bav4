import { provide as feedbackProvider } from './feedback.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('feedbackProvider', feedbackProvider);
