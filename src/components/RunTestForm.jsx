import React, { useState } from "react";
import { useTests } from "../context/TestContext";
import { runAgent } from "../api";



export default function CenteredRunTestsForm({onGenerate, onBack}) {
  const { setTests } = useTests();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    let payload;
    try {
      payload = JSON.parse(value);
    } catch {
      payload = { input: value };
    }

    try {
      const res = await runAgent("test_user","8163984337155391488",value);
      // console.log("Response:", res);

      onGenerate();
      // Safely extract testcases
      let testcases = [];
      if (res.agentResponse) {
        const parsed = res.agentResponse.find(r => r.parsed_testcases);
        if (parsed && parsed.parsed_testcases && parsed.parsed_testcases.testcases) {
          testcases = parsed.parsed_testcases.testcases;
        }
      }

      setTests(testcases);
      setStatus("success");
      setMessage("Tests initialized successfully.");
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Small message/header area */}
        <div className="flex flex-col items-center text-center mb-6">
          <div
            className="
              h-12 w-12 rounded-full
              bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500
              shadow-lg flex items-center justify-center
            "
            aria-hidden="true"
          >
            <span className="text-white text-lg font-semibold">AI</span>
          </div>
          <h2 className="mt-3 text-xl font-semibold text-slate-900 dark:text-slate-100">
            Automating Test Case Generation with AI
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Convert healthcare requirements into compliant, traceable test cases.
          </p>
        </div>

        {/* Input shell */}
        <form
          onSubmit={handleSubmit}
          className="w-full"
          aria-busy={status === "loading"}
        >
          <div
            className="
              flex items-center gap-2
              rounded-full border border-slate-200 dark:border-slate-700
              bg-white dark:bg-slate-900
              shadow-lg
              px-3 py-2 md:px-4 md:py-3
              focus-within:ring-2 focus-within:ring-blue-500
              focus-within:ring-offset-2 focus-within:ring-offset-white
              dark:focus-within:ring-offset-slate-900
            "
          >
            <input
              type="text"
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Type prompt or paste JSON..."
              className="
                flex-1 bg-transparent outline-none
                text-slate-900 dark:text-slate-100
                placeholder:text-slate-400 dark:placeholder:text-slate-500
                text-base md:text-lg
              "
            />

            <button
              type="submit"
              disabled={status === "loading"}
              className="
                shrink-0 rounded-full
                bg-blue-600 hover:bg-blue-700
                text-white
                px-4 py-2 md:px-5 md:py-2.5
                shadow-md
                focus:outline-none
                focus-visible:ring-2 focus-visible:ring-blue-500
                focus-visible:ring-offset-2 focus-visible:ring-offset-white
                dark:focus-visible:ring-offset-slate-900
                disabled:opacity-60
              "
            >
              {status === "loading" ? "Submitting..." : "Submit"}
            </button>
          </div>

          {message && (
            <div
              className={`mt-3 text-sm ${
                status === "error" ? "text-red-600" : "text-green-600"
              }`}
              role="status"
              aria-live="polite"
            >
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
