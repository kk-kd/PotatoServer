import "./SelectableMarker.css";
import { useState } from "react";

export const SelectableMarker = ({ id, routeId, selectRoute, currentRoute, text }) => {
  const [showText, setShowText] = useState(false);
  if (!routeId) {
    return (
        <div id="noRouteMarker"
             onClick={e => selectRoute(id)}
             onMouseEnter={e => setShowText(true)}
             onMouseLeave={e => setShowText(false)}
        >{showText && `${text}`}</div>
    );
  } else if (routeId === currentRoute) {
    return (
        <div id="currentRouteMarker"
             onClick={e => selectRoute(id)}
             onMouseEnter={e => setShowText(true)}
             onMouseLeave={e => setShowText(false)}
        >{showText && `${text}`}</div>
    );
  } else {
    return (
        <div id="selectableRouteMarker"
             onClick={e => selectRoute(id)}
             onMouseEnter={e => setShowText(true)}
             onMouseLeave={e => setShowText(false)}
            >{showText && `${text}`}</div>
    );
  }
}
