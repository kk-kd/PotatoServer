import "./Header.css";
import { TableLinks } from "./TableLinks";

export const Header = () => {

  return (
      <div className="Header">
        <TableLinks hash="Schools" />
        <TableLinks hash="Users" />
        <TableLinks hash="Students" />
        <TableLinks hash="Routes" />
      </div>
  );
}
