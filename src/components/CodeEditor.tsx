"use client";

import { useRef, useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  initialCode: string;
  language?: string;
}

type OutputLine = { type: "stdout" | "stderr" | "info"; text: string };

export default function CodeEditor({
  initialCode,
  language = "python",
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [running, setRunning] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);
  const pyodideRef = useRef<unknown>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Load Pyodide lazily
  useEffect(() => {
    let cancelled = false;
    async function loadPy() {
      if (typeof window === "undefined") return;
      try {
        // Dynamically load pyodide from CDN
        if (!(window as Window & { loadPyodide?: unknown }).loadPyodide) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src =
              "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load Pyodide"));
            document.head.appendChild(script);
          });
        }
        const pyodide = await (
          window as unknown as {
            loadPyodide: (opts: { indexURL: string }) => Promise<unknown>;
          }
        ).loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/",
        });
        if (!cancelled) {
          pyodideRef.current = pyodide;
          setPyodideReady(true);
        }
      } catch {
        if (!cancelled) {
          setPyodideReady(false);
        }
      }
    }
    loadPy();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  async function runCode() {
    if (running || !pyodideReady) return;
    setRunning(true);
    setOutput([]);

    const lines: OutputLine[] = [];

    try {
      const py = pyodideRef.current as {
        runPythonAsync: (code: string) => Promise<unknown>;
        setStdout: (opts: { batched: (s: string) => void }) => void;
        setStderr: (opts: { batched: (s: string) => void }) => void;
      };

      py.setStdout({
        batched: (s: string) => {
          lines.push({ type: "stdout", text: s });
          setOutput([...lines]);
        },
      });
      py.setStderr({
        batched: (s: string) => {
          lines.push({ type: "stderr", text: s });
          setOutput([...lines]);
        },
      });

      await py.runPythonAsync(code);
      lines.push({ type: "info", text: "✓ Done" });
      setOutput([...lines]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      lines.push({ type: "stderr", text: msg });
      setOutput([...lines]);
    } finally {
      setRunning(false);
    }
  }

  function resetCode() {
    setCode(initialCode);
    setOutput([]);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {/* Editor */}
      <div className="monaco-editor-container" style={{ minHeight: 280 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 16px",
            background: "#161b22",
            borderBottom: "1px solid #30363d",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#ff5f57",
                display: "inline-block",
              }}
            />
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#ffbd2e",
                display: "inline-block",
              }}
            />
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#28c840",
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontSize: "0.75rem",
                color: "#6e7681",
                marginLeft: 8,
              }}
            >
              main.py
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={resetCode}
              title="Reset to starter code"
              style={{
                background: "none",
                border: "1px solid #30363d",
                borderRadius: 5,
                padding: "3px 10px",
                cursor: "pointer",
                color: "#8b949e",
                fontSize: "0.75rem",
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#e6edf3";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#8b949e";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#8b949e";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#30363d";
              }}
            >
              Reset
            </button>
            <button
              onClick={runCode}
              disabled={running || !pyodideReady}
              style={{
                background: pyodideReady ? "#238636" : "#21262d",
                border: "none",
                borderRadius: 5,
                padding: "3px 14px",
                cursor: pyodideReady && !running ? "pointer" : "not-allowed",
                color: pyodideReady ? "#fff" : "#6e7681",
                fontSize: "0.75rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "background 0.15s",
                minWidth: 70,
                justifyContent: "center",
              }}
            >
              {running ? (
                <>
                  <Spinner />
                  Running
                </>
              ) : !pyodideReady ? (
                <>
                  <Spinner />
                  Loading…
                </>
              ) : (
                <>
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="currentColor"
                  >
                    <polygon points="0,0 10,5 0,10" />
                  </svg>
                  Run
                </>
              )}
            </button>
          </div>
        </div>
        <Editor
          height="260px"
          defaultLanguage={language}
          value={code}
          onChange={(v) => setCode(v ?? "")}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily:
              '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            renderLineHighlight: "line",
            padding: { top: 12, bottom: 12 },
            tabSize: 4,
            wordWrap: "on",
          }}
        />
      </div>

      {/* Output */}
      <div
        ref={outputRef}
        style={{
          background: "#0d1117",
          border: "1px solid #21262d",
          borderRadius: 8,
          padding: "12px 16px",
          minHeight: 72,
          maxHeight: 200,
          overflowY: "auto",
          fontFamily:
            '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
          fontSize: "0.8125rem",
          lineHeight: "1.6",
        }}
      >
        {output.length === 0 ? (
          <span style={{ color: "#6e7681" }}>Output will appear here…</span>
        ) : (
          output.map((line, i) => (
            <div
              key={i}
              style={{
                color:
                  line.type === "stderr"
                    ? "#f85149"
                    : line.type === "info"
                    ? "#3fb950"
                    : "#e6edf3",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {line.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: "spin 0.8s linear infinite" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="31.4"
        strokeDashoffset="10"
        strokeLinecap="round"
      />
    </svg>
  );
}
