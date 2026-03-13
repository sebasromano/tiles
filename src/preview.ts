export function tilePreviewHtml(tilesUrl: string): string {
    return `<!DOCTYPE html>
<html>
  <head>
    <title>deck.gl MVTLayer Preview</title>

    <script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
    <script src='https://unpkg.com/maplibre-gl@3.6.0/dist/maplibre-gl.js'></script>

    <link href='https://unpkg.com/maplibre-gl@3.6.0/dist/maplibre-gl.css' rel='stylesheet' />
    <style type="text/css">
      body {
        width: 100vw;
        height: 100vh;
        margin: 0;
        overflow: hidden;
      }
      .deck-tooltip {
        font-family: Helvetica, Arial, sans-serif;
        padding: 6px !important;
        margin: 8px;
        max-width: 300px;
        font-size: 10px;
      }
    </style>
  </head>

  <body>
  </body>

  <script type="text/javascript">

    const {DeckGL, MVTLayer} = deck;

    const mvtLayer = new MVTLayer({
      data: ['${tilesUrl}'],
      minZoom: 0,
      maxZoom: 23,
      getFillColor: [65, 182, 196, 180],
      getLineColor: [255, 255, 255],
      lineWidthMinPixels: 1,
      pointRadiusMinPixels: 2.5,
      pickable: true
    });

    new DeckGL({
      mapStyle: 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json',
      initialViewState: {
        latitude: 34.10,
        longitude: -100.21,
        zoom: 3,
        maxZoom: 20,
        pitch: 45
      },
      controller: true,
      layers: [mvtLayer],
      getTooltip
    });

    function getTooltip({object}) {
      if (!object || !object.properties) return null;
      const props = object.properties;
      const lines = Object.entries(props)
        .filter(([, v]) => v != null)
        .map(([k, v]) => k + ': ' + v);
      return lines.length ? lines.join('\\n') : null;
    }

  </script>
</html>`;
}

export function previewHtml(dataUrl: string): string {
    return `<!DOCTYPE html>
<html>
  <head>
    <title>deck.gl GeoJsonLayer Preview</title>

    <script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
    <script src='https://unpkg.com/maplibre-gl@3.6.0/dist/maplibre-gl.js'></script>

    <link href='https://unpkg.com/maplibre-gl@3.6.0/dist/maplibre-gl.css' rel='stylesheet' />
    <style type="text/css">
      body {
        width: 100vw;
        height: 100vh;
        margin: 0;
        overflow: hidden;
      }
      .deck-tooltip {
        font-family: Helvetica, Arial, sans-serif;
        padding: 6px !important;
        margin: 8px;
        max-width: 300px;
        font-size: 10px;
      }
    </style>
  </head>

  <body>
  </body>

  <script type="text/javascript">

    const {DeckGL, GeoJsonLayer} = deck;

    const geojsonLayer = new GeoJsonLayer({
      data: '${dataUrl}',
      opacity: 0.8,
      stroked: true,
      filled: true,
      extruded: false,
      pointType: 'circle',
      getPointRadius: 100,
      pointRadiusMinPixels: 3,
      pointRadiusMaxPixels: 20,
      getFillColor: [65, 182, 196, 180],
      getLineColor: [255, 255, 255],
      lineWidthMinPixels: 1,
      pickable: true
    });

    fetch('${dataUrl}')
      .then(r => r.json())
      .then(data => {
        const [minLng, minLat, maxLng, maxLat] = getBounds(data);
        const lngSpan = maxLng - minLng;
        const latSpan = maxLat - minLat;
        const maxSpan = Math.max(lngSpan, latSpan);
        const zoom = maxSpan > 0 ? Math.floor(-Math.log2(maxSpan / 360)) : 12;

        new DeckGL({
          mapStyle: 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json',
          initialViewState: {
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2,
            zoom: Math.min(Math.max(zoom, 1), 16),
            maxZoom: 20,
            pitch: 45
          },
          controller: true,
          layers: [geojsonLayer],
          getTooltip
        });
      });

    function getBounds(geojson) {
      let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
      function visit(coords) {
        if (typeof coords[0] === 'number') {
          minLng = Math.min(minLng, coords[0]);
          minLat = Math.min(minLat, coords[1]);
          maxLng = Math.max(maxLng, coords[0]);
          maxLat = Math.max(maxLat, coords[1]);
        } else {
          coords.forEach(visit);
        }
      }
      const features = geojson.features || [geojson];
      features.forEach(f => visit((f.geometry || f).coordinates));
      return [minLng, minLat, maxLng, maxLat];
    }

    function getTooltip({object}) {
      if (!object || !object.properties) return null;
      const props = object.properties;
      const lines = Object.entries(props)
        .filter(([, v]) => v != null)
        .map(([k, v]) => k + ': ' + v);
      return lines.length ? lines.join('\\n') : null;
    }

  </script>
</html>`;
}
