interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const neighbors = 2;
  const pages: (number | "...")[] = [];

  pages.push(1);

  const start = Math.max(2, currentPage - neighbors);
  const end = Math.min(totalPages - 1, currentPage + neighbors);

  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push("...");

  if (totalPages > 1) pages.push(totalPages);

  return (
    <div className="flex justify-center gap-2 mt-8">
      {pages.map((p, i) =>
        p === "..." ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: ellipsis is static
          <span key={`ellipsis-${i}`} className="px-2">
            ...
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={`px-3 py-1 rounded-sm border ${
              p === currentPage ? "bg-primary-600 text-white" : ""
            }`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ),
      )}
    </div>
  );
}
