const Avatar = ({ username, userId, online }) => {
  const colors = [
    "bg-teal-200",
    "bg-purple-200",
    "bg-lime-200",
    "bg-emerald-200",
    "bg-green-200",
    "bg-violet-200",
    "bg-red-200",
    "bg-sky-200",
    "bg-blue-200",
    "bg-amber-200",
    "bg-indigo-200",
    "bg-yellow-200",
    "bg-cyan-200",
  ];

  const userIdbase10 = parseInt(userId, 16);
  const colorIndex = userIdbase10 % colors.length;
  const color = colors[colorIndex];

  return (
    <div
      className={
        "w-9 h-9 relative rounded-full flex items-center shadow-md " + color
      }
    >
      {online && (
        <div className="w-full text-center opacity-70">{username[0]}</div>
      )}
      {online && (
        <div className="absolute w-2 h-2 bg-green-500 bottom-0 right-0 rounded-full border border-white"></div>
      )}
      {!online && (
        <div className="absolute w-2 h-2 bg-gray-500 bottom-0 right-0 rounded-full border border-white"></div>
      )}
    </div>
  );
};

export default Avatar;
