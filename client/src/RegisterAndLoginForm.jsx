import { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "./UserContext";

const RegisterAndLoginForm = () => {
  const [fullname, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);
  const [isLoginOrRegister, setIsLoginOrRegister] = useState("register");
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const url = isLoginOrRegister === "register" ? "register" : "login";
    const { data } = await axios.post(url, {
      fullname,
      username,
      email,
      password,
    });

    setLoggedInUsername(username);
    setId(data.id);
  };

  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form
        onSubmit={handleSubmit}
        className="w-full mx-auto shadow-md sm:w-96 p-8 mb-12 bg-white"
      >
        {isLoginOrRegister === "register" ? (
          <h1 className="text-center mb-8 font-semibold text-2xl">Register</h1>
        ) : (
          <h1 className="text-center mb-8 font-semibold text-2xl">Login</h1>
        )}
        {isLoginOrRegister === "register" && (
          <div className="mb-4">
            <label
              htmlFor="fullname"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Full Name
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={fullname}
              onChange={(ev) => setFullName(ev.target.value)}
            />
          </div>
        )}
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Username
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={username}
            onChange={(ev) => setUsername(ev.target.value)}
          />
        </div>
        {isLoginOrRegister === "register" && (
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Email
            </label>
            <input
              type="email"
              className="w-full p-2 border rounded"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
            />
          </div>
        )}
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Password
          </label>
          <input
            type="password"
            className="w-full p-2 border rounded"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue active:bg-blue-800"
        >
          {isLoginOrRegister === "register" ? "Register" : "Login"}
        </button>
        <div
          className="text-center mt-2
    "
        >
          {isLoginOrRegister === "register" && (
            <div>
              Already a member?{" "}
              <button
                onClick={() => {
                  setIsLoginOrRegister("login");
                }}
                className="text-blue-500"
              >
                Login here
              </button>
            </div>
          )}

          {isLoginOrRegister === "login" && (
            <div>
              Not a member?{""}
              <button
                onClick={() => {
                  setIsLoginOrRegister("register");
                }}
                className="text-blue-500"
              >
                Create an account
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default RegisterAndLoginForm;
