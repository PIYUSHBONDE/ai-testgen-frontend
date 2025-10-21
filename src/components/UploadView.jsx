import React, { useState, useCallback, useRef } from "react";
import { CloudUpload, File, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Button, Alert, IconButton } from "./ui";
import { uploadFile, runAgent } from "../api";
import MessageCard from "./MessageCard";

const ProgressStep = ({ label, active }) => (
  <div
    className={`flex items-center gap-3 ${
      active ? "text-emerald-600" : "text-slate-500"
    }`}
  >
    <div
      className={`w-3 h-3 rounded-full ${
        active ? "bg-emerald-600" : "bg-slate-300"
      }`}
    />
    <div className="text-sm">{label}</div>
  </div>
);

export default function UploadView({ onNext }) {
  const fileInputRef = useRef(null);
  const [state, setState] = useState("idle"); // idle | uploading | analyzing | extracting | grouping | done
  const [recent] = useState([
    { id: 1, name: "ECG Report Analysis", when: "2 days ago" },
    { id: 2, name: "MRI Safety Checks", when: "1 week ago" },
  ]);

  const payload = {
    testcases: [
      {
        id: "TC-LAB-001",
        title: "Create and Place a New Laboratory Order",
        preconditions: [
          "A clinician is logged into the system.",
          "A patient record is open.",
        ],
        steps: [
          "1. Navigate to the 'Laboratory Orders' section for the patient.",
          "2. Select a diagnostic test from the available list.",
          "3. Fill in any required information for the order (e.g., diagnosis code, notes).",
          "4. Click 'Submit' or 'Place Order'.",
          "5. Verify that the system confirms the order has been placed successfully.",
          "6. Check the patient's record to ensure the new lab order is listed in their order history.",
        ],
        expected:
          "The system must allow a clinician to successfully order a diagnostic test for a patient, and the order must be recorded in the patient's history.",
        risk: "high",
        regulatory_refs: ["IEC 62304", "sample_healthcare_requirements.txt"],
        rationale:
          "This test validates the core functionality of the laboratory ordering feature. A failure here would mean clinicians cannot order necessary tests, directly impacting patient care.",
      },
      {
        id: "TC-LAB-002",
        title: "Verify Integration with External Laboratory Systems",
        preconditions: [
          "A laboratory order has been successfully placed in the system.",
          "A connection to a mock or test external laboratory system is configured.",
        ],
        steps: [
          "1. Place a new laboratory order for a patient.",
          "2. Monitor the interface or logs for the external laboratory system.",
          "3. Verify that the order is transmitted correctly via an HL7 v2 message.",
          "4. Check that all data fields in the HL7 message (patient ID, test code, ordering clinician) are accurate.",
          "5. Ensure the message is acknowledged (ACK) by the receiving system.",
        ],
        expected:
          "The system must correctly format and transmit the laboratory order to the external lab system using the HL7 v2 messaging standard.",
        risk: "high",
        regulatory_refs: ["HL7 v2", "sample_healthcare_requirements.txt"],
        rationale:
          "Interoperability is critical for seamless healthcare delivery. This test ensures that orders are communicated accurately to the lab, preventing delays, lost orders, or incorrect tests from being performed.",
      },
      {
        id: "TC-LAB-003",
        title: "Verify Immutable Audit Log for Laboratory Orders",
        preconditions: [
          "A user with the appropriate permissions is logged in.",
          "At least one laboratory order has been created.",
        ],
        steps: [
          "1. Create a new laboratory order.",
          "2. Navigate to the system's audit trail or log viewer.",
          "3. Filter the logs for the recent action.",
          "4. Verify that an audit log entry was created for the 'create' action.",
          "5. Ensure the log entry contains the user ID, a timestamp, the action performed ('create'), the object type ('lab order'), and a unique identifier for the order.",
          "6. Attempt to edit or delete the audit log entry through any available interface.",
          "7. Confirm that the audit log entry cannot be altered or deleted.",
        ],
        expected:
          "All actions related to laboratory orders must be recorded in an immutable audit trail. The log entry must be complete and tamper-proof.",
        risk: "medium",
        regulatory_refs: [
          "21 CFR Part 11",
          "HIPAA",
          "sample_healthcare_requirements.txt",
        ],
        rationale:
          "For regulatory compliance and patient safety, it is essential to have a complete and unalterable history of all actions taken. This ensures accountability and allows for forensic analysis if an issue arises.",
      },
    ],
  };

  const gridStyle = {
    display: "flex",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 16,
  };

  const onDrop = useCallback(async (e) => {
    e.preventDefault();
    setState("uploading");

    const files = e.dataTransfer?.files || e.target?.dataTransfer;
    if (!files || files.length === 0) return;

    try {
      const uploadRes = await uploadFile(
        "test_user",
        "8163984337155391488",
        files[0]
      );
      // console.log("Upload response:", uploadRes);

      if (uploadRes.status !== "success") {
        throw new Error(uploadRes.detail || "Upload failed");
      }

      setState("analyzing");

      // Step 2: Call runAgent with gs_url
      const message = `Please add this document to the Requirements Corpus: ${uploadRes.gs_url}`;
      const agentRes = await runAgent(
        "test_user",
        "8163984337155391488",
        message
      );

      // console.log("Agent response:", agentRes);

      // Simulate progress like before
      setTimeout(() => setState("extracting"), 1200);
      setTimeout(() => setState("grouping"), 2400);
      setTimeout(() => setState("done"), 3600);
    } catch (err) {
      console.error(err);
      setState("idle");
      alert("File upload failed");
    }
  }, []);

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        {/* Dropzone */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 text-center bg-white/40 dark:bg-slate-900/60"
        >
          <div className="flex flex-col items-center gap-4">
            <motion.div
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 }}
            >
              <CloudUpload
                size={48}
                className="text-slate-600 dark:text-slate-300"
              />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.08 }}
              className="text-xl font-semibold text-slate-800 dark:text-slate-100"
            >
              Drag & drop files here
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.12 }}
              className="text-sm text-slate-500 dark:text-slate-400"
            >
              PDFs, Word docs, or plain text — we'll analyze and extract
              requirements.
            </motion.p>

            <div className="mt-3">
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                className="hidden"
                onChange={(e) =>
                  onDrop({
                    preventDefault: () => {},
                    dataTransfer: { files: e.target.files },
                  })
                }
              />
              <label htmlFor="file-upload">
                <Button
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                >
                  Browse Files
                </Button>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Progress Section */}
        <div className="mt-6">
          <AnimatePresence>
            {state !== "idle" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                  <ProgressStep
                    label="Uploading"
                    active={
                      state === "uploading" ||
                      state === "analyzing" ||
                      state === "extracting" ||
                      state === "grouping" ||
                      state === "done"
                    }
                  />
                  <ProgressStep
                    label="Analyzing"
                    active={
                      state === "analyzing" ||
                      state === "extracting" ||
                      state === "grouping" ||
                      state === "done"
                    }
                  />
                  <ProgressStep
                    label="Extracting"
                    active={
                      state === "extracting" ||
                      state === "grouping" ||
                      state === "done"
                    }
                  />
                  <ProgressStep
                    label="Grouping"
                    active={state === "grouping" || state === "done"}
                  />
                </div>

                <div className="flex items-center justify-center gap-3">
                  {state === "uploading" && (
                    <Loader2 className="animate-spin" />
                  )}
                  {state === "analyzing" && <File />}
                  {state === "done" && (
                    <div className="text-emerald-600">Analysis complete</div>
                  )}
                  <div className="text-sm text-slate-500">{state}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {state === "done" && (
          <div className="mt-6 flex justify-end">
            <Button onClick={onNext}>Next: Feature Selection →</Button>
          </div>
        )}

        {/* Recent + Tips */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-3">Recent Projects</h3>
            <div className="space-y-3">
              {recent.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/60 shadow-soft flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-sm text-slate-500">{r.when}</div>
                  </div>
                  <div className="text-sm text-slate-400">Open</div>
                </div>
              ))}
            </div>
          </div>

          <aside className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/60 shadow-soft">
            <h4 className="font-semibold">Tips</h4>
            <div className="mt-3 space-y-3">
              <Alert>
                Drag documents onto the upload area or click Browse.
              </Alert>
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  We support PDF/Word/TXT and will extract requirements
                  automatically.
                </div>
                <IconButton>?</IconButton>
              </div>
              <div className="text-sm">
                Use Compliance Mode for stricter traceability rules.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
