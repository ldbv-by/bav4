import { $injector } from '../../../injection';
import { provide as feedbackProvider } from './feedback.provider';
import { provide as likertItemRatingProvider } from './likertItemRating.provider';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('feedbackProvider', feedbackProvider);
translationService.register('likertItemRatingProvider', likertItemRatingProvider);
