import React, { useCallback, useEffect, useState, useRef } from "react";
import { DefaultButtons, CancelButtons } from "../Common/Button/Buttons";
import { firestore } from "../../firebase/firebase";
import { Search } from "../Common/Search/Search";
import useMap from "../../hooks/useMap";

const { kakao } = window;
export default function Report() {
  const mapContainer = useRef(null);
  const [keyword, setKeyword] = useState("");
  const [item, setItem] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [pagination, setPagination] = useState({
    last: 1,
    current: 1,
  });
  const [form, setForm] = useState({
    group: "",
    placeId: "",
    content: "",
    address: "",
    roadAddress: "",
    hospitalName: "",
    user: "user1",
    email: "",
    image: "",
  });
  const { kakaoMap, displayMarkerByAddress, searchDisplayMarker } =
    useMap(mapContainer);

  const onChangeHandler = useCallback(
    (event) => {
      setForm((prevState) => ({
        ...prevState,
        [event.target.name]: event.target.value,
      }));
    },
    [form]
  );

  const selectMarkerHandler = (info) => {
    setSelectedMarker(info);
  };

  const displayPlaces = (places) => {
    if (!places || places.length === 0) {
      displayMarkerByAddress(null);
      return;
    }
    let menuEl = document.getElementById("menu_wrap");
    let bounds = new kakao.maps.LatLngBounds();

    removeAllChildNods();
    setItem(places);

    searchDisplayMarker(places, keyword, selectedMarker);

    places.map((item, i) => {
      const placePosition = new kakao.maps.LatLng(item.y, item.x);
      bounds.extend(placePosition);
    });
    menuEl.scrollTop = 0;
    kakaoMap.setBounds(bounds);
  };

  const removeAllChildNods = () => {
    setItem([]);
  };

  const refrashDataHandler = () => {
    setForm({
      group: "",
      placeId: "",
      content: "",
      address: "",
      roadAddress: "",
      hospitalName: "",
      user: "user1",
      email: "",
      image: "",
    });
    setKeyword("");
    removeAllChildNods();
  };

  const reportHandler = (event) => {
    const {
      group,
      placeId,
      content,
      address,
      roadAddress,
      hospitalName,
      user,
      email,
      image,
    } = form;

    if (!placeId) {
      alert("제보하고 싶은 병원을 선택해 주세요");
      return;
    }
    if (group.indexOf("동물병원") < 0) {
      alert("선택된 장소가 동물병원인지 확인해주세요.");
      return;
    }
    if (!group || !placeId || !address || !roadAddress || !hospitalName) {
      alert("필수 항목이 입력되지 않았습니다.");
      return;
    }

    const params = {
      content,
      address,
      hospitalName,
      user: "user1",
      email: "abcd@gmail.com",
      image,
    };

    try {
      firestore.collection("report").add(params);
      alert("완료되었습니다.");
      refrashDataHandler();
    } catch (error) {
      throw error;
    }
  };

  function displayPagination(pagination) {
    setPagination(pagination);
  }

  const placesSearchCB = (data, status, pagination) => {
    if (status === kakao.maps.services.Status.OK) {
      displayPlaces(data);
      displayPagination(pagination);
    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
      removeAllChildNods();
      displayPlaces([]);
      return;
    } else if (status === kakao.maps.services.Status.ERROR) {
      alert("검색 결과 중 오류가 발생했습니다.");
      return;
    }
  };

  const setSelectMarkerHandler = () => {
    const { category_name, id, place_name, road_address_name, address_name } =
      selectedMarker;

    setForm((prev) => ({
      ...prev,
      group: category_name,
      placeId: id,
      address: address_name,
      roadAddress: road_address_name,
      hospitalName: place_name,
    }));
  };

  const searchPlaces = () => {
    const ps = new kakao.maps.services.Places();

    if (!keyword.replace(/^\s+|\s+$/g, "")) {
      removeAllChildNods();
      displayPlaces([]);
      return;
    }

    ps.keywordSearch(keyword, placesSearchCB);
  };

  const searchOnchangeHandler = useCallback((event) => {
    event.preventDefault();
    setKeyword(event.target.value);
  }, []);

  useEffect(() => {
    if (!selectedMarker) return;
    setSelectMarkerHandler();
  }, [selectedMarker]);

  return (
    <article className="mx-auto max-w-5xl items-center p-6 lg:px-8">
      <h2 className="text-xl">제보하기</h2>
      <p className="mt-3 text-sm leading-6 text-gray-600">
        woodong에 없는 내가 아는 파충류 진료병원이 있다면 알려주세요.
      </p>
      <p className="text-sm leading-6 text-gray-600">제보는 큰 힘이 됩니다.</p>

      <div className="col-span-full mt-10">
        <label
          htmlFor="content"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          제보할 병원에 대해 알려주세요.
        </label>
        <div className="mt-2">
          <textarea
            id="content"
            name="content"
            rows={3}
            placeholder="알게 되신 경로나, 병원에 대해 말씀해주세요 (휴무, 예약유무 등)"
            className="block w-full placeholder:text-xs resize-none rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
            value={form.content}
            onChange={onChangeHandler}
            required
          />
        </div>
      </div>

      <div className="col-span-full mt-5 rounded-md border-0 overflow-hidden">
        <Search
          value={keyword}
          labelTxt="제보할 병원을 알려주세요."
          placeholder="검색어를 입력하세요"
          onChange={(e) => searchOnchangeHandler(e)}
          onSubmit={() => searchPlaces()}
        />

        <div className="block w-full resize-none rounded-md border-0 py-1.5 md:px-3 mt-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6  p-px">
          <article
            ref={mapContainer}
            id="map"
            className="w-full h-96 mt-3 outline-1"
          >
            <div
              id="menu_wrap"
              className="absolute flex flex-col justify-around z-10 bg-[rgba(255,255,255,0.8)] w-1/4 overflow-hidden h-full"
            >
              {item.length > 0 ? (
                <ul id="placesList" className="h-[90%] overflow-y-scroll">
                  {item.map((item, index) => (
                    <li
                      key={item.id}
                      className={`p-4 border-b ${
                        selectedMarker?.id === item.id ? "bg-slate-200" : ""
                      }`}
                      onClick={() => selectMarkerHandler(item)}
                    >
                      <span className={`markerbg marker_${index + 1}`}></span>
                      <div className="info">
                        <h5 className="mb-2 text-sm">{item.place_name}</h5>

                        <div className="mb-1">
                          {item.road_address_name ? (
                            <>
                              <span className="text-xs">
                                도로명: {item.road_address_name}
                              </span>
                              <br />
                              <span className="text-xs">
                                지번: {item.address_name}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs">{item.address_name}</span>
                          )}
                        </div>
                        {item.phone && (
                          <div className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="black"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-4 h-4 mr-1"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                              />
                            </svg>
                            <span className="text-xs">{item.phone}</span>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="h-[90%] text-xs px-3">결과가 없습니다</p>
              )}
              <div className="flex justify-center">
                {Array.from({ length: pagination.last }, (v, i) => i + 1).map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={(e) => pagination.gotoPage(e.target.textContent)}
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            </div>
          </article>

          <label
            htmlFor="selectedHos"
            className="text-sm font-medium text-gray-500 sr-only"
          >
            선택된 동물병원 :{" "}
          </label>
          <input
            type="text"
            id="selectedHos"
            value={
              `선택된 병원: ${form?.hospitalName}` || "선택된 병원이 없습니다"
            }
            className="w-full text-sm text-gray-500 px-2"
            readOnly
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <CancelButtons txt="Cancel" />
        <DefaultButtons txt="제보하기" onClick={() => reportHandler()} />
      </div>
    </article>
  );
}
