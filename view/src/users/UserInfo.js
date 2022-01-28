import { useParams } from "react-router-dom";

export const UserInfo = () => {
  const { id } = useParams();

  return (
      <div>
        <h1>User Info Page</h1>
        <h2>{`User ID: ${id}`}</h2>
      </div>
  );
}
