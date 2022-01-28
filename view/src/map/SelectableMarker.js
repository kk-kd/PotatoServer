import "./SelectableMarker.css";

export const SelectableMarker = ({ id, routeId, selectRoute, currentRoute }) => {
  if (!routeId) {
    return (
        <div id="noRouteMarker" onClick={e => selectRoute(id)} />
    );
  } else if (routeId === currentRoute) {
    return (
        <div id="currentRouteMarker" onClick={e => selectRoute(id)} />
    );
  } else {
    return (
        <div id="selectableRouteMarker" onClick={e => selectRoute(id)} />
    );
  }
}
