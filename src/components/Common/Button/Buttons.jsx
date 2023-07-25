import React from "react";

export function DefaultButtons({ txt }) {
  return (
    <button
      type="button"
      className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primaryFocused focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      {txt}
    </button>
  );
}

export function CancelButtons({ txt }) {
  return (
    <button
      type="button"
      className="text-sm font-semibold leading-6 text-gray-900"
    >
      {txt}
    </button>
  );
}
