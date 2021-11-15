import React, { createContext, useState } from "react";
import { DocumentReaderView } from "./components/DocumentReaderView";
import { User } from "./types/types";

interface IUserContext {
  user: User | null;
  setUser: (user: User) => void;
}

export const UserContext = createContext<IUserContext>({
  user: null,
  setUser: () => {
    throw new Error("user context not initialised yet");
  },
});

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  return (
    <div className="h-screen w-screen">
      <UserContext.Provider
        value={{ user, setUser: (user: User) => setUser(user) }}
      >
        <DocumentReaderView />
      </UserContext.Provider>
    </div>
  );
};

export default App;
