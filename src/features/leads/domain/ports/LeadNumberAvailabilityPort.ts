export interface LeadNumberAvailabilityPort {
  isAvailable(leadNumber: string): Promise<boolean>;
}
