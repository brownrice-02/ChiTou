"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import GoogleMapReact from "google-map-react";
import InfoCard from "./GoogleMap/InfoCard";
import useTextSearch from "@/hooks/useTextSearch";
import styles from "@/styles/css-modules/googlemap.module.scss";

function MyPositionMarker({ mapZoom }) {
  const iconWidth = (40 * mapZoom) / 15;
  const iconHeight = (40 * mapZoom) / 15;
  const xOffset = iconWidth / 2;
  const yOffset = iconHeight;
  return (
    <div
      style={{
        position: "absolute",
        transform: `translate(-${xOffset}px, -${yOffset}px)`,
      }}
    >
      <Image
        src="/my_position.svg"
        alt="Icon"
        width={iconWidth || 40}
        height={iconHeight || 40}
      />
    </div>
  );
}

function FilterMarker({ mapZoom, placeId, text, getPlaceDetail }) {
  const iconWidth = (27 * mapZoom) / 15;
  const iconHeight = (43 * mapZoom) / 15;
  const xOffset = iconWidth / 2;
  const yOffset = iconHeight;
  return (
    <button
      id={placeId}
      type="button"
      style={{
        position: "absolute",
        transform: `translate(-${xOffset}px, -${yOffset}px)`,
      }}
      onClick={() => {
        getPlaceDetail(placeId);
      }}
    >
      {mapZoom > 16 && (
        <div
          className={styles.markerText}
          style={{
            position: "absolute",
            transform: `translate(-${xOffset}px, -${yOffset}px)`,
          }}
        >
          {text}
        </div>
      )}
      <Image
        src="/Spotlight_Marker_Red.svg"
        alt="Icon"
        width={iconWidth || 27}
        height={iconHeight || 43}
        style={{ zIndex: 3 }}
      />
    </button>
  );
}

function SelectedMarker({ mapZoom = 15 }) {
  const iconWidth = (27 * mapZoom) / 15;
  const iconHeight = (43 * mapZoom) / 15;
  const xOffset = iconWidth / 2;
  const yOffset = iconHeight;
  return (
    <button
      type="button"
      style={{
        position: "absolute",
        transform: `translate(-${xOffset}px, -${yOffset}px)`,
      }}
      // onClick={setPlaceDetails(null)}
    >
      <Image
        src="/Spotlight_Marker_Green.svg"
        alt="Icon"
        width={iconWidth || 27}
        height={iconHeight || 43}
      />
    </button>
  );
}

