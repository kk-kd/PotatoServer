import "./TableLinks.css";
import { useLocation, Link } from "react-router-dom";

export const TableLinks = ( { hash } ) => {
  const location = useLocation();
  const selected = location.pathname.includes(hash);

  return (
    <Link to={`${hash}/list`}>
      <button id={selected ? "selected" : "selectable"}>{hash}</button>
    </Link>
  );
}
