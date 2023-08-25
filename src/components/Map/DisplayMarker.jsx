import React from "react";
import GetLocationByAddress from "./GetLocationByAddress";

export default async function DisplayMarker(
  map,
  markers,
  title,
  address,
  resetState
) {
  const { kakao } = window;
  const markerPosition = await GetLocationByAddress(address);

  const coords = new window.kakao.maps.LatLng(
    markerPosition?.lat,
    markerPosition?.lng
  );

  if (resetState || !title || !address) {
    markers.forEach((marker) => marker.setMap(null));
  }

  const MARKER_SRC = "/images/marker.png";
  const imageSize = new kakao.maps.Size(48, 48);
  const imageOption = { offset: new kakao.maps.Point(27, 69) };

  const markerImage = new kakao.maps.MarkerImage(
    MARKER_SRC,
    imageSize,
    imageOption
  );

  const marker = new kakao.maps.Marker({
    position: coords,
    title: title + " 바로가기",
    image: markerImage,
  });

  marker.setMap(map);

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

  const iwContent = `
    <div style="width: 150px; text-align:center; padding:6px 8px; display: flex; flex-direction: column;">
        <span style="font-size: 14px">${title}</span>
    </div>`;

  const infowindow = new kakao.maps.InfoWindow({
    content: iwContent,
  });

  kakao.maps.event.addListener(
    marker,
    "mouseover",
    onInfoWindowHandler(map, marker, infowindow)
  );
  kakao.maps.event.addListener(
    marker,
    "mouseout",
    offInfoWindowHandler(infowindow)
  );
  kakao.maps.event.addListener(
    marker,
    "click",
    openNewTabHandler(`https://map.kakao.com/link/search/${title}`)
  );

  return marker;
}
