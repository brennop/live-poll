import { useCallback, useEffect, useMemo, useState } from "react";

import { useRouter } from "next/router";
import Head from "next/head";

import supabase from "../lib/supabase";

import JSConfetti from 'js-confetti'

const Reaction = ({ emojis, onSend }: {
  emojis: string[],
  onSend: (emojis: string[]) => void
}) => {
  const [emoji] = emojis;

  return <button
    onClick={() => onSend(emojis)}
    className="bg-gray-800 text-gray-100 rounded-lg px-4 py-2">
    {emoji}
  </button>
}


export default function Room() {
  const { room } = useRouter().query;

  const confetti = useMemo(() => {
    if (typeof window !== 'undefined') {
      return new JSConfetti()
    }
  }, []);

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

  const addConfetti = useCallback((emojis: string[]) => {
    confetti?.addConfetti({
      emojis: emojis,
      confettiNumber: 1,
    })
  }, [confetti])


  useEffect(() => {
    const handleReaction = ({ payload }: any) => {
      addConfetti(payload);
    }

    channel.on("broadcast", { event: "reaction" }, handleReaction);

    return () => {
      channel.off("broadcast", handleReaction);
    };
  }, [channel, addConfetti]);

  const handleVote = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    channel.track({ data: { vote: value } });
  };

  const sendEmoji = (emojis: string[]) => {
    channel.send({ type: "broadcast", event: "reaction", payload: emojis });
    addConfetti(emojis);
  };

  return (
    <div className="bg-gray-900">
      <Head>
        <title>autopoll - {`${room}`}</title>
      </Head>

      <div className="h-screen mx-auto max-w-md grid gap-6 py-16 grid-rows-2">
        <div className="grid bg-black/50 rounded-lg relative pb-1">
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
              className="-translate-y-4 peer-checked:-translate-y-1 transition-all ease-in-out duration-150 peer-checked:bg-emerald-600 bg-emerald-500 rounded-lg grid place-items-center cursor-pointer relative border-emerald-300 border-2"
              htmlFor="yes"
            >
              <div
                style={{ height: `${yesVotes * 100}%` }}
                className="h-full w-full bottom-0 rounded-lg absolute bg-black/10 transition-all -z-10"
              />
              <div className="text-center">
                <p className="text-5xl text-emerald-100">Yes 👍</p>
                <p className="text-2xl text-emerald-100">
                  {(yesVotes * 100).toFixed(0)}%
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="grid bg-black/50 rounded-lg relative pb-1">
          <div className="grid bg-rose-900 rounded-lg relative">
            <input
              type="radio"
              name="radio"
              value="no"
              onChange={handleVote}
              className="hidden peer"
              id="no"
            />
            <label
              className="-translate-y-4 peer-checked:-translate-y-1 transition-all ease-in-out duration-150 peer-checked:bg-rose-600 bg-rose-500 rounded-lg grid place-items-center cursor-pointer relative border-rose-400 border-2"
              htmlFor="no"
            >
              <div
                style={{ height: `${noVotes * 100}%` }}
                className="h-full w-full bottom-0 rounded-lg absolute bg-black/10 transition-all -z-10"
              />
              <div className="text-center">
                <p className="text-5xl text-rose-100">No 👎</p>
                <p className="text-2xl text-rose-100">
                  {(noVotes * 100).toFixed(0)}%
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex gap-2 items-start justify-around">
          <Reaction emojis={["🤮", "🤢"]} onSend={sendEmoji} />
          <Reaction emojis={["🙅‍♂️", "🙅‍♀️"]} onSend={sendEmoji} />
          <Reaction emojis={["🍑"]} onSend={sendEmoji} />
          <Reaction emojis={["😍"]} onSend={sendEmoji} />
          <Reaction emojis={["🤓"]} onSend={sendEmoji} />
          <Reaction emojis={["🧓", "👵"]} onSend={sendEmoji} />
        </div>
      </div>
    </div>
  );
}
