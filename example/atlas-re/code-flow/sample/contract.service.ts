// contract.service.ts — ANONYMIZED sample for the /code-flow example. NOT from any real codebase.
// Simplified representative shape of a "bind submission into a contract" flow.
export interface Quote { premium: number; bound: boolean }
export interface DB {
  submissions: { findById(id: string): Promise<{ status: string }> };
  contracts: { insert(row: Record<string, unknown>): Promise<string> };
}
export interface EventBus { publish(topic: string, payload: unknown): Promise<void> }
export interface PricingService { rate(submissionId: string): Promise<Quote> }

export class ContractService {
  constructor(
    private db: DB,
    private bus: EventBus,
    private pricing: PricingService,
  ) {}

  /** Bind a quoted submission into a BOUND contract. Returns the new contract id. */
  async bindContract(submissionId: string, userId: string): Promise<string> {
    await this.assertCanBind(submissionId);                      // [A] guard
    const quote = await this.pricing.rate(submissionId);         // [B] price
    if (!quote.bound) throw new Error("submission not quotable");
    const contractId = await this.db.contracts.insert({          // [C] persist
      submissionId,
      premium: quote.premium,
      status: "BOUND",
      createdBy: userId,
    });
    await this.bus.publish("contract.bound", { contractId, submissionId }); // [D] event
    return contractId;
  }

  private async assertCanBind(submissionId: string): Promise<void> {
    const sub = await this.db.submissions.findById(submissionId);
    if (sub.status !== "QUOTED") throw new Error("submission not in QUOTED state");
  }
}