export default function GoogleMap({
  trip,
  newSchedule,
  removeNewSchedule,
  addPlace,
}) {
  // 預設位置
  const [myPosition, setMyPosition] = useState({
    lat: 25.0533789,
    lng: 121.604905,
  });
  const [mapApiLoaded, setMapApiLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [mapApi, setMapApi] = useState(null);
  const [filterPlaces, setFilterPlaces] = useState([]);
  const [placeDetails, setPlaceDetails] = useState(null);
  const [mapZoom, setMapZoom] = useState(trip ? 15 : 7);
  const {
    searchText,
    searchTextResults,
    setAutoMapApi,
    handleSearchTextChange,
    setSearchText,
    setSearchTextResults,
  } = useTextSearch();
  const handleApiLoaded = (map, maps) => {
    const geocoder = new maps.Geocoder();
    console.log("map", map);
    console.log("maps", maps);
    geocoder.geocode(
      { address: "台灣" || trip.destination },
      (results, status) => {
        if (status === "OK") {
          setMyPosition({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          });
          console.log("lat", results[0].geometry.location.lat());
          console.log("lng", results[0].geometry.location.lng());
        }
      },
    );
    setMapInstance(map);
    setMapApi(maps);
    setAutoMapApi(maps);
    setMapApiLoaded(true);
    console.log("載入完成!");
  };

  const findFilterLocation = (keyword) => {
    if (mapApiLoaded) {
      const service = new mapApi.places.PlacesService(mapInstance);

      const request = {
        location: myPosition,
        rankBy: mapApi.places.RankBy.DISTANCE,
        keyword,
      };

      service.nearbySearch(request, (results, status) => {
        if (status === mapApi.places.PlacesServiceStatus.OK) {
          setFilterPlaces(results);
          setPlaceDetails(null);
          setMyPosition({
            placeId: results[0].place_id,
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          });
          setMapZoom(15);
          console.log(results);
        }
      });
    }
    console.log("findFilterLocation");
  };
  const getPlaceDetail = (placeId) => {
    const service = new mapApi.places.PlacesService(mapInstance);
    const request = {
      placeId,
      // fields: ["name", "formatted_address", "place_id", "geometry"],
    };
    service.getDetails(request, (place, status) => {
      if (status === mapApi.places.PlacesServiceStatus.OK) {
        console.log(place);
        setPlaceDetails(place);
        setMyPosition({
          placeId: place.place_id,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
        setMapZoom(18);
      }
    });
  };

  const handleSearchKeyDown = (e) => {
    if (e.keyCode === 13) {
      console.log("SearchFor");
      console.log(e.target.value);
      console.log(myPosition);
      const service = new mapApi.places.PlacesService(mapInstance);
      const request = {
        location: myPosition,
        query: e.target.value,
      };
      service.textSearch(request, (results, status) => {
        if (status === mapApi.places.PlacesServiceStatus.OK) {
          console.log(results);
          setSearchTextResults([]);
          setFilterPlaces(results);
          setPlaceDetails(null);
          setMyPosition({
            placeId: results[0].place_id,
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          });
          setMapZoom(15);
        }
      });
    }
  };

  useEffect(() => {
    console.log("mapZoom", mapZoom);
  }, [mapZoom]);
  useEffect(() => {
    console.log("placeDetails", placeDetails);
  }, [placeDetails]);
  return (
    <div className={styles.container}>
      <input
        className={styles.search}
        type="text"
        placeholder="請輸入地址"
        name="search"
        id="search"
        value={searchText}
        onChange={handleSearchTextChange}
        onKeyDown={handleSearchKeyDown}
        autoComplete="off"
      />
      {searchTextResults && searchTextResults.length > 0 && (
        <div className={styles.searchResult}>
          {searchTextResults.map((result) => (
            <button
              type="button"
              key={result.place_id}
              className={styles.searchResultItem}
              onClick={() => {
                console.log(result);
                setSearchTextResults([]);
                getPlaceDetail(result.place_id);
                setFilterPlaces([]);
                setSearchText(result.structured_formatting.main_text);
              }}
            >
              <span className={styles.main_text}>
                {result.structured_formatting.main_text}
              </span>
              <span className={styles.secondary_text}>
                {result.structured_formatting.secondary_text}
              </span>
            </button>
          ))}
        </div>
      )}
      <div className={styles.filterBar}>
        <button
          type="button"
          className={styles.filter}
          onClick={() => findFilterLocation("cafe")}
        >
          <div className={styles.filterTitle}>coffee</div>
        </button>
        <button
          type="button"
          className={styles.filter}
          onClick={() => findFilterLocation("餐廳")}
        >
          <div className={styles.filterTitle}>餐廳</div>
        </button>
        <button
          type="button"
          className={styles.filter}
          onClick={() => findFilterLocation("咖啡廳")}
        >
          <div className={styles.filterTitle}>咖啡廳</div>
        </button>
        <button
          type="button"
          className={styles.filter}
          onClick={() => findFilterLocation("景點")}
        >
          <div className={styles.filterTitle}>觀光景點</div>
        </button>
        <button
          type="button"
          className={styles.filter}
          onClick={() => findFilterLocation("住宿")}
        >
          <div className={styles.filterTitle}>住宿</div>
        </button>
        <button
          type="button"
          className={styles.filter}
          onClick={() => findFilterLocation("車站")}
        >
          <div className={styles.filterTitle}>車站</div>
        </button>
        <button
          type="button"
          className={styles.filter}
          onClick={() => findFilterLocation("購物")}
        >
          <div className={styles.filterTitle}>購物</div>
        </button>
      </div>
      <GoogleMapReact
        bootstrapURLKeys={{
          key: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY,
          libraries: ["places"],
        }}
        center={myPosition}
        zoom={mapZoom}
        yesIWantToUseGoogleMapApiInternals
        // onChildMouseEnter={(key, props) => {
        //   const { placeId } = props;
        //   console.log("Mouse enter on placeId:", placeId);
        //   getPlaceDetail(placeId);
        // }}
        // onChildMouseLeave={(key, props) => {
        //   const { placeId } = props;
        //   console.log("Mouse leave on placeId:", placeId);
        //   setPlaceDetails(null);
        // }}
        onGoogleApiLoaded={({ map, maps }) => {
          handleApiLoaded(map, maps);
        }}
        onBoundsChange={(center, zoom) => {
          console.log(zoom);
          setMapZoom(zoom);
        }}
      >
        <MyPositionMarker
          lat={myPosition.lat}
          lng={myPosition.lng}
          text="My Position"
          mapZoom={mapZoom}
        />

        {filterPlaces.map((place) => (
          <FilterMarker
            icon={place.icon}
            key={place.place_id}
            lat={place.geometry.location.lat()}
            lng={place.geometry.location.lng()}
            text={place.name}
            placeId={place.place_id}
            mapZoom={mapZoom}
            getPlaceDetail={getPlaceDetail}
          />
        ))}
        {placeDetails != null && (
          <SelectedMarker
            lat={placeDetails.geometry.location.lat()}
            lng={placeDetails.geometry.location.lng()}
            text={placeDetails.name}
            mapZoom={mapZoom}
            setPlaceDetails={setPlaceDetails}
            setMyPosition={setMyPosition}
          />
        )}
      </GoogleMapReact>
      {placeDetails != null && (
        <InfoCard
          placeDetails={placeDetails}
          setPlaceDetails={setPlaceDetails}
          newSchedule={newSchedule}
          removeNewSchedule={removeNewSchedule}
          addPlace={addPlace}
        />
      )}
    </div>
  );
}
