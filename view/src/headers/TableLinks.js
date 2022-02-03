import "./TableLinks.css";
import { useLocation, Link } from "react-router-dom";

export const TableLinks = ({ hash, link, display }) => {
  const location = useLocation();
  var selected;
  if (hash === "Students") {
    selected =
      location.pathname.includes(hash) &&
      !location.pathname.includes("MyStudents");
  } else {
    selected = location.pathname.includes(hash);
  }

  return (
    <Link to={link}>
      <button
        type="button"
        class="btn btn-outline-primary"
        id={selected ? "selected" : "selectable"}
      >
        {display}
      </button>
    </Link>
  );
};
