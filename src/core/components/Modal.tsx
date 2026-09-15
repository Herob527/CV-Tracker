interface ModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function Modal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
}: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
      onKeyDown={(e) => {
        if (e.key === "Escape") onCancel();
      }}
    >
      <ModalContent
        title={title}
        message={message}
        confirmLabel={confirmLabel}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </div>
  );
}

function ModalContent({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: Omit<ModalProps, "open">) {
  return (
    <div
      className="bg-white rounded-sm shadow-lg p-6 max-w-sm w-full mx-4"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-sm text-gray-600 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="px-4 py-2 rounded-sm border border-gray-300 text-gray-700 hover:bg-gray-50"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded-sm bg-red-600 text-white hover:bg-red-700"
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
