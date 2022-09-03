/* eslint-disable */
// console.log(locations);

export const displayMap = function (locations) {
  mapboxgl.accessToken =
    "pk.eyJ1IjoiZnJlZGludGVrIiwiYSI6ImNsN29hemF0bTAzcjkzeG10ZGJlY2VxOGcifQ.0moMwWWo_I6kS_TeHR4HQQ";
  const map = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/fredintek/cl7ob3p30001z14mzb4wdvknx", // style URL
    zoom: 7,
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement("div");
    el.className = "marker";

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: "bottom",
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extends(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
