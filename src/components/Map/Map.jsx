import React, { useEffect, useRef, useState } from "react";
import { PROJECT_ID } from "../../config/config";
import InfoWindow from "./InfoWindow";

const { kakao } = window;
export default function Map() {
  const mapContainer = useRef(null);
  const [kakaoMap, setKakaoMap] = useState(null);
  const [location, setLocation] = useState({
    lat: null,
    lng: null,
  });
  const [data, setData] = useState(null);

  const geocoder = new kakao.maps.services.Geocoder();
  const getLatLngFunc = (address) => {
    // 주소-좌표 변환 객체를 생성합니다
    return new Promise((resolve, reject) => {
      geocoder.addressSearch(address, async (result, status) => {
        // 정상적으로 검색이 완료됐으면
        if (status !== kakao.maps.services.Status.OK) return;
        const lat = result[0].y;
        const lng = result[0].x;

        resolve({ lat, lng });
      });
    });
  };

  const infoWindowClickHandler = async (address, option) => {
    // 지도의 중심을 결과값으로 받은 위치로 즉시 이동시킵니다
    const getCoords = await getLatLngFunc(address);
    const coords = new kakao.maps.LatLng(getCoords.lat, getCoords.lng);
    option === "smooth" ? kakaoMap.panTo(coords) : kakaoMap.setCenter(coords);
  };

  const currentPosition = (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    setLocation({
      lat,
      lng,
    });
  };

  function locationErr() {
    alert("I can't find you. No weather for you.");
  }

  const getData = () => {
    fetch(
      `https://${PROJECT_ID}-default-rtdb.firebaseio.com/hospital/list.json`
    )
      .then((data) => data.json())
      .then((res) => setData(res));
  };

  // const getData = () => {
  //   firestore
  //     .collection(COLLECTION)
  //     .doc(DOC)
  //     .get()
  //     .then((data) => {
  //       setData(data.data().list);
  //     });
  // };

  const createMap = () => {
    if (kakaoMap) return;
    const mapOption = {
      center: new kakao.maps.LatLng(location.lat, location.lng),
      level: 3,
    };

    const map = new kakao.maps.Map(mapContainer.current, mapOption);
    setKakaoMap(map);
  };

  const initialMap = async (map) => {
    // 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다
    // 지도에 컨트롤을 추가해야 지도위에 표시됩니다
    // kakao.maps.ControlPosition은 컨트롤이 표시될 위치를 정의하는데 TOPRIGHT는 오른쪽 위를 의미합니다
    const mapTypeControl = new kakao.maps.MapTypeControl();
    kakaoMap.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

    // 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
    const zoomControl = new kakao.maps.ZoomControl();
    kakaoMap.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

    // 마커 이미지의 이미지 주소입니다
    // const imageSrc =
    //   "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";

    // 주소로 좌표를 검색합니다
    try {
      data.map(async (item, idx) => {
        const getCoords = await getLatLngFunc(item.address);
        const coords = new kakao.maps.LatLng(getCoords.lat, getCoords.lng);
        // 결과값으로 받은 위치를 마커로 표시합니다
        const marker = new kakao.maps.Marker({
          position: coords,
        });

        marker.setMap(kakaoMap);
        // 인포윈도우로 장소에 대한 설명을 표시합니다
        const iwContent = `<div style="width:150px;text-align:center;padding:6px 0;">
              <a href="https://map.kakao.com/link/search/${item.title}
              " target="_blank">
              ${item.title}</a></div>`;

        const infowindow = new kakao.maps.InfoWindow({
          content: iwContent,
        });
        infowindow.open(kakaoMap, marker);
      });
    } catch (e) {
      console.log("에러", e);
    }
  };

  const myLocationHandler = () => {
    const { lat, lng } = location;
    const moveLatLon = new kakao.maps.LatLng(lat, lng);
    kakaoMap.setCenter(moveLatLon);
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(currentPosition, locationErr);
    getData();
  }, []);

  useEffect(() => {
    if (!data) return;
    createMap();
  }, [data]);

  useEffect(() => {
    if (!kakaoMap) return;
    initialMap();
  }, [kakaoMap]);

  return (
    <div
      style={{ width: "100%" }}
      className="h-[calc(100vh_-_80px)] overflow-hidden relative flex flex-col-reverse md:flex-row"
    >
      <InfoWindow data={data} moveMap={infoWindowClickHandler} map={kakaoMap} />
      <article ref={mapContainer} id="map" className="w-full h-full">
        <button
          type="button"
          className="rounded-md bg-sky-500/75 p-3 absolute right-0 bottom-0 z-40"
          onClick={() => myLocationHandler()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="white"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25"
            />
          </svg>
        </button>
      </article>
    </div>
  );
}
