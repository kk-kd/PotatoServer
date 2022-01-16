import { Link } from "react-router-dom";

export const ListSchools = () => {
  return (
      <div>
        <h1>List Schools</h1>
        <Link to="/Schools/create">
          <button>Create School</button>
        </Link>
      </div>
  );
}
