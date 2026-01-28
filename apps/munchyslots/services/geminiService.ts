import { FilterState, RestaurantResult } from "../types";

export class RecommendationApiError extends Error {
  code?: string;
  status?: number;
}

export const getRestaurantRecommendation = async (
  filters: FilterState,
): Promise<RestaurantResult> => {
  const response = await fetch("/api/recommendation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
  });

  if (!response.ok) {
    let payload: any = null;
    try {
      payload = await response.json();
    } catch {
      // ignore
    }

    const err = new RecommendationApiError(
      payload?.error?.message ||
        `Failed to get recommendation (HTTP ${response.status}).`,
    );
    err.code = payload?.error?.code;
    err.status = response.status;
    throw err;
  }

  return (await response.json()) as RestaurantResult;
};
