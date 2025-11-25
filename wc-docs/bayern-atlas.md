# bayern-atlas

A WebComponent that embeds the BayernAtlas in your page.

## Examples

```html
//A simple example

<bayern-atlas l="atkis" z="8" c="671092,5299670"></bayern-atlas>
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

## Attributes

| Attribute            | Type     | Description                                                                                                                                        |
| -------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `c`                  | `string` | The Center coordinate (longitude,latitude / easting,northing) in map projection or in the configured SRID (see `ec_srid`). Example: `c="11,48"`    |
| `ec_geometry_format` | `string` | Designated Type (format) of returned features. One of `ewkt`, `kml`, `geojson`, `gpx`. Default is `ewkt`. Example: `ec_geometry_format="geoJson"`. |
| `ec_srid`            | `string` | Designated SRID of returned coordinates (e.g. of geometries). One of `3857`, `4326` , `25832`. Default is `4326`. Example: `ec_srid="25832"`       |
| `l`                  | `string` | The layers of the map. Example: `l="layer_a,layer_b"`.                                                                                             |
| `r`                  | `string` | The rotation of the map (in rad). Example: `r="0.5"`.                                                                                              |
| `z`                  | `string` | The Zoom level (0-20) of the map. Example: `z="8"`.                                                                                                |

## Properties

| Property   | Type            | Description                                                   |
| ---------- | --------------- | ------------------------------------------------------------- |
| `center`   | `Array<number>` | Center coordinate in map projection or in the configured SRID |
| `layers`   | `Array<string>` | The layers of the map                                         |
| `rotation` | `number`        | The rotation of the map (in rad)                              |
| `zoom`     | `number`        | Zoom level of the map.                                        |

## Events

| Event              | Type                | Description                                         |
| ------------------ | ------------------- | --------------------------------------------------- |
| `baChange`         | `CustomEvent<this>` | Fired when the state of the BayernAtlas has changed |
| `baFeatureSelect`  | `CustomEvent<this>` | Fired when one or more features are selected        |
| `baGeometryChange` | `CustomEvent<this>` | Fired when the user creates or modifies a geometry  |
| `baLoad`           | `CustomEvent<this>` | Fired when the BayernAtlas is loaded                |
| `connected`        | `CustomEvent<this>` |                                                     |
