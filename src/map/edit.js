import { useEffect, useRef, useState } from '@wordpress/element';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import ServerSideRender from '@wordpress/server-side-render';
import {
	PanelBody,
	RangeControl,
	TextControl,
	TextareaControl,
	ToggleControl,
	SelectControl,
	Button,
	Modal,
	Flex,
	FlexItem,
} from '@wordpress/components';
import L from 'leaflet';
import './editor.scss';

import { ICONS, DEFAULT_MARKER } from './constants';

let map;
let _autoAdjusting = false;
let markersLayerGroup;

export default function Edit( { attributes, setAttributes } ) {
	const [ mode, setMode ] = useState( 'new' );
	const [ isMarkerModal, setMarkerModal ] = useState( false );
	const [ currentMarker, setCurrentMarker ] = useState( DEFAULT_MARKER );
	const { mapCenter, mapZoom, autoAdjusting, mapHeight, markers } =
		attributes;
	const mapContainerRef = useRef( null );

	useEffect( () => {
		if ( mapContainerRef.current && ! map ) {
			map = L.map( mapContainerRef.current ).setView(
				[ mapCenter.lat, mapCenter.lng ],
				mapZoom
			);
			L.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
				maxZoom: 19,
			} ).addTo( map );

			markersLayerGroup = L.layerGroup().addTo( map );

			//to prevent bug with map dragging
			map.on( 'mouseup', function () {
				if ( map.dragging.enabled() ) {
					map.dragging.disable();
					map.dragging.enable();
				}
			} );

			function setMapSettings() {
				if ( _autoAdjusting ) {
					const newMapCenter = map.getCenter();
					const newMapZoom = map.getZoom();
					setAttributes( {
						mapCenter: {
							lat: newMapCenter.lat,
							lng: newMapCenter.lng,
						},
						mapZoom: newMapZoom,
					} );
				}
			}

			map.on( 'zoomend', setMapSettings );
			map.on( 'mouseup', setMapSettings );
			map.on( 'contextmenu', function ( event ) {
				const clickedLatLng = event.latlng;
				setMode( 'add' );
				setCurrentMarker( ( prevState ) => {
					return {
						...prevState,
						lat: clickedLatLng.lat,
						lng: clickedLatLng.lng,
					};
				} );
				setMarkerModal( true );
			} );
		}
	}, [] );

	function openMarker( marker ) {
		setMode( 'edit' );
		setCurrentMarker( { ...marker } );
		setMarkerModal( true );
	}
	const deleteMarker = ( marker ) => {
		const newMarkers = markers.filter( ( m ) => m.id !== marker.id );
		setAttributes( { markers: newMarkers } );
	};

	useEffect( () => {
		markersLayerGroup.clearLayers();
		markers.forEach( ( marker ) => {
			const m = L.marker( [ marker.lat, marker.lng ] ).addTo(
				markersLayerGroup
			);
			const popupContent = document.createElement( 'div' );
			popupContent.innerHTML = `
				<p><b>${ marker.title }</b></p>
				<p>${ marker.description }</p>
				<div class="wp-block-qi-map__marker-contols">
					<button class="wp-block-qi-map__marker-delete-button" id="delete-${ marker.id }">Delete</button>
					<button id="edit-${ marker.id }">Edit</button>
				</div>
			`;
			popupContent
				.querySelector( '#delete-' + marker.id )
				.addEventListener( 'click', () => deleteMarker( marker ) );
			popupContent
				.querySelector( '#edit-' + marker.id )
				.addEventListener( 'click', () => openMarker( marker ) );

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
	}, [ markers ] );

	useEffect( () => {
		_autoAdjusting = autoAdjusting;
	}, [ autoAdjusting ] );

	useEffect( () => {
		if ( map ) {
			map.setZoom( mapZoom );
		}
	}, [ mapZoom ] );

	useEffect( () => {
		if ( map ) {
			map.setView( [ mapCenter.lat, mapCenter.lng ], mapZoom );
		}
	}, [ mapCenter ] );

	const closeMarkerModal = () => {
		setCurrentMarker( DEFAULT_MARKER );
		setMarkerModal( false );
	};

	const saveMarker = () => {
		if ( mode === 'add' ) {
			setAttributes( {
				markers: [ ...markers, currentMarker ],
			} );
		} else if ( mode === 'edit' ) {
			const newMarkers = markers.map( ( marker ) => {
				if ( marker.id === currentMarker.id ) {
					return currentMarker;
				}
				return marker;
			} );
			setAttributes( { markers: newMarkers } );
		}
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title="Map Settings">
					<ToggleControl
						label="Automatically adjust map settings"
						checked={ autoAdjusting }
						onChange={ ( value ) =>
							setAttributes( { autoAdjusting: value } )
						}
					/>
					<TextControl
						type="number"
						label="Latitude"
						disabled={ autoAdjusting }
						value={ mapCenter.lat }
						onChange={ ( value ) =>
							setAttributes( {
								mapCenter: { ...mapCenter, lat: value },
							} )
						}
					/>
					<TextControl
						type="number"
						label="Longtitude"
						disabled={ autoAdjusting }
						value={ mapCenter.lng }
						onChange={ ( value ) =>
							setAttributes( {
								mapCenter: { ...mapCenter, lng: value },
							} )
						}
					/>
					<RangeControl
						label="Map Zoom"
						value={ mapZoom }
						disabled={ autoAdjusting }
						min={ 0 }
						max={ 19 }
						onChange={ ( value ) => {
							setAttributes( { mapZoom: value } );
						} }
					/>
					<RangeControl
						label="Map Height"
						value={ mapHeight }
						min={ 250 }
						max={ 600 }
						onChange={ ( value ) => {
							setAttributes( { mapHeight: value } );
						} }
					/>
				</PanelBody>
				<PanelBody title="Markers">
					{ markers.map( ( marker ) => {
						return (
							<Flex
								align="space-between"
								key={ marker.id }
								className="wp-block-qi-map__marker-list-item"
							>
								<FlexItem>
									<p className="wp-block-qi-map__marker-title">
										{ marker.title }
									</p>
								</FlexItem>
								<FlexItem
									style={ { minWidth: '40px' } }
									flexGrow={ 1 }
								>
									<Flex>
										<FlexItem>
											<button
												onClick={ () => {
													openMarker( marker );
												} }
											>
												<span className="dashicons dashicons-edit wp-block-qi-map__marker-control-icon"></span>
											</button>
										</FlexItem>
										<FlexItem>
											<button
												onClick={ () => {
													deleteMarker( marker );
												} }
											>
												<span className="dashicons dashicons-trash wp-block-qi-map__marker-control-icon"></span>
											</button>
										</FlexItem>
									</Flex>
								</FlexItem>
							</Flex>
						);
					} ) }
				</PanelBody>
			</InspectorControls>
			{ isMarkerModal && (
				<Modal
					title={ mode === 'add' ? 'Add new marker' : 'Edit marker' }
					onRequestClose={ closeMarkerModal }
				>
					<TextControl
						style={ {
							borderColor:
								currentMarker.title.trim().length < 1
									? 'red'
									: 'rgb(148, 148, 148)',
						} }
						label="Marker title"
						value={ currentMarker.title }
						onChange={ ( value ) => {
							setCurrentMarker( ( prevState ) => {
								return {
									...prevState,
									title: value,
								};
							} );
						} }
					/>
					{ currentMarker.title.trim().length < 1 && (
						<div className="wp-block-qi-map__error-message">
							{ __( 'Required field', 'qi' ) }
						</div>
					) }
					<TextareaControl
						style={ {
							borderColor:
								currentMarker.description.trim().length < 1
									? 'red'
									: 'rgb(148, 148, 148)',
						} }
						label="Marker description"
						value={ currentMarker.description }
						onChange={ ( value ) => {
							setCurrentMarker( ( prevState ) => {
								return {
									...prevState,
									description: value,
								};
							} );
						} }
					/>
					{ currentMarker.description.trim().length < 1 && (
						<div className="wp-block-qi-map__error-message">
							{ __( 'Required field', 'qi' ) }
						</div>
					) }
					<TextControl
						type="number"
						label="Marker Latitude"
						value={ currentMarker.lat }
						onChange={ ( value ) =>
							setCurrentMarker( ( prev ) => {
								return {
									...prev,
									lat: +value,
								};
							} )
						}
					/>
					{ currentMarker.lat.length < 1 && (
						<div className="wp-block-qi-map__error-message">
							{ __( 'Required field', 'qi' ) }
						</div>
					) }
					<TextControl
						type="number"
						label="Marker Longtitude"
						value={ currentMarker.lng }
						onChange={ ( value ) =>
							setCurrentMarker( ( prev ) => {
								return {
									...prev,
									lng: +value,
								};
							} )
						}
					/>
					<SelectControl
						label="Marker icon"
						value={ currentMarker.icon }
						onChange={ ( value ) =>
							setCurrentMarker( ( prev ) => {
								return {
									...prev,
									icon: value,
								};
							} )
						}
						options={ ICONS.map( ( icon ) => {
							return {
								value: icon.name,
								label: icon.name,
							};
						} ) }
					/>
					{ currentMarker.icon !== 'default' && (
						<img
							src={
								ICONS.find(
									( icon ) => icon.name === currentMarker.icon
								).src
							}
							alt={ currentMarker.icon }
						/>
					) }
					<Flex justify="flex-end">
						<FlexItem>
							<Button
								variant="secondary"
								onClick={ closeMarkerModal }
							>
								Cancel
							</Button>
							<Button
								style={ { marginLeft: '15px' } }
								variant="primary"
								onClick={ () => {
									saveMarker();
									closeMarkerModal();
								} }
								disabled={
									currentMarker.title.length < 1 ||
									currentMarker.description.length < 1
								}
							>
								{ mode === 'add' ? 'Add' : 'Save' }
							</Button>
						</FlexItem>
					</Flex>
				</Modal>
			) }
			<div { ...useBlockProps() }>
				<p style={ { marginBottom: '10px' } }>
					To add a new marker, please right-click on the place on the
					map where you want to add it.
				</p>
				<div
					ref={ mapContainerRef }
					style={ { height: `${ mapHeight }px` } }
				></div>
				<ServerSideRender block="qi/map" />
			</div>
		</>
	);
}
