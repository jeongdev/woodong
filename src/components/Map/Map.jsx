import React, { useEffect, useState } from "react";
import { firestore } from "../../firebase/firebase";
import { COLLECTION, DOC } from "../../config/config";
import InfoWindow from "./InfoWindow";

const { kakao } = window;
export default function Map() {
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
    firestore
      .collection(COLLECTION)
      .doc(DOC)
      .get()
      .then((data) => {
        setData(data.data().list);
      });
  };
  const initialMap = async () => {
    const mapContainer = document.getElementById("map"), // 지도를 표시할 div
      mapOption = {
        center: new kakao.maps.LatLng(location.lat, location.lng), // 지도의 중심좌표
        level: 3, // 지도의 확대 레벨
      };

    // 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
    const map = new kakao.maps.Map(mapContainer, mapOption);
    if (!kakaoMap) setKakaoMap(map);

    // 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다
    var mapTypeControl = new kakao.maps.MapTypeControl();

    // 지도에 컨트롤을 추가해야 지도위에 표시됩니다
    // kakao.maps.ControlPosition은 컨트롤이 표시될 위치를 정의하는데 TOPRIGHT는 오른쪽 위를 의미합니다
    map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

    // 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
    var zoomControl = new kakao.maps.ZoomControl();
    map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
    // 주소-좌표 변환 객체를 생성합니다
    // const geocoder = new kakao.maps.services.Geocoder();

    // 마커 이미지의 이미지 주소입니다
    // const imageSrc =
    //   "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";

    // 주소로 좌표를 검색합니다\
    try {
      data.map(async (item, idx) => {
        const getCoords = await getLatLngFunc(item.address);
        const coords = new kakao.maps.LatLng(getCoords.lat, getCoords.lng);
        // 결과값으로 받은 위치를 마커로 표시합니다
        const marker = new kakao.maps.Marker({
          map: map,
          position: coords,
        });
        // 인포윈도우로 장소에 대한 설명을 표시합니다
        const infowindow = new kakao.maps.InfoWindow({
          content: `<div style="width:150px;text-align:center;padding:6px 0;">
              <a href="https://map.kakao.com/link/search/${item.title}
              " target="_blank">
              ${item.title}</a></div>`,
        });
        infowindow.open(map, marker);

        // }
        // });
      });
    } catch (e) {
      console.log("에러", e);
    }
  };
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(currentPosition, locationErr);
    getData();
  }, []);

  useEffect(() => {
    if (!data) return;
    console.log(location);
    initialMap();
  }, [data, location]);

  return (
    <div
      style={{ width: "100%", height: "1000px" }}
      className="overflow-hidden relative flex"
    >
      <InfoWindow data={data} moveMap={infoWindowClickHandler} />
      <div id="map" className="w-full h-full" />
    </div>
  );
}
