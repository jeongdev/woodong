export function Search({ labelTxt, placeholder, onChange, onSubmit }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit();
  };

  const handleEnter = (event) => {
    if (event.key !== "Eenter") return;
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <label
        htmlFor="keyword"
        className="mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        {labelTxt}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>
        <input
          type="search"
          onChange={onChange}
          onKeyDown={handleEnter}
          id="keyword"
          className="block w-full mt-2 py-4 pl-10 pr-20 text-sm text-gray-900 border border-gray-300 rounded-lg  focus:ring-primary focus:border-primary "
          placeholder={placeholder}
          maxLength={30}
          required
        />
        <button
          type="submit"
          className="text-white absolute right-2.5 bottom-2.5 bg-primary hover:bg-primaryFocused focus:ring-4 focus:outline-none focus:ring-primaryFocused font-medium rounded-lg text-sm px-4 py-2 "
        >
          Search
        </button>
      </div>
    </form>
  );
}
