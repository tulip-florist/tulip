import { useState } from "react";

export const EmailLoginRegister = ({
  onRegister,
  onLogin,
}: {
  onRegister: (args: { email: string; password: string }) => void;
  onLogin: (args: { email: string; password: string }) => void;
}) => {
  const formInputClass =
    "inline-block w-sm text-gray-700 text-sm leading-tight shadow appearance-none border focus:outline-none focus:shadow-outline py-1 px-1";
  const labelClass = "inline-block text-gray-500 text-sm font-bold mr-1";
  const buttonStyle1 =
    "bg-pink-500 hover:bg-pink-700 font-bold text-sm text-white py-1 px-2 rounded";
  const buttonStyle2 =
    "align-baseline font-bold text-sm text-green-400 text-white py-1 px-2 rounded hover:text-green-600";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="inline-block">
      <div className="inline-block">
        <div className="inline-block mr-2">
          <label className={labelClass} htmlFor="form-email">
            Email
          </label>
          <input
            className={formInputClass}
            id="form-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="inline-block">
          <label className={labelClass} htmlFor="form-password">
            Password
          </label>
          <input
            className={formInputClass}
            id="form-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <div className="inline-block ml-2 space-x-1">
        <button
          onClick={() => onRegister({ email, password })}
          className={buttonStyle1}
        >
          Register
        </button>
        <button
          onClick={() => onLogin({ email, password })}
          className={buttonStyle2}
        >
          Login
        </button>
      </div>
    </div>
  );
};
