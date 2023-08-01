import React, { useEffect, useRef, useState } from "react";
import { firestore } from "../../firebase/firebase";
import { COLLECTION, DOC, PROJECT_ID } from "../../config/config";
import InfoWindow from "./InfoWindow";

const { kakao } = window;
export default function Map() {
  const mapContainer = useRef(null);
  const [kakaoMap, setKakaoMap] = useState(null);
  const [location, setLocation] = useState({
    lat: 37.566826004661,
    lng: 126.978652258309,
  });
  const [data, setData] = useState(null);

  const getLatLngFunc = (address) => {
    // 주소-좌표 변환 객체를 생성합니다
    const geocoder = new kakao.maps.services.Geocoder();
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

  function locationErr(error) {
    alert(`현재 위치를 가져올 수 없습니다.`);
  }

  // const getData = () => {
  //   try {
  //     fetch(
  //       `https://${PROJECT_ID}-default-rtdb.firebaseio.com/hospital/list.json`
  //     )
  //       .then((data) => data.json())
  //       .then((res) => setData(res));
  //   } catch (error) {
  //     setErrMsg(error);
  //   }
  // };

  const getData = () => {
    firestore
      .collection(COLLECTION)
      .doc(DOC)
      .get()
      .then((data) => {
        setData(data.data().list);
      });
  };

  const createMap = () => {
    if (kakaoMap) return;

    const mapOption = {
      center: new kakao.maps.LatLng(location.lat, location.lng),
      level: 8,
    };

    const map = new kakao.maps.Map(mapContainer.current, mapOption);
    setKakaoMap(map);
  };

  const initialMap = async (map) => {
    const mapTypeControl = new kakao.maps.MapTypeControl();
    kakaoMap.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

    const zoomControl = new kakao.maps.ZoomControl();
    kakaoMap.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

    // 마커 이미지의 이미지 주소입니다
    const imageSrc = `/images/marker.png`,
      imageSize = new kakao.maps.Size(48, 48), // 마커이미지의 크기입니다
      imageOption = { offset: new kakao.maps.Point(27, 69) }; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
    const markerImage = new kakao.maps.MarkerImage(
      imageSrc,
      imageSize,
      imageOption
    );

    try {
      data.map(async (item, idx) => {
        const getCoords = await getLatLngFunc(item.address);
        const coords = new kakao.maps.LatLng(getCoords.lat, getCoords.lng);

        const marker = new kakao.maps.Marker({
          position: coords,
          title: item.title,
          image: markerImage,
        });

        marker.setMap(kakaoMap);

        const iwContent = `
        <div style="width:150px; text-align:center; padding:6px 0;">
            ${item.title}
        </div>`;

        const infowindow = new kakao.maps.InfoWindow({
          content: iwContent,
        });

        kakao.maps.event.addListener(
          marker,
          "mouseover",
          onInfoWindowHandler(kakaoMap, marker, infowindow)
        );
        kakao.maps.event.addListener(
          marker,
          "mouseout",
          offInfoWindowHandler(infowindow)
        );
        kakao.maps.event.addListener(
          marker,
          "click",
          openNewTabHandler(`https://map.kakao.com/link/search/${item.title}`)
        );
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

  const onInfoWindowHandler = (map, marker, infowindow) => {
    return function () {
      infowindow.open(map, marker);
    };
  };

  const offInfoWindowHandler = (infowindow) => {
    return function () {
      infowindow.close();
    };
  };

  const openNewTabHandler = (url) => {
    return function () {
      window.open(url, "_blank", "noopener, noreferrer");
    };
  };

  useEffect(() => {
    if (!navigator.geolocation) locationErr();
    else navigator.geolocation.getCurrentPosition(currentPosition, locationErr);
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
      <InfoWindow data={data} moveMap={infoWindowClickHandler} />
      <article ref={mapContainer} id="map" className="w-full h-full">
        <button
          type="button"
          className="rounded-md bg-primary/75 p-3 absolute right-2 bottom-2 z-40"
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
