export const NavBar = ({ children }: { children: React.ReactNode }) => {
  return (
    <nav className="bg-gray-100 border-b-2 border-gray-200 py-1 px-2">
      {children}
    </nav>
  );
};
