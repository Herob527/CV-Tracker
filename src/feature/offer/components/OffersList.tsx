import { actions } from "astro:actions";
import Modal from "@core/components/Modal";
import Pagination from "@core/components/Pagination";
import { useCallback, useEffect, useRef, useState } from "react";

interface JobOffer {
  Id: string;
  CompanyName: string;
  JobTitle: string;
  Status: "Applied" | "Interview" | "Offer" | "Declined";
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
  const [statusFilter, setStatusFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  async function loadOffers(
    p: number,
    status?: string,
    search?: string,
  ) {
    setLoading(true);
    const { data } = await actions.offer.list({
      page: p,
      pageSize: 10,
      status: status || undefined,
      search: search || undefined,
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

  function handleStatusChange(newStatus: string) {
    setStatusFilter(newStatus);
    loadOffers(1, newStatus, searchFilter);
  }

  function handleSearchChange(newSearch: string) {
    setSearchFilter(newSearch);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadOffers(1, statusFilter, newSearch);
    }, 300);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await actions.offer.delete({ id: deleteTarget.Id });
    setDeleteTarget(null);
    loadOffers(page, statusFilter, searchFilter);
  }

  return (
    <>
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Search company or title..."
          value={searchFilter}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All statuses</option>
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Declined">Declined</option>
        </select>
      </div>
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
        onPageChange={(p) => loadOffers(p, statusFilter, searchFilter)}
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
