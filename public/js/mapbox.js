/* eslint-disable */
// const mapboxgl = require('mapbox-gl');
// import mapboxgl from "mapbox-gl";

import mapboxgl from "mapbox-gl";



export const displayMap = (locations)=>{
  mapboxgl.accessToken = 'pk.eyJ1IjoiYWhtZWRlbGl3YSIsImEiOiJjbGk0Y3IyYjUxOXJlM2RvNGE5b3gydmtlIn0.mPwrCCfWv_ygox-zzAzlRA';
 
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11.2',
    scrollZoom:false
  });

  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach(loc => {
      const el = document.createElement('div');
      el.className='marker'
    // });

    // Add Marker 
    new mapboxgl.Marker({
      element:el,
      anchor:"bottom"
    })
    .setLngLat(loc.coordinates)
    .addTo(map);

    // Add Popup
    new mapboxgl.Popup({
      offset:30
    })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds,{
    padding:{
      top:200,
      bottom:150,
      left:100,
      right:100
    }
  })
}

