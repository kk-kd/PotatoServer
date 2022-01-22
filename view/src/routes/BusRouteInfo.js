import { useParams } from "react-router-dom";

export const BusRouteInfo = () => {
  const { id } = useParams();

  return (
      <div>
        <h1>Route Info</h1>
        <h2>{`Route ID: ${id}`}</h2>
      </div>
  );
}