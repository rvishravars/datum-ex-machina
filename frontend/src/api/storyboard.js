const API_BASE = "/api";

/**
 * Fetch the list of curated datasets from the backend.
 */
export async function getDatasets() {
  const response = await fetch(`${API_BASE}/datasets`);
  if (!response.ok) {
    throw new Error('Failed to fetch datasets');
  }
  return response.json();
}

/**
 * Fetch a specific dataset by ID.
 */
export async function getDataset(id) {
  const response = await fetch(`${API_BASE}/datasets/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch dataset: ${id}`);
  }
  return response.json();
}

/**
 * Analyze a dataset and return a narrative storyboard.
 * @param {string} id - Dataset ID
 * @param {Array} dataset - List of {x, y, label} points
 * @param {string} tier - "M" or "R"
 * @param {string} title - Dataset title
 * @param {string} unit - Measurement unit
 */
export async function analyzeDataset(id, dataset, tier, title, unit) {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id,
      dataset,
      tier,
      title,
      unit,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Analysis failed');
  }

  return response.json();
}
