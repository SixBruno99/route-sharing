import { MAP_BOX_KEY } from "../keys/mapbox";
import Map, {
  Marker,
  NavigationControl,
  GeolocateControl,
  Source,
  Layer,
  LayerProps,
} from "react-map-gl";
import { useState, useEffect, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import finish from "../assets/finish.png";
import pickUp from "../assets/pickup.png";
import basicCar from "../assets/basic-car.png";

// WatchLocation - MapBox

export function MapRoute() {
  const [viewState, setViewState] = useState({
    longitude: -48.03,
    latitude: -15.83,
    zoom: 13,
  });

  const [start, setStart] = useState([-48.005312, -15.838992]); // [lng, lat]
  const [end, setEnd] = useState([-48.04581, -15.835338]); // [lng, lat]
  const [driverLocation, setDriverLocation] = useState<number[]>([
    start[0],
    start[1],
  ]); // [lng, lat]

  const coords = useRef<number[][]>([]);

  const getRoute = async () => {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`
    );
    const data = await response.json();
    const firstCoords = data.routes[0].geometry.coordinates;
    coords.current = firstCoords;
    console.log("firstCoords", firstCoords);
  };

  const updateRoute = (idx: number) => {
    const newCoords = coords.current.splice(idx);
    coords.current = newCoords;
    console.log("rota atualizada", newCoords[idx]);
  };

  const debounce = (delay: number) => {
    let currentIndex = 0;

    const intervalId = setInterval(() => {
      setDriverLocation(coords.current[currentIndex]);
      updateRoute(currentIndex);
      // console.log(`coords[${currentIndex}]${coords.current[currentIndex]}`);

      currentIndex = currentIndex + 1;
      if (currentIndex > coords.current.length) {
        clearInterval(intervalId);
      }
    }, delay);

    return () => clearInterval(intervalId);
  };

  const geojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [...coords.current],
        },
      },
    ],
  };

  const lineStyle: LayerProps = {
    id: "roadLayer",
    type: "line",
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "blue",
      "line-width": 4,
      "line-opacity": 0.75,
    },
  };

  useEffect(() => {
    getRoute();
  }, []);

  useEffect(() => {
    setTimeout(() => {
        debounce(1000);
    }, 3000);
  }, []);

  return (
    <>
      <Map
        {...viewState}
        onMove={(event) => setViewState(event.viewState)}
        style={{ minHeight: "100vh" }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxAccessToken={MAP_BOX_KEY}
      >
        <Source id="routeSource" type="geojson" data={geojson}>
          <Layer {...lineStyle} />
        </Source>

        <Marker longitude={start[0]} latitude={start[1]}>
          <img src={pickUp} width={48} height={48} />
        </Marker>

        <Marker longitude={end[0]} latitude={end[1]}>
          <img src={finish} width={48} height={48} />
        </Marker>

        <Marker longitude={driverLocation[0]} latitude={driverLocation[1]}>
          <img src={basicCar} width={48} height={48} />
        </Marker>

        <NavigationControl />
        <GeolocateControl />
      </Map>
    </>
  );
}
