import React, { useCallback, useEffect, useState, useRef } from "react";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { DefaultButtons, CancelButtons } from "../Common/Button/Buttons";
import { firestore } from "../../firebase/firebase";
import { COLLECTION, DOC, PROJECT_ID } from "../../config/config";
import InfoWindow from "../Map/InfoWindow";

const { kakao } = window;
export default function Report() {
  const mapContainer = useRef(null);
  const [kakaoMap, setKakaoMap] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [item, setItem] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [infowindow, setInfowindow] = useState(
    new kakao.maps.InfoWindow({ zIndex: 1 })
  );
  const [location, setLocation] = useState({
    lat: null,
    lng: null,
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

  const createMap = () => {
    if (kakaoMap) return;
    const mapOption = {
      center: new kakao.maps.LatLng(33.450701, 126.570667),
      level: 8,
    };
    const map = new kakao.maps.Map(mapContainer.current, mapOption);
    setKakaoMap(map);
  };

  const currentPosition = (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    setLocation({
      lat,
      lng,
    });
  };

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
    let listEl = document.getElementById("placesList"),
      menuEl = document.getElementById("menu_wrap"),
      fragment = document.createDocumentFragment(),
      bounds = new kakao.maps.LatLngBounds(),
      listStr = "";

    removeAllChildNods();
    removeMarker();

    setItem(places);

    places.map((item, i) => {
      const placePosition = new kakao.maps.LatLng(item.y, item.x);
      const marker = addMarker(placePosition, i);

      //   // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
      //   // LatLngBounds 객체에 좌표를 추가합니다
      bounds.extend(placePosition);

      //   // 마커와 검색결과 항목에 mouseover 했을때
      //   // 해당 장소에 인포윈도우에 장소명을 표시합니다
      //   // mouseout 했을 때는 인포윈도우를 닫습니다
      (function (marker, title) {
        kakao.maps.event.addListener(marker, "mouseover", function () {
          displayInfowindow(marker, title);
        });

        kakao.maps.event.addListener(marker, "mouseout", function () {
          infowindow.close();
        });

        // itemEl.onmouseover = function () {
        //   displayInfowindow(marker, title);
        // };

        // itemEl.onmouseout = function () {
        //   infowindow.close();
        // };
      })(marker, item.place_name);
    });
    menuEl.scrollTop = 0;

    // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
    kakaoMap.setBounds(bounds);
  };

  // 검색결과 목록 또는 마커를 클릭했을 때 호출되는 함수입니다
  // 인포윈도우에 장소명을 표시합니다
  function displayInfowindow(marker, title) {
    const content = `<div style="padding:5px;z-index:1">${title}</div>`;

    infowindow.setContent(content);
    infowindow.open(kakaoMap, marker);
  }

  const removeAllChildNods = () => {
    setItem([]);
  };

  const getListItem = (places, index) => {
    // itemEl.onmouseover = function () {
    //   displayInfowindow(marker, title);
    // };

    // itemEl.onmouseout = function () {
    //   infowindow.close();
    // };
    console.log(" 리스트", places);
    return places.map((item, index) => (
      <li
        key={item.id}
        className={`p-4 border-b ${
          selectedMarker?.id === item.id && "bg-slate-200"
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
                <span className="text-xs">지번: {item.address_name}</span>
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
    ));
  };

  // 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다
  function addMarker(position, idx, title) {
    const imageSrc =
      "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png"; // 마커 이미지 url, 스프라이트 이미지를 씁니다
    const imageSize = new kakao.maps.Size(36, 37); // 마커 이미지의 크기
    const imgOptions = {
      spriteSize: new kakao.maps.Size(36, 691), // 스프라이트 이미지의 크기
      spriteOrigin: new kakao.maps.Point(0, idx * 46 + 10), // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
      offset: new kakao.maps.Point(13, 37), // 마커 좌표에 일치시킬 이미지 내에서의 좌표
    };
    const markerImage = new kakao.maps.MarkerImage(
      imageSrc,
      imageSize,
      imgOptions
    );
    const marker = new kakao.maps.Marker({
      position: position, // 마커의 위치
      image: markerImage,
    });

    marker.setMap(kakaoMap); // 지도 위에 마커를 표출합니다
    setMarkers((prev) => [...prev, marker]); // 배열에 생성된 마커를 추가합니다

    return marker;
  }

  function removeMarker() {
    for (let i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
    setMarkers([]);
  }

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
    event.preventDefault();

    if (
      !group ||
      !placeId ||
      !address ||
      !roadAddress ||
      !hospitalName ||
      !email
    ) {
      alert("필수 항목이 입력되지 않았습니다.");
      return;
    }

    firestore.collection("report").add({
      title: "병원 제보합니다",
      content: "저번에 갔던 병원 제보합니다",
      address: "서울시 어디구 어디로 123-1",
      hospitalName: "서울 어디병원",
      user: "user1",
      email: "abcd@gmail.com",
      image: "",
    });
  };

  const placesSearchCB = (data, status, pagination) => {
    if (status === kakao.maps.services.Status.OK) {
      // 정상적으로 검색이 완료됐으면
      // 검색 목록과 마커를 표출합니다
      displayPlaces(data);
      // 페이지 번호를 표출합니다
      // displayPagination(pagination);
    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
      // alert("검색 결과가 존재하지 않습니다.");
      setItem([]);
      return;
    } else if (status === kakao.maps.services.Status.ERROR) {
      alert("검색 결과 중 오류가 발생했습니다.");
      return;
    }
  };

  function searchPlaces() {
    const ps = new kakao.maps.services.Places();
    // const keyword = document.getElementById("keyword").value;

    if (!keyword.replace(/^\s+|\s+$/g, "")) {
      // alert("키워드를 입력해주세요!");
      return false;
    }

    // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
    ps.keywordSearch(keyword, placesSearchCB);
  }

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(currentPosition);
    createMap();
  }, []);

  useEffect(() => {
    searchPlaces();
  }, [keyword]);

  useEffect(() => {
    console.log("markers", markers);
  }, [markers]);

  useEffect(() => {
    console.log("선택된 마커", selectedMarker);
  }, [selectedMarker]);

  return (
    <article className="mx-auto max-w-5xl items-center p-6 lg:px-8">
      <h2 className="text-xl">제보하기</h2>
      <p className="mt-3 text-sm leading-6 text-gray-600">
        내가 아는 특수동물 진료병원을 제보해주세요.
      </p>

      <div className="col-span-full mt-10">
        <label
          htmlFor="name"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          병원 이름
        </label>
        <div className="mt-2">
          <input
            id="name"
            name="name"
            rows={3}
            className="block w-full resize-none rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
            defaultValue={""}
            onChange={onChangeHandler}
          />
        </div>
      </div>

      <div className="col-span-full mt-5">
        <label
          htmlFor="content"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          어떻게 알게 되셨나요?
        </label>
        <div className="mt-2">
          <textarea
            id="content"
            name="content"
            rows={3}
            className="block w-full resize-none rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
            defaultValue={""}
            onChange={onChangeHandler}
          />
        </div>
      </div>

      {/* <div className="col-span-full mt-5">
        <label
          htmlFor="cover-photo"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Cover photo
        </label>
        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
          <div className="text-center">
            <PhotoIcon
              className="mx-auto h-12 w-12 text-gray-300"
              aria-hidden="true"
            />
            <div className="mt-4 flex text-sm leading-6 text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primaryFocused focus-within:ring-offset-2 hover:text-primaryFocus"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs leading-5 text-gray-600">
              PNG, JPG, GIF up to 10MB
            </p>
          </div>
        </div>
      </div> */}

      <div className="col-span-full mt-5 rounded-md border-0 overflow-hidden">
        <label
          htmlFor="keyword"
          className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
        >
          Search
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
            onChange={(e) => setKeyword(e.target.value)}
            id="keyword"
            className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary "
            placeholder="검색어를 입력하세요"
            required
          />
          <button
            type="submit"
            className="text-white absolute right-2.5 bottom-2.5 bg-primary hover:bg-primaryFocused focus:ring-4 focus:outline-none focus:ring-primaryFocused font-medium rounded-lg text-sm px-4 py-2 "
          >
            Search
          </button>
        </div>

        <article
          ref={mapContainer}
          id="map"
          className="w-full h-96 mt-3 rounded-md ring-1 ring-inset ring-gray-300"
        >
          <div
            id="menu_wrap"
            className="absolute z-10 bg-[rgba(255,255,255,0.8)] w-1/4 overflow-hidden h-full"
          >
            <ul id="placesList" className="h-full overflow-y-scroll">
              {getListItem(item)}
            </ul>
            {/* <div id="pagination"></div> */}
          </div>
        </article>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <CancelButtons txt="Cancel" />
        <DefaultButtons txt="제보하기" />
      </div>
    </article>
  );
}
