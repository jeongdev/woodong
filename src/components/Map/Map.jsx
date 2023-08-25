import React, { useEffect, useRef, useState } from "react";
import { firestore } from "../../firebase/firebase";
import { COLLECTION, DOC } from "../../config/config";
import InfoWindow from "./InfoWindow";
import useMap from "../../hooks/useMap";

export default function Map() {
  const mapContainer = useRef(null);
  const [data, setData] = useState(null);
  const { displayMarkerByAddress, moveMyAddress, moveByAddress } = useMap(
    mapContainer,
    true
  );

  const getData = () => {
    firestore
      .collection(COLLECTION)
      .doc(DOC)
      .get()
      .then((data) => {
        setData(data.data().list);
      });
  };

  const initialMap = async (markers) => {
    try {
      markers.map(async (item) => {
        displayMarkerByAddress(item.title, item.address);
      });
    } catch (e) {
      console.log("에러", e);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (!data) return;
    initialMap(data);
  }, [data]);

  return (
    <div
      style={{ width: "100%" }}
      className="h-[calc(100vh_-_80px)] overflow-hidden relative flex flex-col-reverse md:flex-row"
    >
      <InfoWindow data={data} moveMap={moveByAddress} />
      <article ref={mapContainer} id="map" className="w-full h-full">
        <button
          type="button"
          className="rounded-md bg-primary/75 p-3 absolute right-2 bottom-2 z-40"
          onClick={() => moveMyAddress()}
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
