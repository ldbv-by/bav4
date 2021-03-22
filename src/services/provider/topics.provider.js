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
				definition.defaultBackground, 
				definition.backgroundLayers, 
				definition.activatedLayers, 
				definition.selectedLayers);
			if (topic.id && topic.label) { //at least the id and the label should be set
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
