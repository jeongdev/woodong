import React, { useEffect } from "react";
import data from "../../data/item.json";

const { kakao } = window;
export default function Map() {
  useEffect(() => {
    const mapContainer = document.getElementById("map"), // 지도를 표시할 div
      mapOption = {
        center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
        level: 3, // 지도의 확대 레벨
      };

    // 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
    const map = new kakao.maps.Map(mapContainer, mapOption);

    // 마커 이미지의 이미지 주소입니다
    const imageSrc =
      "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";

    data.map((item, i) => {
      const LatLng = new kakao.maps.LatLng(item.latlngX, item.latlngY);
      // 마커 이미지의 이미지 크기 입니다
      let imageSize = new kakao.maps.Size(24, 35);

      // 마커 이미지를 생성합니다
      let markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);
      // 마커를 생성합니다
      console.log(item.latlngX);
      let marker = new kakao.maps.Marker({
        map: map, // 마커를 표시할 지도
        position: LatLng, // 마커를 표시할 위치
        title: item.title, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
        image: markerImage, // 마커 이미지
      });
    });
  }, []);

  return <div id="map" style={{ width: "100vw", height: "800px" }}></div>;
}
