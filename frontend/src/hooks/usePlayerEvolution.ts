import { useApiGet, type UseApiGetResult } from "./useApiGet";
import type { PlayerEvolutionResponse } from "../types/evolution";

export function usePlayerEvolution(
  playerId: number | string | undefined | null,
): UseApiGetResult<PlayerEvolutionResponse> {
  const path: string | null =
    playerId !== undefined && playerId !== null
      ? `/players/${playerId}/evolution`
      : null;
  return useApiGet<PlayerEvolutionResponse>(path);
}
