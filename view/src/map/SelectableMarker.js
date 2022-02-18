import "./SelectableMarker.css";
import { useState } from "react";

export const SelectableMarker = ({ student, onCurrentRoute, notOnRoute, selectRoute }) => {
  const [showText, setShowText] = useState(false);
  if (notOnRoute) {
    return (
        <div id="noRouteMarker"
             onClick={e => selectRoute(student)}
             onMouseEnter={e => setShowText(true)}
             onMouseLeave={e => setShowText(false)}
        >{showText && `${student.firstName} ${student.lastName}`}</div>
    );
  } else if (onCurrentRoute) {
    return (
        <div id="currentRouteMarker"
             onClick={e => selectRoute(student)}
             onMouseEnter={e => setShowText(true)}
             onMouseLeave={e => setShowText(false)}
        >{showText && `${student.firstName} ${student.lastName}`}</div>
    );
  } else {
    return (
        <div id="selectableRouteMarker"
             onClick={e => selectRoute(student)}
             onMouseEnter={e => setShowText(true)}
             onMouseLeave={e => setShowText(false)}
            >{showText && `${student.firstName} ${student.lastName}`}</div>
    );
  }
}
