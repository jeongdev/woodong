import { useEffect, useState } from "react";
import DisplayMarker from "../components/Map/DisplayMarker";
import GetLocationByAddress from "../components/Map/GetLocationByAddress";
import SearchPlace from "../components/Map/SearchPlace";

export default function useMap(containerRef, zoomOption) {
  const [kakaoMap, setKakaoMap] = useState(null);
  const [location, setLocation] = useState({
    lat: 37.566826004661,
    lng: 126.978652258309,
  });
  const [markers, setMarkers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState();

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

  const searchDisplayMarker = async (places, nextKeyword) => {
    if (!kakaoMap) return;

    // 다르면 true 같으면 false
    const keywordResetState = searchKeyword !== nextKeyword ? true : false;
    if (!keywordResetState) return;

    const mark = await Promise.all(
      places.map(async (item) => {
        const mk = await DisplayMarker(
          kakaoMap,
          markers,
          item.place_name,
          item.address_name || item.road_address_name,
          keywordResetState
        );

        return mk;
      })
    );

    setMarkers(mark);
    setSearchKeyword(nextKeyword);
  };

  const displayMarkerByAddress = async (title, address, nextKeyword) => {
    if (!kakaoMap) return;

    const mk = await DisplayMarker(kakaoMap, markers, title, address);

    setMarkers((prev) => {
      if (!title || !address) return [];
      return [...prev, mk];
    });
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

  const placeSearchHandler = (keyword) => {
    SearchPlace(keyword);
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

      if (!zoomOption) return;

      const mapTypeControl = new window.kakao.maps.MapTypeControl();
      map.addControl(
        mapTypeControl,
        window.kakao.maps.ControlPosition.TOPRIGHT
      );

      const zoomControl = new window.kakao.maps.ZoomControl();
      map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);
    })();
  }, [containerRef]);

  return {
    kakaoMap,
    displayMarkerByAddress,
    moveMyAddress,
    moveByAddress,
    placeSearchHandler,
    searchDisplayMarker,
  };
}
