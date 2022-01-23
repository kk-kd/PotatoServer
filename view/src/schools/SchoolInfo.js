import { useParams } from "react-router-dom";

export const SchoolInfo = () => {
  const { id } = useParams();

  return (
      <div>
        <h1>School Info Page</h1>
        <h2>{`School ID: ${id}`}</h2>
      </div>
  );
}
