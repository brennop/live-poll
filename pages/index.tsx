import type { NextPage } from "next";
import Head from "next/head";
import { useRef } from "react";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const inputRef = useRef<HTMLInputElement>(null!);

  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { value } = inputRef.current;
    // change route to /room
    router.push(`/${value}`);
  };
  return (
    <div className="bg-gray-900 h-screen grid place-items-center">
      <Head>
        <title>autopoll</title>
        <meta name="description" content="Live voting" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col justify-center items-center">
        <h1 className="text-6xl text-center text-white">autopoll</h1>

        <form className="flex flex-col gap-4 my-4" onSubmit={handleSubmit}>
          <label>
            <p className="text-2xl text-center text-white mb-2">
              Enter a room name:
            </p>
            <input
              className="w-96 h-12 rounded-lg bg-gray-800 text-white p-2"
              ref={inputRef}
            />
          </label>
          <button className="w-96 h-12 rounded-lg bg-gray-800 text-white p-2">
            go
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;
