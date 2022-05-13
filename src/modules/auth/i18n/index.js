import { provide } from './baacredentials.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('baacredentials', provide);
