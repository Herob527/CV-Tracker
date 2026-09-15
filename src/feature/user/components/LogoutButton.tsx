import { actions } from "astro:actions";

export default function LogoutButton() {
  async function handleLogout() {
    await actions.user.logout();
    window.location.href = "/login";
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="text-gray-500 hover:text-red-600 text-sm"
    >
      Logout
    </button>
  );
}
