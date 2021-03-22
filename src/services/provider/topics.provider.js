import { $injector } from '../../injection';
import { Topic } from '../domain/topic';
/**
 * @returns {Array} with topics loaded from backend  
 */ 
export const loadBvvTopics = async () => {
	
	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');

	const url = configService.getValueAsPath('BACKEND_URL') + 'topics';


	const result = await httpService.fetch(`${url}`, { });

	if (result.ok) {
		const topics = []; 
		const payload = await result.json();
		payload.topics.forEach(definition => {
			let topic = null;
			topic = new Topic(
				definition.id, 
				definition.label, 
				definition.description, 
				definition.backgroundLayers, 
				definition.defaultBackground, 
				definition.activatedLayers, 
				definition.selectedLayers);
			//at least the id, label and backgroundLayers should be set
			if (topic.id && topic.label && topic.backgroundLayers) { 
				topics.push(topic);
			}
			else {
				console.warn('Could not create topic');
			} 
		});
		return topics; 
	}
	throw new Error('Topics could not be retrieved');
};
