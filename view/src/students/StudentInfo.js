import { useParams } from "react-router-dom";

export const StudentInfo = () => {
  const { id } = useParams();

  return (
      <div>
        <h1>Student Info</h1>
        <h2>{`Student ID: ${id}`}</h2>
      </div>
  );
}