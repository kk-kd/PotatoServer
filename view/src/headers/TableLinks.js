import "./TableLinks.css";
import { useLocation, Link } from "react-router-dom";

export const TableLinks = ( { hash, link, display } ) => {
  const location = useLocation();
  const selected = location.pathname.includes(hash);

  return (
    <Link to={link}>
      <button id={selected ? "selected" : "selectable"}>{display}</button>
    </Link>
  );
}
