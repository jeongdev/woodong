import React, { useState, useRef } from "react";

export default function InfoWindow({ data, moveMap }) {
  const [category, setCategory] = useState("전체");
  const location = [
    "전체",
    "서울",
    "경기",
    "인천",
    "대전",
    "충청",
    "대구",
    "울산",
    "부산",
    "경상도",
    "제주",
  ];
  const scrollRef = useRef();

  const cateScroll = () => {
    scrollRef.current.scrollTop = 0;
  };

  const cateChangeHandler = (e) => {
    setCategory(e.target.value);
    cateScroll();
    moveMap(e.target.value);
  };

  const hospitalClickEvent = (address) => {
    moveMap(address, "smooth");
  };

  return (
    <aside className="w-96 h-full py-5 pl-6 bg-[rgba(255,255,255,0.8)] z-10">
      <select
        name=""
        id=""
        onChange={cateChangeHandler}
        className="h-[5%] rounded-lg text-center py-2 px-6 mb-6"
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
                      <span className="text-indigo-700 ml-1 text-sm">
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
      </div>
    </aside>
  );
}
