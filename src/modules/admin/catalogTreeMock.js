const catalogTreeMock = Object.freeze([
	{
		label: 'Group Node',
		children: [
			{ label: 'Geo Resource of group node' },
			{ label: 'Another Geo Resource of group Node' },
			{ label: 'Not last but again: A geo resource' },
			{
				label: 'Another Group Node',
				children: [
					{ label: 'Geo Resource of another group node' },
					{ label: 'Another Geo Resource of another group Node' },
					{ label: 'last but not least: A geo resource' }
				]
			},
			{ label: 'Another second Geo Resource' },
			{
				label: 'Another Group Node',
				children: [
					{ label: 'Geo Resource of another group node' },
					{ label: 'Another Geo Resource of another group Node' },
					{ label: 'last but not least: A geo resource' },
					{
						label: 'Another Group Node',
						children: [
							{ label: 'Geo Resource of another group node' },
							{ label: 'Another Geo Resource of another group Node' },
							{ label: 'last but not least: A geo resource' }
						]
					}
				]
			}
		]
	},
	{ label: 'Another Geo Resource' },
	{ label: 'Another second Geo Resource' },
	{
		label: 'Another Group Node',
		children: [
			{ label: 'Geo Resource of another group node' },
			{ label: 'Another Geo Resource of another group Node' },
			{ label: 'last but not least: A geo resource' }
		]
	}
]);

export const getTree = () => {
	return JSON.parse(JSON.stringify(catalogTreeMock));
};
