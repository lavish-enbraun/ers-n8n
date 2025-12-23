/**
 * Fetches all items from an API endpoint using pagination
 * Handles API limits (500) by making multiple requests if needed
 * 
 * @param helpers - The n8n helpers object (e.g., this.helpers)
 * @param context - The context object (usually 'this' from the node)
 * @param credentialName - The name of the credential to use for authentication
 * @param apiUrl - The base URL for the API endpoint (without query parameters)
 * @param totalItemsNeeded - Total number of items to fetch (null/undefined = fetch all)
 * @param itemsPath - Path to the items array in the response (default: 'data')
 * @returns Promise<Array> - Array of all fetched items
 */
export async function fetchAllItems<T = any>(
	helpers: any,
	context: any,
	credentialName: string,
	apiUrl: string,
	totalItemsNeeded: number | null | undefined = null,
	itemsPath: string = 'data'
): Promise<T[]> {
	const LIMIT = 500;
	let offset = 0;
	let results: T[] = [];
	let batch: T[] = [];

	do {
		const currentLimit = totalItemsNeeded !== null && totalItemsNeeded !== undefined
			? Math.min(LIMIT, totalItemsNeeded - results.length)
			: LIMIT;

		const url = `${apiUrl}?offset=${offset}&limit=${currentLimit}`;

		const response = await helpers.httpRequestWithAuthentication.call(
			context,
			credentialName,
			{
				method: 'GET',
				url: url,
				headers: {
					'Accept': 'application/json',
				},
			}
		);

		batch = Array.isArray(response)
			? response
			: (response[itemsPath] || []);

		if (!Array.isArray(batch)) {
			throw new Error(`Response does not contain an array of items at path: ${itemsPath}`);
		}

		// Merge items
		results = results.concat(batch);

		offset += currentLimit;


		if (totalItemsNeeded !== null && totalItemsNeeded !== undefined && results.length >= totalItemsNeeded) {
			break;
		}

	} while (batch.length === LIMIT);

	if (totalItemsNeeded !== null && totalItemsNeeded !== undefined) {
		return results.slice(0, totalItemsNeeded);
	}

	return results;
}
