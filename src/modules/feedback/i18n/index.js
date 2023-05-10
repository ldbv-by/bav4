import { provide as feedbackProvider } from './feedback.provider';
import { provide as fiveButtonRatingProvider } from './fiveButtonRating.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('feedbackProvider', feedbackProvider);
translationService.register('fiveButtonRatingProvider', fiveButtonRatingProvider);
