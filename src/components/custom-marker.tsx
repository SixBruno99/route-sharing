import React from "react";

interface IProps {
  image: string;
  longitude: number;
  latitude: number;
}

export function CustomMarker({ image, longitude, latitude }: IProps) {
  return (
    <div style={{ position: "absolute", transform: "translate(-50%, -50%)" }}>
      <img
        src={image}
        alt="Finish Marker"
        style={{ width: "30px", height: "30px" }}
      />
    </div>
  );
}
