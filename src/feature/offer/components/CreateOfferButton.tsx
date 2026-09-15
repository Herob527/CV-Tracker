import { useState, type FormEvent } from "react";
import { actions } from "astro:actions";
import Modal from "@core/components/Modal";

export default function CreateOfferButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const fileInput = e.currentTarget.querySelector(
      "input[type=file]",
    ) as HTMLInputElement;
    const file = fileInput?.files?.[0];

    let cvFileName: string | undefined;
    let cvFileBase64: string | undefined;

    if (file) {
      cvFileName = file.name;
      cvFileBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(file);
      });
    }

    try {
      const { error: actionError } = await actions.offer.create({
        companyName: formData.get("companyName") as string,
        jobTitle: formData.get("jobTitle") as string,
        description: (formData.get("description") as string) || undefined,
        companyAddress: (formData.get("companyAddress") as string) || undefined,
        companyEmail: (formData.get("companyEmail") as string) || undefined,
        companyPhone: (formData.get("companyPhone") as string) || undefined,
        cvFileName,
        cvFileBase64,
      });

      if (actionError) {
        setError(actionError.message);
      } else {
        window.location.reload();
      }
    } catch {
      setError("An error occurred");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-primary-600 text-white px-4 py-2 rounded-sm hover:bg-primary-700"
      >
        + Add Offer
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <div
            className="bg-white rounded-sm shadow-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">New Job Offer</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label
                  htmlFor="jobTitle"
                  className="block text-sm font-medium text-gray-700"
                >
                  Job Title
                </label>
                <input
                  type="text"
                  id="jobTitle"
                  name="jobTitle"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label
                  htmlFor="companyEmail"
                  className="block text-sm font-medium text-gray-700"
                >
                  Company Email
                </label>
                <input
                  type="email"
                  id="companyEmail"
                  name="companyEmail"
                  className="mt-1 block w-full border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label
                  htmlFor="companyPhone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Company Phone
                </label>
                <input
                  type="text"
                  id="companyPhone"
                  name="companyPhone"
                  className="mt-1 block w-full border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label
                  htmlFor="companyAddress"
                  className="block text-sm font-medium text-gray-700"
                >
                  Company Address
                </label>
                <input
                  type="text"
                  id="companyAddress"
                  name="companyAddress"
                  className="mt-1 block w-full border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  CV (optional)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-sm border border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-sm bg-primary-600 text-white hover:bg-primary-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
