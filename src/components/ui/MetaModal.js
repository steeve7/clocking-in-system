import React from 'react'

export default function MetaModal({ open, children }) {
  if (!open) return null;
  return (
    <div>
      {children}
    </div>
  );
}
