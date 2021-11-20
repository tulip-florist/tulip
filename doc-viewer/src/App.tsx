import React, { createContext, useState } from "react";
import { DocumentReaderView } from "./components/DocumentReaderView";
import { User } from "./types/types";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface IUserContext {
  user: User | null;
  setUser: (user: User | null) => void;
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
      <UserContext.Provider value={{ user, setUser: (user) => setUser(user) }}>
        <DocumentReaderView />
      </UserContext.Provider>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default App;
