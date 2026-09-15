import { actions } from "astro:actions";
import { type FormEvent, useState } from "react";

export default function LoginForm() {
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const { error: actionError } = await actions.user.login({
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      });

      if (actionError) {
        setError(actionError.message);
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setError("An error occurred");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="mt-1 block w-full border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          className="mt-1 block w-full border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        className="w-full bg-primary-600 text-white py-2 rounded-sm hover:bg-primary-700"
      >
        Login
      </button>
    </form>
  );
}
