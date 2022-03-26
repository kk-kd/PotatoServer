
// Map used to help validate addresses
// when address changes, it needs to display the given address, and return the lat and loc in the form {}
import { useEffect, useState } from "react";
import GoogleMapReact from "google-map-react";
import { Marker } from "../../map/Marker";

export const MapHelper = ({activeAddress, setAddressValid, lat, setLat, lng, setLng}) => {

    const [mapApi, setMapApi] = useState();
    const [map, setMap] = useState();
    const [apiLoaded, setApiLoaded] = useState(false);
    const [geocoder, setGeocoder] = useState();
    const [error, setError] = useState(null);
    const defaultProps = {
        center: {
        lat: 0,
        lng: 0,
        },
        zoom: 13,
    };

    const handleApiLoaded = (map, maps) => {
        const geocoder = new maps.Geocoder();
        setMapApi({ geocoder: geocoder, map: map });
        setApiLoaded(true);
    };
    
    
    const searchLocation = () => {
        console.log("searching location = ")
        console.log(activeAddress)
        mapApi.geocoder.geocode({ address: activeAddress }, (results, status) => {
          if (status === "OK") {
            mapApi.map.setCenter(results[0].geometry.location);
            setLng(results[0].geometry.location.lng());
            setLat(results[0].geometry.location.lat());
            setAddressValid(true);

          } else if (status === "ZERO_RESULTS") {
            setAddressValid(false);

          } else {
            setAddressValid(false);
            console.log("Server Error. Try again later");
          }
        });
      };

      useEffect(()=> {
        console.log("active address changed")
        if (apiLoaded) {
            searchLocation()
        }
        return 
      },[activeAddress])

    return (<div> Map
        <div id="map">
        {error && <div>{error}</div>}
        <div style={{ height: "50vh", width: "80%", display: "inline-block" }}>
          <GoogleMapReact
            bootstrapURLKeys={{
              key: `${process.env.REACT_APP_GOOGLE_MAPS_API}`,
            }}
            defaultCenter={defaultProps.center}
            defaultZoom={defaultProps.zoom}
            yesIWantToUseGoogleMapApiInternals
            onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
          >
            <Marker text="Address" lat={lat} lng={lng} isUser />
          </GoogleMapReact>
        </div>
      </div>

    </div>)
}