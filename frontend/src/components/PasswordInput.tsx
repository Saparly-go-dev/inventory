import { forwardRef, useState } from "react";

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement>;

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { style, ...props },
  ref
) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ position: "relative", width: "100%", overflow: "hidden", borderRadius: 8 }}>
      <input
        {...props}
        ref={ref}
        type={visible ? "text" : "password"}
        style={{ ...style, width: "100%", paddingRight: 52, boxSizing: "border-box" }}
      />
      <div
        style={{
          position: "absolute",
          right: 1,
          top: 1,
          bottom: 1,
          width: 42,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderTopRightRadius: 8,
          borderBottomRightRadius: 8,
          borderLeft: "1px solid var(--border-color)",
          background: "var(--bg-input)",
        }}
      >
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          title={visible ? "Hide password" : "Show password"}
          style={{
            border: "none",
            background: "transparent",
            color: "var(--text-muted)",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {visible ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12c.92-2.61 2.63-4.84 4.94-6.4"></path>
              <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83"></path>
              <path d="M9.88 5.09A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8a10.94 10.94 0 0 1-1.67 2.68"></path>
              <path d="M1 1l22 22"></path>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
});

export default PasswordInput;
