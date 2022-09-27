import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import supabase from "../lib/supabase";

import { RadioGroup } from "@headlessui/react";

export default function Room() {
  const { room } = useRouter().query;

  const channel = useMemo(() => {
    return supabase
      .channel(`room:${room}`, {
        broadcast: { ack: true },
      })
      .subscribe((status: any) => console.log(status));
  }, [room]);

  const [state, setState] = useState<Array<"yes" | "no">>([]);

  const noVotes = useMemo(
    () => state.filter((vote) => vote === "no").length / state.length || 0,
    [state]
  );

  const yesVotes = useMemo(
    () => state.filter((vote) => vote === "yes").length / state.length || 0,
    [state]
  );

  useEffect(() => {
    const handlePresence = () => {
      const presence = channel.presenceState();
      setState(Object.values(presence).map((item) => item.at(0)?.data?.vote));
    };

    channel
      .on("presence", { event: "sync" }, handlePresence)
      .on("presence", { event: "leave" }, handlePresence);

    return () => {
      channel.off("presence", handlePresence);
    };
  }, [channel]);

  const handleVote = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    channel.track({ data: { vote: value } });
  };

  return (
    <div className="h-screen w-screen grid grid-cols-1 gap-4 p-6 bg-gray-900 sm:grid-cols-2">
      <div className="grid bg-emerald-900 rounded-lg">
        <input
          type="radio"
          name="radio"
          value="yes"
          onChange={handleVote}
          className="hidden peer"
          id="yes"
        />
        <label
          className="-translate-y-3 peer-checked:-translate-y-1 transition-all ease-in-out duration-150 peer-checked:bg-emerald-400 bg-emerald-500 rounded-lg grid place-items-center cursor-pointer relative"
          htmlFor="yes"
        >
          <div style={{ height: `${yesVotes * 100}%` }} className="h-full w-full bottom-0 rounded-lg absolute bg-black/10 transition-all -z-10" />
          <div className="text-center">
            <p className="text-5xl text-gray-900">Yes</p>
            <p className="text-3xl text-white m-2">{yesVotes * 100}%</p>
          </div>
        </label>
      </div>

      <div className="grid bg-rose-900 rounded-lg">
        <input
          type="radio"
          name="radio"
          value="no"
          onChange={handleVote}
          className="hidden peer"
          id="no"
        />
        <label
          className="-translate-y-3 peer-checked:-translate-y-1 transition-all ease-in-out duration-150 peer-checked:bg-rose-500 bg-rose-600 rounded-lg grid place-items-center cursor-pointer relative"
          htmlFor="no"
        >
          <div style={{ height: `${noVotes * 100}%` }} className="h-full w-full bottom-0 rounded-lg absolute bg-black/10 transition-all -z-10" />
          <div className="text-center">
            <p className="text-5xl text-gray-900">no</p>
            <p className="text-3xl text-white m-2">{noVotes * 100}%</p>
          </div>
        </label>
      </div>
    </div>
  );
}