import React, { useState, useRef, useEffect } from "react";
import location from "../../data/location.json";

export default function InfoWindow({ data, moveMap }) {
  const [category, setCategory] = useState("전체");
  const [listState, setListState] = useState(true);
  const listRef = useRef();
  const scrollRef = useRef();

  const cateScroll = () => {
    scrollRef.current.scrollTop = 0;
  };

  const cateChangeHandler = (e) => {
    setCategory(e.target.value);
    cateScroll();
    moveMap(e.target.value, 8);
  };

  const hospitalClickEvent = (address) => {
    moveMap(address, 5, "smooth");
  };

  return (
    <aside
      ref={listRef}
      className={`${
        listState ? "w-full md:w-96 pl-6" : "w-0"
      }  h-2/6 md:h-full py-0 md:py-5 bg-[rgba(255,255,255,0.8)] z-10 relative md:absolute transition-transform duration-150 ease-out`}
    >
      <div className={`${!listState ? "hidden" : ""} relative h-full`}>
        <select
          name=""
          id="locations"
          onChange={cateChangeHandler}
          className="h-fit-content rounded-lg text-center py-2 px-6 my-2 md:mb-5"
        >
          {location.map((x, i) => (
            <option value={x} key={i}>
              {x}
            </option>
          ))}
        </select>
        <div
          ref={scrollRef}
          className="h-[95%] overflow-y-scroll pr-6 border-t border-gray-200"
        >
          {data ? (
            <ul className="mb-5">
              {data &&
                data
                  .filter((x) =>
                    category === "전체" ? true : x.location === category
                  )
                  .map((item, idx) => (
                    <li
                      key={idx}
                      className="border-b border-gray-200 py-4 cursor-pointer"
                      onClick={() => hospitalClickEvent(item.address)}
                    >
                      <h3 className="text-lg font-semibold">
                        {item.title}
                        {item.reserve && (
                          <span className="text-primary ml-1 text-sm">
                            예약요망
                          </span>
                        )}
                      </h3>
                      <p className="mb-2">{item.address}</p>
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="black"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                          />
                        </svg>
                        <span className="ml-1">{item.phoneNumber}</span>
                      </div>
                      {item.memo && (
                        <p className="mt-2 py-2 px-1 rounded-md bg-slate-200 text-sm">
                          " {item.memo} "
                        </p>
                      )}
                    </li>
                  ))}
            </ul>
          ) : (
            <div data-testid="listEmpty">리스트가 없습니다.</div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setListState(!listState)}
        className="absolute top-[-40px] right-2/4 -rotate-90 md:rotate-0 md:top-2/4 md:right-[-30px] bg-white rounded-r-lg py-5 px-1"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`w-6 h-6 ${!listState && "md:-scale-x-100"}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
          />
        </svg>
      </button>
    </aside>
  );
}
