/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable no-unused-vars */
import { useContext, useEffect, useRef, useState } from "react";

import Logo from "./Logo";
import { UserContext } from "./UserContext";
import _ from "lodash";
import axios from "axios";
import Contact from "./Contact";

const ChatPage = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { username, id, setId, setUsername } = useContext(UserContext);
  const [newMsgText, setNewMsgText] = useState("");
  const [messages, setMessages] = useState([]);
  const [offlinePeople, setOfflinePeople] = useState({});
  const divUnder = useRef();

  useEffect(() => {
    connectToWS();
  }, []);

  const connectToWS = () => {
    const wss = new WebSocket("ws://localhost:4000");
    setWs(wss);

    wss.addEventListener("message", handleMessage);
    wss.addEventListener("close", () => {
      setTimeout(() => {
        console.log("Disconnected. Trying to reconnect...");
        connectToWS();
      }, 2000);
    });
  };

  const showOnlinePeople = (peopleArray) => {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  };

  const handleMessage = (ev) => {
    const msgData = JSON.parse(ev.data);
    if ("online" in msgData) {
      showOnlinePeople(msgData.online);
    } else if ("text" in msgData) {
      if (msgData.sender === selectedUserId) {
        setMessages((prev) => [
          ...prev,
          {
            ...msgData,
          },
        ]);
      }
    }
  };

  const sendMsg = (ev, file = null) => {
    if (ev) ev.preventDefault();

    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMsgText,
        file,
      })
    );
    setNewMsgText("");
    setMessages((prev) => [
      ...prev,
      {
        text: newMsgText,
        sender: id,
        recipient: selectedUserId,
        _id: Date.now(),
      },
    ]);
    if (file) {
      axios.get("/messages/" + selectedUserId).then((res) => {
        setMessages(res.data);
      });
    }
  };

  const sendFile = (ev) => {
    const reader = new FileReader();
    reader.readAsDataURL(ev.target.files[0]);
    reader.onload = () => {
      sendMsg(null, {
        name: ev.target.files[0].name,
        data: reader.result,
      });
    };
  };

  const logout = () => {
    axios.post("/logout").then(() => {
      setWs(null);
      setId(null);
      setUsername(null);
    });
  };

  useEffect(() => {
    const div = divUnder.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  useEffect(() => {
    axios.get("/people").then((res) => {
      const offlinePeopleArr = res.data
        .filter((p) => p._id !== id)
        .filter((p) => !Object.keys(onlinePeople).includes(p._id));
      const offlinePeople = {};
      offlinePeopleArr.forEach((p) => {
        offlinePeople[p._id] = p;
      });

      setOfflinePeople(offlinePeople);
    });
  }, [onlinePeople]);

  useEffect(() => {
    if (selectedUserId) {
      axios.get("/messages/" + selectedUserId).then((res) => {
        setMessages(res.data);
      });
    }
  }, [selectedUserId]);

  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[id];

  const msgWithoutDupes = _.uniqBy(messages, "_id");
  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3 flex flex-col">
        <div className="flex-grow">
          <Logo />
          {Object.keys(onlinePeopleExclOurUser).map((userId) => (
            <Contact
              key={userId}
              id={userId}
              online={true}
              username={onlinePeopleExclOurUser[userId]}
              onClick={() => setSelectedUserId(userId)}
              selected={userId === selectedUserId}
            />
          ))}
          {Object.keys(offlinePeople).map((userId, index) => (
            <Contact
              key={userId}
              id={userId}
              online={false}
              username={offlinePeople[userId].username}
              onClick={() => setSelectedUserId(userId)}
              selected={userId === selectedUserId}
            />
          ))}
        </div>
        <div className="p-2 text-center flex items-center justify-between">
          <span className="mr-2 flex gap-2 items-center">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path
                  fillRule="evenodd"
                  d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            {username}
          </span>
          <div className=" cursor-pointer flex items-center bg-blue-200 p-3 rounded-md  shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
              />
            </svg>

            <button onClick={logout} className="text-lg text-black">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col bg-blue-100 w-2/3 p-2">
        <div className="flex-grow ">
          {!selectedUserId && (
            <div className="flex items-center justify-center h-full flex-grow">
              <div className="text-2xl text-gray-400">
                &larr; Select Chat Here
              </div>
            </div>
          )}
          {!!selectedUserId && (
            <div className="relative h-full ">
              <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                {msgWithoutDupes.map((message, index) => (
                  <div
                    className={
                      message.sender === id ? "text-right" : "text-left"
                    }
                    key={index}
                  >
                    <div
                      className={
                        "text-left inline-block p-2 my-2 rounded-md text-sm " +
                        (message.sender === id
                          ? "bg-blue-500 text-white "
                          : "bg-white text-gray-500")
                      }
                    >
                      {message.sender === id ? "ME:" : ""}
                      {message.text}

                      {message.file && (
                        <div>
                          <a
                            target="_blank"
                            className="flex items-center border-b gap-1"
                            href={
                              axios.defaults.baseURL +
                              "/uploads/" +
                              message.file
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {message.file}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={divUnder}></div>
              </div>
            </div>
          )}
        </div>

        {!!selectedUserId && (
          <form className="flex gap-2 " onSubmit={sendMsg}>
            <label
              type="button"
              className="bg-blue-500 p-2 text-white rounded-md border-blue-300"
            >
              <input type="file" className="hidden" onChange={sendFile} />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path
                  fillRule="evenodd"
                  d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z"
                  clipRule="evenodd"
                />
              </svg>
            </label>
            <input
              type="text"
              value={newMsgText}
              onChange={(ev) => setNewMsgText(ev.target.value)}
              placeholder="Type a message"
              className="p-2 bg-white border flex-grow rounded-sm"
            />
            <button
              type="submit"
              className="bg-blue-500 p-2 text-white rounded-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
