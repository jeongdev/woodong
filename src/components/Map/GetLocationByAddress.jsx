export default async function GetLocationByAddress(address) {
  if (!address) return;
  const geocoder = new window.kakao.maps.services.Geocoder();

  return await new Promise((resolve) => {
    geocoder.addressSearch(address, function (result, status) {
      if (status !== window.kakao.maps.services.Status.OK) return;
      const lat = result[0].y;
      const lng = result[0].x;
      resolve({ lat, lng });
    });
  });
}
