
// Map used to help validate addresses
// when address changes, it needs to display the given address, and return the lat and loc in the form {}

export const MapHelper = (address) => {

    // const handleApiLoaded = (map, maps) => {
    //     const geocoder = new maps.Geocoder();
    //     setMapApi({ geocoder: geocoder, map: map });
    //     setApiLoaded(true);
    //   };
    
    
    //   const searchLocation = () => {
    //     mapApi.geocoder.geocode({ address: user.address }, (results, status) => {
    //       if (!user.address || user.address.trim().length === 0) {
    //         alert("Please Enter an Address");
    //         return;
    //       }
    //       if (status === "OK") {
    //         mapApi.map.setCenter(results[0].geometry.location);
    //         setLng(results[0].geometry.location.lng());
    //         setLat(results[0].geometry.location.lat());
    //         setError(null);
    //         setUser({ ...user, address: user.address });
    //         setAddressValid(true);
    //       } else if (status === "ZERO_RESULTS") {
    //         setAddressValid(false);
    //         setError("No results for that address");
    //         alert("No results for that address");
    //       } else {
    //         setAddressValid(false);
    //         setError("Server Error. Try again later");
    //         alert("Server Error. Try again later");
    //       }
    //     });
    //   };

    return (<div> Map
        {/* <div id="map">
        {error && <div>{error}</div>}
        <div style={{ height: "50vh", width: "80%", display: "inline-block" }}>
          <GoogleMapReact
            bootstrapURLKeys={{
              key: `${process.env.REACT_APP_GOOGLE_MAPS_API}`,
            }}
            defaultCenter={defaultProps.center}
            defaultZoom={defaultProps.zoom}
            yesIWantToUseGoogleMapApiInternals
            onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
          >
            <Marker text="Your Address" lat={lat} lng={lng} isUser />
          </GoogleMapReact>
        </div>
      </div> */}

    </div>)
}