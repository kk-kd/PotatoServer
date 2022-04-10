import "./RunMap.css";
import { useEffect, useState } from "react";
import GoogleMapReact from "google-map-react";
import { Marker } from "./../map/Marker";
import { getActiveRuns, getBusLocation } from "./../api/axios_wrapper";

export const RunMap = () => {
  const [activeBusses, setActiveBusses] = useState([]);
  useEffect(() => {
    const updateBusLocation = setInterval(async () => {
      try {
        const currentBusses = await getActiveRuns();
        console.log(currentBusses);
        let busLocations = [];
        for (var i = 0; i < currentBusses.data.length; i++) {
          const busLocation = await getBusLocation(currentBusses.data[i].busNumber);
          busLocations = [...busLocations, busLocation.data];
        }
        console.log(busLocations);
        setActiveBusses(busLocations);
      } catch (e) {
        console.log(e);
      }
    }, 5000);
    return () => clearInterval(updateBusLocation);
  })
  return (
      <div>
        <h2 id="title">Transit Map</h2>
        <div id="bigMap">
          <GoogleMapReact
              bootstrapURLKeys={{
                key: `${process.env.REACT_APP_GOOGLE_MAPS_API}`,
              }}
              defaultCenter={{ lat: 38.627, lng: -90.1994 }}
              defaultZoom={5}
          >
            {activeBusses.map(bus => (
                <Marker
                    lat={parseFloat(bus.latitude)}
                    lng={parseFloat(bus.longitude)}
                    stop={bus}
                    isBus
                />
            ))}
          </GoogleMapReact>
        </div>
      </div>

  )
}