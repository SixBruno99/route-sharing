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

  const start = useRef<number[]>([-48.005312, -15.838992]); // [lng, lat]
  const end = useRef<number[]>([-48.04581, -15.835338]); // [lng, lat]
  const endTest = useRef<number[]>([-48.04581, -15.8]); // [lng, lat]
  const driverLocation = useRef<number[]>([start.current[0], start.current[1]]);
  
  const coords = useRef<number[][]>([]);
  const coordsTest = useRef<number[][]>([]);

  const getRoute = async (startCoords: number[]) => {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${startCoords[0]},${startCoords[1]};${end.current[0]},${end.current[1]}?overview=full&geometries=geojson`
    );

    const data = await response.json();
    const firstCoords = data.routes[0].geometry.coordinates;
    console.log(firstCoords);

    coords.current = firstCoords;
  };

  const getWrongRoute = async (startCoords: number[], endCoords: number[]) => {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?overview=full&geometries=geojson`
    );
    const data = await response.json();
    const firstCoords = data.routes[0].geometry.coordinates;
    coordsTest.current = firstCoords;
  };

  const updateRoute = (idx: number) => {
    const newCoords = coords.current.slice(idx);
    coords.current = newCoords;
  };

  const debounce = (delay: number) => {
    let currentIndex = 0;

    const intervalId = setInterval(() => {
      driverLocation.current = coords.current[1];
      updateRoute(1);

      currentIndex = currentIndex + 1;
      console.log(currentIndex, coords.current.length);

      // corrigir: ele esta parando antes de chagar ao destinoç
      
      if (coords.current.length === 1) {
        clearInterval(intervalId);
      }
    }, delay);

    return () => clearInterval(intervalId);
  };

  const updateRouteLocation = () => {
    const tolerance = 0.0001; 
  
    const isDriverOnRoute = coords.current.some((coord) => {
      const latDiff = Math.abs(coord[1] - driverLocation.current[1]);
      const lngDiff = Math.abs(coord[0] - driverLocation.current[0]);
  
      return latDiff < tolerance && lngDiff < tolerance;
    });
  
    // console.log("isDriverOnRoute", isDriverOnRoute);
  
    if (!isDriverOnRoute) {
      getRoute(driverLocation.current);
    }
  };
  

  // const updateRouteLocation = () => {
  //   const isDriverOnRoute = coords.current.some((coord) => {
  //     console.log("coord", coord[0], coord[1])
  //     console.log(
  //       "driver coord",
  //       driverLocation.current[0],
  //       driverLocation.current[1]
  //     );
  //     coord[0] === driverLocation.current[0] &&
  //       coord[1] === driverLocation.current[1];
  //   });

  //   console.log("isDriverOnRoute", isDriverOnRoute);

    // if (!isDriverOnRoute) {
    //   getRoute(driverLocation.current);
    // }
  // };

  useEffect(() => {
    updateRouteLocation();
  }, [driverLocation.current]);

  useEffect(() => {
    getRoute(start.current);
    getWrongRoute(start.current, endTest.current);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      debounce(100);
    }, 3000);
  }, []);

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

        <Marker longitude={start.current[0]} latitude={start.current[1]}>
          <img src={pickUp} width={48} height={48} />
        </Marker>

        <Marker longitude={end.current[0]} latitude={end.current[1]}>
          <img src={finish} width={48} height={48} />
        </Marker>

        <Marker
          longitude={driverLocation.current[0]}
          latitude={driverLocation.current[1]}
        >
          <img src={basicCar} width={48} height={48} />
        </Marker>

        <NavigationControl />
        <GeolocateControl />
      </Map>
    </>
  );
}
