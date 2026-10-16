import { $injector } from '../../../injection';
import { provide as topicsProvider } from './topics.provider';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('topicsProvider', topicsProvider);
