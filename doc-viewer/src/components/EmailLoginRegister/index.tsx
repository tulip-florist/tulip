import { useForm } from "react-hook-form";
import { AuthFormValues } from "../../types/types";

export const EmailLoginRegister = ({
  onRegister,
  onLogin,
  onSubmitError,
}: {
  onRegister: (args: { email: string; password: string }) => void;
  onLogin: (args: { email: string; password: string }) => void;
  onSubmitError: (args: { toastMessage: JSX.Element }) => void;
}) => {
  const { register, handleSubmit } = useForm<AuthFormValues>();
  const handleLogin = (data: AuthFormValues) => {
    onLogin({ ...data });
  };
  const handleRegister = (data: AuthFormValues) => {
    onRegister({ ...data });
  };
  const handleError = (errors: any) => {
    let toastMessage = (
      <>
        {errors.email && (
          <p>
            <b>email:</b> {errors.email.message}
          </p>
        )}
        {errors.password && (
          <p>
            <b>password:</b> {errors.password.message}
          </p>
        )}
      </>
    );
    onSubmitError({ toastMessage });
  };

  const buttonStyle1 =
    "bg-pink-500 hover:bg-pink-700 font-bold text-sm text-white py-1 px-2 rounded";
  const buttonStyle2 =
    "align-baseline font-bold text-sm text-green-400 text-white py-1 px-2 rounded hover:text-green-600";
  const whitePadding = {
    backgroundClip: "padding-box",
    backgroundColor: "white",
  };

  const emailFieldOptions = {
    required: {
      value: true,
      message: "is required",
    },
    pattern: {
      value: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      message: "is invalid",
    },
  };

  const passwordFieldOptions = {
    required: {
      value: true,
      message: "is required",
    },
    minLength: {
      value: 8,
      message: "minimum length is 8",
    },
    maxLength: {
      value: 64,
      message: "maximum length is 64",
    },
  };

  return (
    <div className="inline-block">
      <div className="inline-block">
        <form onSubmit={handleSubmit(handleRegister, handleError)}>
          <div
            className="inline-block pl-1 mr-1 border-2 border-gray-250"
            style={whitePadding}
          >
            <input
              type="text"
              placeholder="Email"
              autoComplete="username"
              {...register("email", emailFieldOptions)}
            />
          </div>
          <div
            className="inline-block pl-1 border-2 border-gray-250"
            style={whitePadding}
          >
            <input
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              {...register("password", passwordFieldOptions)}
            />
          </div>
          <button
            type="button"
            onClick={handleSubmit(handleLogin, handleError)}
            className={buttonStyle2}
          >
            Login
          </button>
          <button type="submit" className={buttonStyle1}>
            Register
          </button>
        </form>
      </div>
    </div>
  );
};
