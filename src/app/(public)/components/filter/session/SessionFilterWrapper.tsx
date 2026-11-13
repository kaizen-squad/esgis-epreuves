import { useState } from "react";

const sessions = [
  { name: "Toutes", count: 10 },
  { name: "Normale", count: 4 },
  { name: "Rattrapage", count: 6 },
];

const SessionFilterWrapper = () => {
  const [currentSession, setCurrentSession] = useState("Toutes");
  return (
    <div className="bg-background-default flex rounded p-1">
      {sessions.map((session) => (
        <button
          onClick={() => setCurrentSession(session.name)}
          key={session.name}
          className={`flex min-w-0 flex-1 cursor-pointer flex-col rounded p-1 text-center ${currentSession == session.name ? "bg-background-accent text-text-primary" : ""}`}
        >
          <span className="w-full truncate text-sm">{session.name}</span>
          <span>{session.count}</span>
        </button>
      ))}
    </div>
  );
};

export default SessionFilterWrapper;
