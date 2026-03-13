# Carto test

This is the implementation of requirements:

- Spatial Objects: converts the BigQuery results to GeoJSON format
- Vector Tiles: Fetch individual Mapbox Vector Tiles from a BigQuery tileset table by z/x/y coordinates

The API is live here:

https://carto.backlogmd.com/

I've created a couple of preview screens (please don't review this code):

- https://carto.backlogmd.com/preview/spatial-objects
- https://carto.backlogmd.com/preview/tiles

## About the test

I think the test makes some assumptions regarding knowledge, and I understand that it’s on purpose to see how we handle certain gaps. Some of these gaps will be mentioned in the known limitations. There’s a long list of domain concepts I learned during the journey, like WKT/WKB/EWKT/MVT — this is where AI really helps a lot these days.

So overall, I enjoyed the test. Solving problems while learning is one of the things I enjoy the most.

## Known limitations

- About the specific point mentioned in the document regarding limits and browser memory: I feel like I might have missed something here. I hard-limited the API response to avoid throwing millions of objects at the browser, but it’s the best approach, maybe I should send chunks of data or use SSE. I’ve read about deck.gl optimizations (https://deck.gl/docs/developer-guide/performance) and there are some ideas, but I preferred to keep the implementation simple and be honest about the trade-offs. There’s definitely room for improvement here.
- There are some points I’d like to improve before this goes to prod:
  - Metrics / observability: per endpoint latency and dependencies latency (bigquery at least)


## API

Full specification in [`docs/openapi.yaml`](docs/openapi.yaml).

## Requirements

- **Node.js >= 24** (see `.nvmrc` for the exact version)
- **Google Cloud Application Default Credentials (ADC)** -- The API authenticates with BigQuery using ADC. Set up credentials before running:

  ```bash
  gcloud auth application-default login
  ```

  On GCE/GKE, the service account metadata is used automatically. You can also point `GOOGLE_APPLICATION_CREDENTIALS` to a service account key file.

## Setup

```bash
# Clone the repo
git clone <repo-url> && cd tiles

# Use the correct Node version
nvm use

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env and set GOOGLE_CLOUD_PROJECT to your GCP project ID (optional if ADC can infer it)
```

## Running

```bash
# Development (hot reload)
npm run dev

# Production
npm run build
npm start
```

The server listens on `0.0.0.0:3003` by default. Override with `HOST` and `PORT` environment variables.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_CLOUD_PROJECT` | No | Inferred from ADC | GCP project ID for BigQuery queries |
| `HOST` | No | `0.0.0.0` | Server listen address |
| `PORT` | No | `3003` | Server listen port |

## Testing

```bash
# Run tests once
npm test

# Watch mode
npm run test:watch
```

