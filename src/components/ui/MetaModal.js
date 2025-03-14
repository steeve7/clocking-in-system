import React from 'react'

export default function MetaModal({ open, close, children }) {
  if (!open) return null;
  return (
    <div>
      <button onClick={close} className="text-[20px]">
        x
      </button>
      {children}
    </div>
  );
}
