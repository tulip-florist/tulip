import React from "react";

interface Props {
  status: boolean | null;
}

export const SyncStatus = ({ status }: Props) => {
  return (
    <div className="flex space-x-1 items-center">
      <span className="text-sm text-gray-400">Sync status:</span>
      {status ? (
        <div className="rounded-full h-3 w-3 bg-green-600" />
      ) : (
        <span className="flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-purple-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
        </span>
      )}
    </div>
  );
};
