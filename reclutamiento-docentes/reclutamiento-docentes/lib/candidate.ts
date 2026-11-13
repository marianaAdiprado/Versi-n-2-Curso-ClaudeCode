import { getCandidate } from "./sheet";
import { verifyCandidateToken } from "./session";

export async function candidateFromToken(token: string) {
  const id = await verifyCandidateToken(token);
  if (!id) return null;
  return getCandidate(id);
}
