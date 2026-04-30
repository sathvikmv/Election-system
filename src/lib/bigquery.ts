import { BigQuery } from '@google-cloud/bigquery';

// Initialize BigQuery client
// This expects GOOGLE_APPLICATION_CREDENTIALS to be set in the environment
// pointing to a valid service account JSON file, or running within GCP
let bigqueryClient: BigQuery | null = null;

try {
  // Use the specific project ID the user requested
  bigqueryClient = new BigQuery({ projectId: 'just-rhythm-328816' });
} catch (e) {
  console.warn("Failed to initialize BigQuery client. Ensure credentials are set.");
}

export const DATASET_ID = 'election_navigator_analytics';
export const TABLE_ID = 'usage_logs';

export async function logAnalyticsEvent(
  eventType: string, 
  payload: Record<string, any>
) {
  if (!bigqueryClient) {
    console.warn(`[BigQuery Mock] ${eventType}:`, payload);
    return;
  }

  try {
    const dataset = bigqueryClient.dataset(DATASET_ID);
    const table = dataset.table(TABLE_ID);
    
    // Fire and forget
    await table.insert([{
      event_type: eventType,
      timestamp: new Date().toISOString(),
      payload: JSON.stringify(payload)
    }]);
  } catch (error: any) {
    // If the dataset/table doesn't exist, we just log to console.
    // In a real prod setup, Terraform or an init script would create these.
    console.error("BigQuery insertion failed:", error?.message);
  }
}
