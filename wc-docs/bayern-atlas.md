# bayern-atlas

A WebComponent that embeds the BayernAtlas in your page.

API design philosophy:

- Attributes are only read initially to declaratively setup the map
- Attributes as well as Getter-Properties reflect the current state of the map
- Use the methods to programmatically change / modify the map

## Examples

```html
//A simple example

<bayern-atlas></bayern-atlas>
```

```html
//A more complex example

<bayern-atlas
	l="luftbild_labels,803da236-15f1-4c97-91e0-73248154d381,c5859de2-5f50-428a-aa63-c14e7543463f"
	z="8"
	c="671092,5299670"
	r="0.5"
	ec_draw_tool="polygon"
	ec_srid="25832"
	ec_geometry_format="ewkt"
>
</bayern-atlas>
```

```javascript
// Defines the center, resolution, and rotation of the map
View {
	zoom: 4, // The new number zoom level of the map (number, optional)
	center: [1286733,039367 6130639,596329], // The new center coordinate in 4326 (lon, lat) or in 25832 ([number], optional)
	rotation: 0.5 // The new rotation pf the map in rad (number, optional)
}

AddLayerOptions {
	geoResourceId: "atkis",  //Id of the linked GeoResource (string)
	opacity: 1, // Opacity (number, 0, 1, optional)
	visible: true,  // Visibility (boolean, optional)
	zIndex: 0,  // Index of this layer within the list of active layers. When not set, the layer will be appended at the end (number, optional)
	style: { baseColor: #fcba03 },  // If applicable the style of this layer (Style, optional),
	displayFeatureLabels: true // If applicable labels of features should be displayed (boolean, optional)
}

ModifyLayerOptions {
	opacity: 1, // Opacity (number, 0, 1, optional)
	visible: true,  // Visibility (boolean, optional)
	zIndex: 0,  // Index of this layer within the list of active layers. When not set, the layer will be appended at the end (number, optional)
	style: { baseColor: #fcba03 }  // If applicable the style of this layer (Style, optional),
	displayFeatureLabels: true // If applicable labels of features should be displayed (boolean, optional)
}

Style {
		baseColor: #fcba03 //A simple base color as style for this layer (seven-character hexadecimal notation) or `null`
}
```

## Attributes

| Attribute            | Type     | Description                                                                                                                                        |
| -------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `c`                  | `string` | The Center coordinate (longitude,latitude / easting,northing) in `4326` (lon, lat) or in `25832`. Example: `c="11,48"`                             |
| `ec_geometry_format` | `string` | Designated Type (format) of returned features. One of `ewkt`, `kml`, `geojson`, `gpx`. Default is `ewkt`. Example: `ec_geometry_format="geoJson"`. |
| `ec_srid`            | `string` | Designated SRID of returned coordinates (e.g. of geometries). One of `3857`, `4326` , `25832`. Default is `4326`. Example: `ec_srid="25832"`       |
| `l`                  | `string` | The layers of the map. Example: `l="layer_a,layer_b"`.                                                                                             |
| `r`                  | `string` | The rotation of the map (in rad). Example: `r="0.5"`.                                                                                              |
| `z`                  | `string` | The Zoom level (0-20) of the map. Example: `z="8"`.                                                                                                |

## Properties

| Property   | Modifiers | Type            | Description                                                   |
| ---------- | --------- | --------------- | ------------------------------------------------------------- |
| `center`   | readonly  | `Array<number>` | Center coordinate in map projection or in the configured SRID |
| `layers`   | readonly  | `Array<string>` | The layers of the map                                         |
| `rotation` | readonly  | `number`        | The rotation of the map (in rad)                              |
| `zoom`     | readonly  | `number`        | Zoom level of the map.                                        |

## Methods

| Method        | Type                                                               | Description                                                                                                                                                                                                                                                                             |
| ------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `addLayer`    | `(geoResourceIdOrData: string, options?: AddLayerOptions): string` | Adds a new Layer to the map. <b>Returns the id of the added layer.</b><br /><br />**geoResourceIdOrData**: The id of a GeoResource, the URL-pattern denoting an external GeoResource or the (vector) data as string (`EWKT`, `GeoJSON`, `KML`, `GPX`)<br />**options**: AddLayerOptions |
| `modifyLayer` | `(layerId: string, options?: ModifyLayerOptions): void`            | Modifies a layer of the map.<br /><br />**layerId**: The id of a layer<br />**options**: ModifyLayerOptions                                                                                                                                                                             |
| `modifyView`  | `(view?: View): void`                                              | Modifies a the view of the map.<br /><br />**view**: The new view of the map                                                                                                                                                                                                            |
| `removeLayer` | `(layerId: string): void`                                          | Removes a layer from the map.<br /><br />**layerId**: The id of a layer                                                                                                                                                                                                                 |

## Events

| Event              | Type                | Description                                         |
| ------------------ | ------------------- | --------------------------------------------------- |
| `baChange`         | `CustomEvent<this>` | Fired when the state of the BayernAtlas has changed |
| `baFeatureSelect`  | `CustomEvent<this>` | Fired when one or more features are selected        |
| `baGeometryChange` | `CustomEvent<this>` | Fired when the user creates or modifies a geometry  |
| `baLoad`           | `CustomEvent<this>` | Fired when the BayernAtlas is loaded                |
| `connected`        | `CustomEvent<this>` |                                                     |
