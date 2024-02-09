import { useContext } from "react";
import RegisterAndLoginForm from "./RegisterAndLoginForm";
import { UserContext } from "./UserContext";
import ChatPage from "./ChatPage";

const Routes = () => {
  const { username, id } = useContext(UserContext);

  if (username) {
    return <ChatPage />;
  }

  return (
    <>
      <RegisterAndLoginForm />
    </>
  );
};

export default Routes;
