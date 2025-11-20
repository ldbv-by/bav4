# bayern-atlas

A WebComponent that embeds the BayernAtlas in your page.

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

## Attributes

| Attribute | Type     | Description                                      |
|-----------|----------|--------------------------------------------------|
| `c`       | `string` | The Center coordinate (longitude,latitude / easting,northing) in map projection or in the configured SRID (see `ec_srid`). Example: `11,48` |
| `l`       | `string` | The layers of the map. Example: `layer_a,layer_b`. |
| `r`       | `string` | The rotation of the map (in rad). Example: `0.5`. |
| `z`       | `string` | The Zoom level (0-20) of the map. Example: `8`.  |

## Properties

| Property   | Type            | Description                                      |
|------------|-----------------|--------------------------------------------------|
| `center`   | `Array<number>` | Center coordinate in map projection or in the configured SRID |
| `layers`   | `Array<string>` | The layers of the map                            |
| `rotation` | `number`        | The rotation of the map (in rad)                 |
| `zoom`     | `number`        | Zoom level of the map.                           |

## Events

| Event                | Type                | Description                                     |
|----------------------|---------------------|-------------------------------------------------|
| `ba-change`          |                     | Fired when state of the BayernAtlas has changed |
| `ba-feature-select`  |                     | Fired when state of the BayernAtlas has changed |
| `ba-geometry-change` |                     | Fired when state of the BayernAtlas has changed |
| `ba-load`            |                     | Fired when the BayernAtlas is loaded            |
| `connected`          | `CustomEvent<this>` |                                                 |
