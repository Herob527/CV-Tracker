import {
  type JobOffer,
  jobOfferChanges,
  jobOffers,
  type NewJobOffer,
} from "@db/schema";
import { and, eq, ilike, inArray, isNull, not, or, sql } from "drizzle-orm";
import type { drizzle } from "drizzle-orm/node-postgres";

type Drizzle = ReturnType<typeof drizzle>;

const PAGE_SIZE = 10;

export default class JobOfferService {
  #db;
  constructor(db: Drizzle) {
    this.#db = db;
  }

  async getOffersByOwnerId(
    ownerId: string,
    page: number,
    filters?: {
      status?: string;
      search?: string;
      phoneValues?: string[];
      addressValues?: string[];
      phoneEmpty?: boolean;
      addressEmpty?: boolean;
      sortBy?: "CompanyName" | "JobTitle" | "Status" | "CreatedAt";
      sortOrder?: "asc" | "desc";
    },
  ) {
    const offset = (page - 1) * PAGE_SIZE;
    const conditions = [eq(jobOffers.OwnerId, ownerId)];

    if (filters?.status) {
      conditions.push(
        eq(
          jobOffers.Status,
          filters.status as "Applied" | "Interview" | "Offer" | "Declined",
        ),
      );
    }
    if (filters?.search) {
      const pattern = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(jobOffers.CompanyName, pattern),
          ilike(jobOffers.JobTitle, pattern),
        )!,
      );
    }

    if (filters?.phoneValues && filters.phoneValues.length > 0) {
      const phoneConditions = [
        inArray(jobOffers.CompanyPhone, filters.phoneValues),
      ];
      if (filters.phoneEmpty) {
        phoneConditions.push(
          or(isNull(jobOffers.CompanyPhone), eq(jobOffers.CompanyPhone, ""))!,
        );
      }
      conditions.push(or(...phoneConditions)!);
    } else if (filters?.phoneEmpty) {
      conditions.push(
        or(isNull(jobOffers.CompanyPhone), eq(jobOffers.CompanyPhone, ""))!,
      );
    }

    if (filters?.addressValues && filters.addressValues.length > 0) {
      const addressConditions = [
        inArray(jobOffers.CompanyAddress, filters.addressValues),
      ];
      if (filters.addressEmpty) {
        addressConditions.push(
          or(
            isNull(jobOffers.CompanyAddress),
            eq(jobOffers.CompanyAddress, ""),
          )!,
        );
      }
      conditions.push(or(...addressConditions)!);
    } else if (filters?.addressEmpty) {
      conditions.push(
        or(isNull(jobOffers.CompanyAddress), eq(jobOffers.CompanyAddress, ""))!,
      );
    }

    const where = and(...conditions);

    const sortColumn = filters?.sortBy
      ? jobOffers[filters.sortBy]
      : jobOffers.CreatedAt;
    const sortDirection = filters?.sortOrder === "asc" ? sql`ASC` : sql`DESC`;

    const offers = await this.#db
      .select()
      .from(jobOffers)
      .where(where)
      .orderBy(sql`${sortColumn} ${sortDirection}`)
      .limit(PAGE_SIZE)
      .offset(offset);
    const [{ count }] = await this.#db
      .select({ count: sql<number>`count(*)::int` })
      .from(jobOffers)
      .where(where);
    return { offers, total: count, page, pageSize: PAGE_SIZE };
  }

  async getOfferById(id: string, ownerId: string) {
    const offer = await this.#db
      .select()
      .from(jobOffers)
      .where(and(eq(jobOffers.Id, id), eq(jobOffers.OwnerId, ownerId)))
      .limit(1);
    if (offer.length === 0) return null;
    return offer[0];
  }

  async createOffer(
    input: Omit<NewJobOffer, "Id" | "CreatedAt" | "UpdatedAt">,
  ) {
    try {
      const offer = await this.#db
        .insert(jobOffers)
        .values({ ...input })
        .returning();
      return { offer: offer[0], isError: false } as const;
    } catch {
      return { offer: null, isError: true } as const;
    }
  }

  async updateOffer(
    id: string,
    ownerId: string,
    updates: Partial<
      Pick<
        JobOffer,
        | "Status"
        | "CompanyName"
        | "JobTitle"
        | "Description"
        | "CompanyAddress"
        | "CompanyEmail"
        | "CompanyPhone"
        | "CvFileName"
        | "CvFile"
      >
    >,
  ) {
    const existing = await this.getOfferById(id, ownerId);
    if (!existing) return { offer: null, notFound: true } as const;

    try {
      const [updated] = await this.#db.transaction(async (tx) => {
        const TRACKABLE_FIELDS = new Set([
          "Status",
          "CompanyName",
          "JobTitle",
          "Description",
          "CompanyAddress",
          "CompanyEmail",
          "CompanyPhone",
          "CvFileName",
        ]);

        for (const [field, newValue] of Object.entries(updates)) {
          if (!TRACKABLE_FIELDS.has(field)) continue;
          const oldValue = existing[field as keyof JobOffer];
          if (oldValue !== newValue) {
            await tx.insert(jobOfferChanges).values({
              JobOfferId: id,
              FieldName: field,
              OldValue: String(oldValue ?? ""),
              NewValue: String(newValue ?? ""),
            });
          }
        }

        return tx
          .update(jobOffers)
          .set({ ...updates, UpdatedAt: new Date() })
          .where(eq(jobOffers.Id, id))
          .returning();
      });

      return { offer: updated, notFound: false } as const;
    } catch {
      return { offer: null, notFound: false } as const;
    }
  }

  async deleteOffer(id: string, ownerId: string) {
    const existing = await this.getOfferById(id, ownerId);
    if (!existing) return { notFound: true } as const;
    try {
      await this.#db.delete(jobOffers).where(eq(jobOffers.Id, id));
      return { notFound: false } as const;
    } catch {
      return { notFound: false } as const;
    }
  }

  async getOfferChanges(offerId: string) {
    return this.#db
      .select()
      .from(jobOfferChanges)
      .where(eq(jobOfferChanges.JobOfferId, offerId))
      .orderBy(sql`${jobOfferChanges.ChangedAt} DESC`);
  }

  async getFilterValues(ownerId: string) {
    const phones = await this.#db
      .selectDistinct({ value: jobOffers.CompanyPhone })
      .from(jobOffers)
      .where(
        and(
          eq(jobOffers.OwnerId, ownerId),
          not(
            or(isNull(jobOffers.CompanyPhone), eq(jobOffers.CompanyPhone, ""))!,
          ),
        ),
      );

    const addresses = await this.#db
      .selectDistinct({ value: jobOffers.CompanyAddress })
      .from(jobOffers)
      .where(
        and(
          eq(jobOffers.OwnerId, ownerId),
          not(
            or(
              isNull(jobOffers.CompanyAddress),
              eq(jobOffers.CompanyAddress, ""),
            )!,
          ),
        ),
      );

    return {
      phones: phones.map((r) => r.value).filter(Boolean) as string[],
      addresses: addresses.map((r) => r.value).filter(Boolean) as string[],
    };
  }
}
