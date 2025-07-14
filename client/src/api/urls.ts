import axios from "./axios";

/**
 * Capitalizes the first letter of a string and lowercases the rest.
 * @param s - Input string to capitalize.
 * @returns The capitalized string.
 */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/**
 * Represents a URL record returned from the API.
 */
export type URLRow = {
  id: number;
  url: string;
  status: string;
  lastUpdated: string;
};

/**
 * Payload shape for adding a new URL.
 */
export interface AddURLRequest {
  url: string;
}

/**
 * Fetches all URLs from the backend.
 * Transforms API fields into camelCase and formats date & status.
 * @returns Promise resolving to an array of URLRow.
 */
export async function fetchURLs(): Promise<URLRow[]> {
  const res = await axios.get("/urls");
  const urls = res.data;

  return urls.map((item: any) => ({
    id: item.ID, // Note: backend uses uppercase keys
    url: item.URL,
    status: capitalize(item.Status), // Capitalize status string
    lastUpdated: new Date(item.UpdatedAt).toLocaleString(), // Format date for display
  }));
}

/**
 * Starts processing for the given URL IDs.
 * @param urlIDs - Array of URL IDs to start processing.
 * @returns Axios promise.
 */
export async function startProcessing(urlIDs: number[]) {
  return axios.post("/admin/urls/start", { url_ids: urlIDs });
}

/**
 * Stops processing for the given URL IDs.
 * @param urlIDs - Array of URL IDs to stop processing.
 * @returns Axios promise.
 */
export async function stopProcessing(urlIDs: number[]) {
  return axios.post("/admin/urls/stop", { url_ids: urlIDs });
}

/**
 * Adds a new URL to the backend.
 * @param data - Object containing the URL to add.
 * @returns Promise resolving to the added URLRow.
 */
export async function addURL(data: AddURLRequest): Promise<URLRow> {
  const response = await axios.post("/admin/urls", data);
  return response.data;
}

/**
 * Deletes a URL by its ID.
 * @param id - The ID of the URL to delete.
 * @returns Promise resolving when deletion is complete.
 */
export async function deleteURL(id: number): Promise<void> {
  await axios.delete(`/admin/urls/${id}`);
}

/**
 * Fetches link type statistics for a given URL ID.
 * @param urlId - The URL ID to fetch stats for.
 * @returns Promise resolving to an object with internal and external link counts.
 */
export async function fetchLinkTypeStats(
  urlId: number
): Promise<{ internal: number; external: number }> {
  const res = await axios.get(`/urls/${urlId}/link-count`);
  return res.data;
}

/**
 * Fetches broken links for a given URL ID.
 * @param urlId - The URL ID to fetch broken links for.
 * @returns Promise resolving to an array of broken link objects with href and status code.
 */
export async function fetchBrokenLinks(
  urlId: number
): Promise<{ href: string; status_code: number }[]> {
  const res = await axios.get(`/urls/${urlId}/broken-links`);
  return res.data;
}
