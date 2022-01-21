import { useParams } from "react-router-dom";

export const BusRoutePlanner = () => {
  const { schoolId } = useParams();

  return (
      <div>
        <h1>Route Planner</h1>
        <h2>{`School ID: ${schoolId}`}</h2>
      </div>
  );
}