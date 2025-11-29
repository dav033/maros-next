import type { LeadNumberAvailabilityPort } from "@/leads";
import type { HttpClientLike } from "@/shared";
import { optimizedApiClient } from "@/shared";

import { endpoints } from "./endpoints";

type ValidateLeadNumberDTO = Readonly<{ valid: boolean }>;

export class LeadNumberAvailabilityHttpService
  implements LeadNumberAvailabilityPort
{
  constructor(private readonly api: HttpClientLike = optimizedApiClient) {}

  async isAvailable(leadNumber: string): Promise<boolean> {
    if (!leadNumber) return true;
    const { data } = await this.api.get<ValidateLeadNumberDTO>(
      endpoints.validateLeadNumber(leadNumber)
    );
    return !!data?.valid;
  }
}
