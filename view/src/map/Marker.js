import "./Marker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faLocationPin,
  faMapPin,
  faSchool
} from "@fortawesome/free-solid-svg-icons";
import ReactTooltip from "react-tooltip";

export const Marker = ({ text, onRoute, stop, inRangeStop, detail, isSchool, isStop, isCurrentStop, isUser, students }) => {
  if (isSchool) {
    return (
        <FontAwesomeIcon
            icon={faSchool}
            size="2xl"
            id="schoolMarker"
        />
    );
  } else if (isStop && detail) {
    return (
        <>
          <FontAwesomeIcon
              icon={faMapPin}
              size="2xl"
              id={"stopMarker"}
              data-tip
              data-for={`stopTooltip${stop.uid}`}
          />
          <ReactTooltip
              id={`stopTooltip${stop.uid}`}
              place="top"
              effect="solid"
          >
            {stop.name || `Stop #${stop.uid}`}
          </ReactTooltip>
        </>
    )
  } else if (isStop) {
    return (
        <FontAwesomeIcon
            icon={faMapPin}
            size="2xl"
            id={isCurrentStop ? "currentStopMarker" : "stopMarker"}
        />
    );
  } else if (isUser) {
    return (
      <FontAwesomeIcon
          icon={faMapPin}
          size="2xl"
          id={"stopMarker"}
      />
    )
  }
  return (
      <>
        <FontAwesomeIcon
            icon={inRangeStop ? faLocationPin : faLocationDot}
            id={inRangeStop ? "routeDetailMarker" : "noRouteDetailMarker"}
            data-tip
            data-for={`studentTooltip${students[0].uid}`}
        />
        <ReactTooltip
            id={`studentTooltip${students[0].uid}`}
            place="top"
            effect="solid"
        >
          <p>Students at this location:</p>
          {students.map(student => (
              <p>{`${student.firstName} ${student.lastName}`}</p>
          ))}
        </ReactTooltip>
      </>
  )
  return (
      <div id={isSchool ? "schoolMarker" : "marker"}>{text}</div>
  );
}
