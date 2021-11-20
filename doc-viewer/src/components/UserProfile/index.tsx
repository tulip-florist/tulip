import { User } from "../../types/types";

export const UserProfile = ({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) => {
  return (
    <div className="inline-block space-x-1">
      <span className="text-sm font-bold">Logged in as:</span>
      <span className="text-sm">{user.email}</span>
      <button
        className="bg-pink-500 hover:bg-pink-700 font-bold text-sm text-white py-1 px-2 rounded"
        onClick={onLogout}
      >
        Log out
      </button>
    </div>
  );
};
