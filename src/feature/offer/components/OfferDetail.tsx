import { useState, useEffect, type FormEvent } from "react";

import Markdown from "markdown-to-jsx/react";
import { actions } from "astro:actions";

interface JobOffer {
  Id: string;
  CompanyName: string;
  JobTitle: string;
  Status: "Applied" | "Interview" | "Offer" | "Declined";
  Description: string | null;
  CompanyAddress: string | null;
  CompanyEmail: string | null;
  CompanyPhone: string | null;
  CvFileName: string | null;
  CreatedAt: Date | string;
  UpdatedAt: Date | string;
}

interface Change {
  Id: string;
  ChangedAt: Date | string;
  FieldName: string;
  OldValue: string | null;
  NewValue: string | null;
}

const STATUS_OPTIONS = ["Applied", "Interview", "Offer", "Declined"] as const;

const STATUS_CLASSES: Record<string, string> = {
  Applied: "bg-blue-100 text-blue-700",
  Interview: "bg-yellow-100 text-yellow-700",
  Offer: "bg-green-100 text-green-700",
  Declined: "bg-red-100 text-red-700",
};

export default function OfferDetail({ offerId }: { offerId: string }) {
  const [offer, setOffer] = useState<JobOffer | null>(null);
  const [changes, setChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [cvOpen, setCvOpen] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const { data } = await actions.offer.get({ id: offerId });
    if (data?.success) {
      setOffer(data.offer);
      setChanges(data.changes);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only
  }, []);

  async function handleStatusChange(status: JobOffer["Status"]) {
    await actions.offer.update({ id: offerId, status });
    load();
  }

  async function handleEditSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const { error: actionError } = await actions.offer.update({
      id: offerId,
      companyName: formData.get("companyName") as string,
      jobTitle: formData.get("jobTitle") as string,
      description: (formData.get("description") as string) || undefined,
      companyAddress: (formData.get("companyAddress") as string) || undefined,
      companyEmail: (formData.get("companyEmail") as string) || undefined,
      companyPhone: (formData.get("companyPhone") as string) || undefined,
    });
    if (actionError) {
      setError(actionError.message);
    } else {
      setEditOpen(false);
      load();
    }
  }

  async function handleCvUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fileInput = e.currentTarget.querySelector(
      "input[type=file]",
    ) as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      const { error: actionError } = await actions.offer.uploadCv({
        id: offerId,
        fileName: file.name,
        fileBase64: base64,
      });
      if (actionError) {
        setError(actionError.message);
      } else {
        setCvOpen(false);
        load();
      }
    };
    reader.readAsDataURL(file);
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!offer) return <p className="text-red-600">Offer not found.</p>;

  return (
    <>
      <div className="bg-white rounded-sm shadow-sm p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">{offer.CompanyName}</h1>
            <p className="text-gray-600">{offer.JobTitle}</p>
          </div>
          <span
            className={`inline-block px-3 py-1 text-sm rounded-sm ${STATUS_CLASSES[offer.Status]}`}
          >
            {offer.Status}
          </span>
        </div>

        <div className="space-y-3 mb-6">
          {offer.Description && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <Markdown className="prose-sm">{offer.Description}</Markdown>
            </div>
          )}
          {offer.CompanyEmail && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="text-sm">{offer.CompanyEmail}</p>
            </div>
          )}
          {offer.CompanyPhone && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Phone</h3>
              <p className="text-sm">{offer.CompanyPhone}</p>
            </div>
          )}
          {offer.CompanyAddress && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Address</h3>
              <p className="text-sm">{offer.CompanyAddress}</p>
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-gray-500">CV</h3>
            {offer.CvFileName ? (
              <a
                href={`/api/cv/${offer.Id}`}
                target="_blank"
                className="text-sm text-primary-600 hover:underline"
              >
                {offer.CvFileName}
              </a>
            ) : (
              <p className="text-sm text-gray-400">No CV uploaded</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleStatusChange(s)}
              className={`px-3 py-1 text-sm rounded-sm border ${
                offer.Status === s
                  ? "bg-primary-600 text-white border-primary-600"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="px-4 py-2 text-sm rounded-sm border border-gray-300 hover:bg-gray-50"
          >
            Edit Details
          </button>
          <button
            type="button"
            onClick={() => setCvOpen(true)}
            className="px-4 py-2 text-sm rounded-sm bg-primary-600 text-white hover:bg-primary-700"
          >
            {offer.CvFileName ? "Replace CV" : "Upload CV"}
          </button>
        </div>
      </div>

      {changes.length > 0 && (
        <div className="bg-white rounded-sm shadow-sm p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Change History</h2>
          <div className="space-y-3">
            {changes.map((c) => (
              <div key={c.Id} className="text-sm border-b pb-2">
                <span className="text-gray-500">
                  {new Date(c.ChangedAt).toLocaleString()}
                </span>
                <span className="ml-2 font-medium">{c.FieldName}</span>
                <span className="text-gray-400 ml-1">
                  {c.OldValue?.slice(0, 50) ?? "(empty)"}
                </span>
                <span className="mx-1">→</span>
                <span className="text-gray-700">
                  {c.NewValue?.slice(0, 50) ?? "(empty)"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {editOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          onClick={() => setEditOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setEditOpen(false);
          }}
        >
          <div
            className="bg-white rounded-sm shadow-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Edit Offer</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
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
                  defaultValue={offer.CompanyName}
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
                  defaultValue={offer.JobTitle}
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
                  defaultValue={offer.Description ?? ""}
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
                  defaultValue={offer.CompanyEmail ?? ""}
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
                  defaultValue={offer.CompanyPhone ?? ""}
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
                  defaultValue={offer.CompanyAddress ?? ""}
                  className="mt-1 block w-full border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-sm border border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => setEditOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-sm bg-primary-600 text-white hover:bg-primary-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cvOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          onClick={() => setCvOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setCvOpen(false);
          }}
        >
          <div
            className="bg-white rounded-sm shadow-lg p-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Upload CV</h2>
            <form onSubmit={handleCvUpload} className="space-y-4">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                required
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-sm border border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => setCvOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-sm bg-primary-600 text-white hover:bg-primary-700"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
