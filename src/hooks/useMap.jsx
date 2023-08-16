import React, { useEffect, useState } from "react";
import DisplayMarker from "../components/Map/DisplayMarker";
import GetLocationByAddress from "../components/Map/GetLocationByAddress";

export default function useMap(containerRef) {
  const [kakaoMap, setKakaoMap] = useState(null);
  const [location, setLocation] = useState({
    lat: 37.566826004661,
    lng: 126.978652258309,
  });

  const currentPosition = (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    setLocation({
      lat,
      lng,
    });
  };

  const locationErr = (error) => {
    alert(`현재 위치를 가져올 수 없습니다.`);
  };

  const displayMarkerByAddress = async (shopInfo) => {
    if (!kakaoMap) return;
    await DisplayMarker(kakaoMap, shopInfo);
  };

  const moveMyAddress = () => {
    const { lat, lng } = location;
    const moveLatLon = new window.kakao.maps.LatLng(lat, lng);
    kakaoMap.setCenter(moveLatLon);
    if (kakaoMap.getLevel() > 6) kakaoMap.setLevel(5);
  };

  const moveByAddress = async (address, level, option) => {
    const getCoords = await GetLocationByAddress(address);
    const coords = new window.kakao.maps.LatLng(getCoords.lat, getCoords.lng);
    option === "smooth" ? kakaoMap.panTo(coords) : kakaoMap.setCenter(coords);
    if (kakaoMap.getLevel() !== level) kakaoMap.setLevel(level);
  };

  useEffect(() => {
    (() => {
      if (!containerRef.current) return;
      if (!navigator.geolocation) locationErr();
      else
        navigator.geolocation.getCurrentPosition(currentPosition, locationErr);

      const mapOption = {
        center: new window.kakao.maps.LatLng(location.lat, location.lng),
        level: 8,
      };
      const map = new window.kakao.maps.Map(containerRef.current, mapOption);
      setKakaoMap(map);

      const mapTypeControl = new window.kakao.maps.MapTypeControl();
      map.addControl(
        mapTypeControl,
        window.kakao.maps.ControlPosition.TOPRIGHT
      );

      const zoomControl = new window.kakao.maps.ZoomControl();
      map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);
    })();
  }, [containerRef]);

  return { kakaoMap, displayMarkerByAddress, moveMyAddress, moveByAddress };
}
