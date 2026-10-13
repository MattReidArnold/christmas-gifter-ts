import { baseUrl } from '#tests/support/api-client';

export default async function setup() {
  try {
    const response = await fetch(`${baseUrl}/health`, {
      signal: AbortSignal.timeout(3_000),
    });
    if (!response.ok) {
      throw new Error(`responded with ${response.status}`);
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Integration tests need a running API at ${baseUrl} (GET /health: ${reason}). ` +
        'Start it with `npm run dev` or `docker compose up`, or set API_BASE_URL.'
    );
  }
}
