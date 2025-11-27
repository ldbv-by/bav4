<a name="module_BayernAtlas"></a>

## BayernAtlas

- [BayernAtlas](#module_BayernAtlas)
  - _static_
    - [.QueryParameters](#module_BayernAtlas.QueryParameters) : <code>enum</code>
  - _inner_
    - [ZOOM](#module_BayernAtlas..ZOOM)
    - [CENTER](#module_BayernAtlas..CENTER)
    - [ROTATION](#module_BayernAtlas..ROTATION)
    - [LAYER](#module_BayernAtlas..LAYER)
    - [LAYER_VISIBILITY](#module_BayernAtlas..LAYER_VISIBILITY)
    - [LAYER_OPACITY](#module_BayernAtlas..LAYER_OPACITY)
    - [LAYER_DISPLAY_FEATURE_LABELS](#module_BayernAtlas..LAYER_DISPLAY_FEATURE_LABELS)
    - [QUERY](#module_BayernAtlas..QUERY)
    - [CROSSHAIR](#module_BayernAtlas..CROSSHAIR)
    - [ZOOM_TO_EXTENT](#module_BayernAtlas..ZOOM_TO_EXTENT)
    - [GEOLOCATION](#module_BayernAtlas..GEOLOCATION)
    - [FEATURE_INFO_REQUEST](#module_BayernAtlas..FEATURE_INFO_REQUEST)

<a name="module_BayernAtlas.QueryParameters"></a>

### BayernAtlas.QueryParameters : <code>enum</code>

Enum which holds all valid query parameter keys.

<a name="module_BayernAtlas..ZOOM"></a>

### ZOOM

`z`: The zoom level of the map (`number`)

**Example**

```js
https://atlas.bayern.de?z=8
```

<a name="module_BayernAtlas..CENTER"></a>

### CENTER

`c`: The Center coordinate (easting,northing / longitude,latitude) in a supported SRID (25832, 4326) (two `numbers`, comma-separated).

**Example**

```js
https://atlas.bayern.de?c=677751,5422939
```

<a name="module_BayernAtlas..ROTATION"></a>

### ROTATION

`r`: The rotation of the map (`number`, in radians)

**Example**

```js
https://atlas.bayern.de?r=0.42
```

<a name="module_BayernAtlas..LAYER"></a>

### LAYER

`l`: The id or URL of the layers of the map (`string`, comma-separated).
An id represents an internal, a URL a external `GeoResource`.

URL-Patterns:<br>
KML, GPX, GEOJSON, EWKT: `url||[label]` <br>
WMS: `url||layer||[label]`

**Example**

```js
// By layer ID
https://atlas.bayern.de?l=atkis,tk
```

**Example**

```js
//By layer ID and URL for KML, GPX, GEOJSON, EWKT
https://atlas.bayern.de?l=atkis,https%3A%2F%2Fgeodaten.bayern.de%2Fodd%2Fm%2F2%2Ffreizeitthemen%2Fkml%2Fzoo.kml||Zoos%20in%20Bayern
```

**Example**

```js
//By layer ID and URL for WMS
https://atlas.bayern.de?c=646193,5479249&z=13&l=atkis,https%3A%2F%2Fgeoservices.bayern.de%2Fod%2Fwms%2Fatkis%2Fv1%2Ffreizeitwege||by_fzw_radwege||Radwege
```

<a name="module_BayernAtlas..LAYER_VISIBILITY"></a>

### LAYER_VISIBILITY

`l_v`: The visibility of a layer (in relation to the layer index) (`boolean`, comma-separated)

**Example**

```js
https://atlas.bayern.de?l=atkis,tk&l_v=true,false
```

<a name="module_BayernAtlas..LAYER_OPACITY"></a>

### LAYER_OPACITY

`l_o`: The opacity of a layer (in relation to the layer index) (`number`, 0-1, comma-separated)

**Example**

```js
https://atlas.bayern.de?l=atkis,tk&l_o=1,0.5
```

<a name="module_BayernAtlas..LAYER_DISPLAY_FEATURE_LABELS"></a>

### LAYER_DISPLAY_FEATURE_LABELS

`l_dfl`: A layer should display its feature labels (if available) (in relation to the layer index) (`boolean`, comma-separated)

**Example**

```js
https://atlas.bayern.de?l=atkis,f_11d82da0-caef-11f0-a60a-dfceed522f95_ba878c95-c163-4f34-a0cd-350c10556e00&l_dfl=true,false
```

<a name="module_BayernAtlas..QUERY"></a>

### QUERY

`q`: A `string` which will initialize a search request for that query

**Example**

```js
https://atlas.bayern.de?q=München
```

<a name="module_BayernAtlas..CROSSHAIR"></a>

### CROSSHAIR

`crh`: Id (`string`) of the type of marker which should be initially displayed in the center of the map.
If the marker should be displayed elsewhere two `numbers` representing the coordinate (in 3857) could be appended (comma-separated)

**Example**

```js
https://atlas.bayern.de?crh=true
```

**Example**

```js
https://atlas.bayern.de?crh=true,1319753.835587,6495702.843419
```

<a name="module_BayernAtlas..ZOOM_TO_EXTENT"></a>

### ZOOM_TO_EXTENT

The index (`number`) of the layer (see `LAYER` parameter) which extent should be used to fit on the map size.

<a name="module_BayernAtlas..GEOLOCATION"></a>

### GEOLOCATION

`gl`: Activated geolocation (`boolean`)

**Example**

```js
https://atlas.bayern.de?gl=true
```

<a name="module_BayernAtlas..FEATURE_INFO_REQUEST"></a>

### FEATURE_INFO_REQUEST

`fir`: The coordinate (in 3857) for an initial FeatureInfo request (two `numbers`, comma-separated)

**Example**

```js
https://atlas.bayern.de?l=atkis,f_11d82da0-caef-11f0-a60a-dfceed522f95_ba878c95-c163-4f34-a0cd-350c10556e00&&fir=1306912.414835,6294520.584972
```
