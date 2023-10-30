import L from 'leaflet';
import { ICONS } from './constants';

document.addEventListener( 'DOMContentLoaded', function () {
	const mapElement = document.getElementById( 'map-frontend' );
	const attributes = mapElement.dataset;
	const { mapCenter, mapHeight, mapZoom, markers } = JSON.parse(
		attributes.mapAttributes
	);
	mapElement.style.height = mapHeight + 'px';

	const map = L.map( mapElement ).setView(
		[ mapCenter.lat, mapCenter.lng ],
		mapZoom
	);
	L.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		maxZoom: 19,
	} ).addTo( map );

	markers.forEach( ( marker ) => {
		const m = L.marker( [ marker.lat, marker.lng ] ).addTo( map );
		const popupContent = document.createElement( 'div' );
		popupContent.innerHTML = `
				<p><b>${ marker.title }</b></p>
				<p>${ marker.description }</p>
			`;
		m.bindPopup( popupContent );
		m.bindTooltip( marker.title );

		if ( marker.icon !== 'default' ) {
			const markerIcon = L.icon( {
				iconUrl: ICONS.find( ( icon ) => icon.name === marker.icon )
					.src,
				iconSize: [ 30, 30 ],
				iconAnchor: [ 15, 30 ],
				popupAnchor: [ 0, -30 ],
			} );
			m.setIcon( markerIcon );
		}
	} );
} );
