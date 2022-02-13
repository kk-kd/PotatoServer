import "./SelectableMarker.css";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationPin } from "@fortawesome/free-solid-svg-icons";
import ReactTooltip from "react-tooltip";

export const SelectableMarker = ({ student, onCurrentRoute, notOnRoute, selectRoute, inRangeStop, onCurrentStop }) => {
  const [showText, setShowText] = useState(false);
  var id;
  if (notOnRoute) {
    id = "noRouteMarker";
  } else if (onCurrentRoute && onCurrentStop) {
    id = "currentRouteAndStopMarker";
  } else if (onCurrentRoute && inRangeStop) {
    id = "currentRouteMarker";
  } else if (onCurrentRoute) {
    id = "currentRouteNoStopMarker";
  } else if (inRangeStop) {
    id = "routeMarker";
  } else {
    id = "noStopMarker";
  }
  return (
      <>
        <FontAwesomeIcon
            icon={faLocationPin}
            size="2xl"
            id={id}
            onClick={e => selectRoute(student)}
            data-tip
            data-for={`studentTooltip${student.uid}`}
        />
        <ReactTooltip
            id={`studentTooltip${student.uid}`}
            place="top"
            effect="solid"
        >
          {`Name: ${student.firstName} ${student.lastName}`}
        </ReactTooltip>
      </>
  );
}
