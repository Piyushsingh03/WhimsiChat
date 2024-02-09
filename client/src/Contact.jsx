/* eslint-disable react/prop-types */
import Avatar from "./Avatar";

const Contact = ({ username, id, onClick, selected, online }) => {
  return (
    <div
      key={id}
      onClick={() => onClick(id)}
      className={
        " cursor-pointer flex items-center  border-b border-gray-100 gap-2  " +
        (selected ? "bg-blue-100" : "")
      }
    >
      {selected && <div className="w-1 bg-blue-500 h-12 rounded-r-md "></div>}
      <div className="flex items-center gap-2  py-2 pl-4">
        <Avatar online={online} username={username} userId={id} />
        <span className="text-gray-800">{username}</span>
      </div>
    </div>
  );
};

export default Contact;
