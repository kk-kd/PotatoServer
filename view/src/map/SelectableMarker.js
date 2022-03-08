import "./SelectableMarker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faLocationPin } from "@fortawesome/free-solid-svg-icons";
import ReactTooltip from "react-tooltip";

export const SelectableMarker = ({ students, onCurrentRoute, notOnRoute, selectRoute, inRangeStop, onCurrentStop }) => {
  var id;
  if (notOnRoute) {
    id = "noRouteMarker";
  } else if (onCurrentRoute && onCurrentStop) {
    id = "currentRouteAndStopMarker";
  } else if (onCurrentRoute) {
    id = "currentRouteMarker";
  } else {
    id = "routeMarker";
  }
  return (
      <>
        <FontAwesomeIcon
            icon={inRangeStop ? faLocationPin : faLocationDot}
            id={id}
            onClick={e => selectRoute(students)}
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
              <p>{student.fullName}</p>
          ))}
        </ReactTooltip>
      </>
  );
}
