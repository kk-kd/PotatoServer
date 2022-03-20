import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOneRoute } from "./../api/axios_wrapper";

export const BusRouteNavigation = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState();
  const [pickupLinks, setPickupLinks] = useState([]);
  const [dropoffLinks, setDropoffLinks] = useState([]);
  useEffect(() => {
    const getRoute = async () => {
      try {
        console.log("1");
        const routeData = await getOneRoute(id);
        setRoute({...routeData.data, stops: routeData.data.stops.map(stop =>
              ({...stop, arrivalIndex: parseInt(stop.arrivalIndex)}))});
      } catch (e) {
        alert(e.response.data);
      }
    }
    getRoute();
  }, []);

  useEffect(() => {
    if (route) {
      const sortedPickup = [...route.stops.slice(0).sort((a, b) => a.arrivalIndex - b.arrivalIndex), route.school];
      const sortedDropoff = [route.school, ...route.stops.slice(0).sort((a, b) => b.arrivalIndex - a.arrivalIndex)];
      const length = sortedPickup.length;
      var pickup = [];
      var dropoff = [];
      for (var i = 0; i < length/4; i++) {
        const arrivalWaypoints = sortedPickup
            .filter((stop, index) => index >= i * 4 && index < Math.min((i + 1) * 4 - 1, length - 1))
            .map(stop => `${stop.latitude},${stop.longitude}`)
            .join("|");
        const arrivalDestination = `${sortedPickup[Math.min((i + 1) * 4 - 1, length - 1)].latitude},${sortedPickup[Math.min((i + 1) * 4 - 1, length - 1)].longitude}`;
        const arrivalLink = `https://www.google.com/maps/dir/?api=1&destination=${arrivalDestination}&waypoints=${arrivalWaypoints}`;
        pickup = [...pickup, arrivalLink];
        const dropoffWaypoints = sortedDropoff
            .filter((stop, index) => index >= i * 4 && index < Math.min((i + 1) * 4 - 1, length - 1))
            .map(stop => `${stop.latitude},${stop.longitude}`)
            .join("|");
        const dropoffDestination = `${sortedDropoff[Math.min((i + 1) * 4 - 1, length - 1)].latitude},${sortedDropoff[Math.min((i + 1) * 4 - 1, length - 1)].longitude}`;
        const dropoffLink = `https://www.google.com/maps/dir/?api=1&destination=${dropoffDestination}&waypoints=${dropoffWaypoints}`;
        dropoff = [...dropoff, dropoffLink];
      }
      setPickupLinks(pickup);
      setDropoffLinks(dropoff);
      setLoading(false);
    }
  }, [route]);

  if (loading) {
    return (
        <h1>Loading</h1>
    );
  }

  return (
      <div id="content">
        <h2 id="title">{`${route.name} Navigation`}</h2>
        <div style={{ display: "flex" }}>
          <div style={{ flex: "50%", display: "inline-block" }}>
            <h4>Pick-Up Route Directions</h4>
            {pickupLinks.map((link, index) => (
                <div>
                  <a href={link} target="_blank">{`Leg ${index + 1}`}</a>
                </div>
            ))}
          </div>
          <div style={{ flex: "50%", display: "inline-block" }}>
            <h4>Drop-Off Route Directions</h4>
            {dropoffLinks.map((link, index) => (
                <div>
                  <a href={link} target="_blank">{`Leg ${index + 1}`}</a>
                </div>
            ))}
          </div>
        </div>
      </div>
  )
}