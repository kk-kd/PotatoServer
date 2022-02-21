import "./Marker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapPin, faSchool } from "@fortawesome/free-solid-svg-icons";

export const Marker = ({ text, isSchool, isStop, isCurrentStop }) => {
  if (isSchool) {
    return (
        <FontAwesomeIcon
            icon={faSchool}
            size="2xl"
            id="schoolMarker"
        />
    );
  } else if (isStop) {
    return (
        <FontAwesomeIcon
            icon={faMapPin}
            size="2xl"
            id={isCurrentStop ? "currentStopMarker" : "stopMarker"}
        />
    );
  }
  return (
      <div id={isSchool ? "schoolMarker" : "marker"}>{text}</div>
  );
}
