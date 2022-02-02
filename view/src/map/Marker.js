import "./Marker.css";

export const Marker = ({ text, isSchool }) => {
  return (
      <div id={isSchool ? "schoolMarker" : "marker"}>{text}</div>
  );
}
