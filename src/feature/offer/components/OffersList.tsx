import { actions } from "astro:actions";
import Modal from "@core/components/Modal";
import Pagination from "@core/components/Pagination";
import { useCallback, useEffect, useRef, useState } from "react";
import OfferFilters, {
  type OfferFiltersState,
} from "./OfferFilters";

interface JobOffer {
  Id: string;
  CompanyName: string;
  JobTitle: string;
  Status: "Applied" | "Interview" | "Offer" | "Declined";
  CompanyPhone?: string | null;
  CompanyAddress?: string | null;
}

const STATUS_CLASSES: Record<string, string> = {
  Applied: "bg-blue-100 text-blue-700",
  Interview: "bg-yellow-100 text-yellow-700",
  Offer: "bg-green-100 text-green-700",
  Declined: "bg-red-100 text-red-700",
};

export default function OffersList() {
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<JobOffer | null>(null);
  const filtersRef = useRef<OfferFiltersState>({
    search: "",
    status: "",
    phoneValues: [],
    addressValues: [],
    phoneEmpty: false,
    addressEmpty: false,
    sortBy: "CreatedAt",
    sortOrder: "desc",
  });

  async function loadOffers(p: number, filters?: OfferFiltersState) {
    const f = filters ?? filtersRef.current;
    setLoading(true);
    const { data } = await actions.offer.list({
      page: p,
      pageSize: 10,
      status: f.status || undefined,
      search: f.search || undefined,
      phoneValues: f.phoneValues.length > 0 ? f.phoneValues : undefined,
      addressValues: f.addressValues.length > 0 ? f.addressValues : undefined,
      phoneEmpty: f.phoneEmpty || undefined,
      addressEmpty: f.addressEmpty || undefined,
      sortBy: f.sortBy,
      sortOrder: f.sortOrder,
    });
    if (data?.success) {
      setOffers(data.offers);
      setTotalPages(Math.ceil(data.total / data.pageSize));
      setPage(p);
    }
    setLoading(false);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only effect
  useEffect(() => {
    loadOffers(1);
  }, []);

  const handleFilterChange = useCallback(
    (filters: OfferFiltersState) => {
      filtersRef.current = filters;
      loadOffers(1, filters);
    },
    [],
  );

  async function handleDelete() {
    if (!deleteTarget) return;
    await actions.offer.delete({ id: deleteTarget.Id });
    setDeleteTarget(null);
    loadOffers(page);
  }

  return (
    <>
      <OfferFilters onFilterChange={handleFilterChange} />
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : offers.length === 0 ? (
        <p className="text-gray-500">
          No offers yet. Click "Add Offer" to get started.
        </p>
      ) : (
        <div className="space-y-4">
          {offers.map((o) => (
            <div
              key={o.Id}
              className="bg-white p-4 rounded-sm shadow-sm flex justify-between items-start"
            >
              <div>
                <h3 className="font-semibold">{o.CompanyName}</h3>
                <p className="text-sm text-gray-600">{o.JobTitle}</p>
                <span
                  className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-sm ${STATUS_CLASSES[o.Status] ?? ""}`}
                >
                  {o.Status}
                </span>
              </div>
              <div className="flex gap-2">
                <a
                  href={`/offer/${o.Id}`}
                  className="text-primary-600 hover:underline text-sm"
                >
                  View
                </a>
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700 text-sm"
                  onClick={() => setDeleteTarget(o)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => loadOffers(p)}
      />

      <Modal
        open={deleteTarget !== null}
        title="Delete Offer"
        message={`Are you sure you want to delete the offer from ${deleteTarget?.CompanyName}?`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
