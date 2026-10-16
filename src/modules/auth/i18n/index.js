import { $injector } from '../../../injection';
import { provide } from './passwordcredential.provider';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('baacredential', provide);
