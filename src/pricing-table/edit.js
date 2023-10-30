import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	TextControl,
	TextareaControl,
	Button,
	PanelBody,
	ColorPalette,
	Flex,
	FlexItem,
	ToggleControl,
} from '@wordpress/components';

import './editor.scss';

const MAX_PRICE = 10000;

const COLORS = [
	{ name: 'Variant 1', color: '#7bdcb5', id: 'variant1' },
	{ name: 'Variant 2', color: '#8ED1FC', id: 'variant2' },
	{ name: 'Variant 3', color: '#fcb900', id: 'variant3' },
];
const PlanColorPalette = ( {
	plans,
	selectedPlan,
	setSelectedPlan,
	setAttributes,
} ) => {
	const color = COLORS.find(
		( c ) => c.id === selectedPlan.colorSchema
	)?.color;
	const onColorChange = ( newColor ) => {
		const colorId = COLORS.find( ( c ) => c.color === newColor )?.id || '';
		const newPlans = plans.map( ( plan ) => {
			if ( plan.id === selectedPlan.id ) {
				return { ...plan, colorSchema: colorId };
			}
			return plan;
		} );
		setSelectedPlan( ( prevState ) => {
			return {
				...prevState,
				colorSchema: colorId,
			};
		} );
		setAttributes( { plans: newPlans } );
	};

	return (
		<ColorPalette
			colors={ COLORS }
			value={ color }
			onChange={ ( selectedColor ) => onColorChange( selectedColor ) }
		/>
	);
};
export default function Edit( { attributes, setAttributes } ) {
	const [ selectedPlan, setSelectedPlan ] = useState( null );
	const { plans } = attributes;
	function addPlan() {
		const newPlans = [
			...plans,
			{
				id: Date.now(), // unique id
				name: 'Example plan',
				features: "Plan's features",
				price: 0,
				buttonText: __( 'Select', 'qi' ),
				buttonURL: 'https://example.com',
				colorSchema: '',
				openInNewTab: false,
			},
		];
		setAttributes( { plans: newPlans } );
	}

	function removePlan( planId ) {
		const newPlans = plans.filter( ( plan ) => plan.id !== planId );
		setAttributes( { plans: newPlans } );
	}

	const changePlanField = ( value, field, planId ) => {
		const newPlans = plans.map( ( plan ) => {
			if ( plan.id === planId ) {
				return { ...plan, [ field ]: value };
			}
			return plan;
		} );
		setAttributes( { plans: newPlans } );
	};

	const changePlanPrice = ( value, planId ) => {
		let price = parseFloat( value );
		if ( price <= 0 ) {
			price = 0;
		} else if ( price >= MAX_PRICE ) {
			price = MAX_PRICE;
		}
		const newPlans = plans.map( ( plan ) => {
			if ( plan.id === planId ) {
				return { ...plan, price };
			}
			return plan;
		} );
		setAttributes( { plans: newPlans } );
	};

	const movePlan = ( plan, direction ) => {
		const currentPosition = plans.findIndex( ( p ) => p.id === plan.id );
		const desiredPosition = currentPosition + direction;

		if ( desiredPosition >= 0 && desiredPosition < plans.length ) {
			const newPlans = [ ...plans ];
			newPlans.splice( currentPosition, 1 );
			newPlans.splice( desiredPosition, 0, plan );
			setAttributes( { plans: newPlans } );
		}
	};
	const movePlanUp = ( plan ) => {
		movePlan( plan, -1 );
	};

	const movePlanDown = ( plan ) => {
		movePlan( plan, 1 );
	};

	const containsInvalidPlans = plans.some( ( plan ) => {
		return (
			plan.name.trim().length < 1 ||
			plan.features.trim().length < 1 ||
			plan.buttonText.trim().length < 1 ||
			plan.buttonURL.trim().length < 1
		);
	} );

	return (
		<div { ...useBlockProps() }>
			{ plans.map( ( plan, i, arr ) => {
				const cannotMoveUp = i <= 0;
				const cannotMoveDown = i >= arr.length - 1;
				return (
					<div
						role="button"
						tabIndex="0"
						key={ plan.id }
						onClick={ () => setSelectedPlan( plan ) }
						onKeyDown={ ( e ) => {
							if ( e.key === 'Enter' ) {
								setSelectedPlan( plan );
							}
						} }
						className="wp-block-qi-pricing-table__plan-container"
					>
						<div
							className={ `wp-block-qi-pricing-table__plan-item ${ plan.colorSchema }` }
						>
							<Flex align="start">
								<FlexItem style={ { width: '50%' } }>
									<Flex direction="column" gap={ 0 }>
										<FlexItem style={ { width: '100%' } }>
											<TextControl
												style={ {
													borderColor:
														plan.name.trim()
															.length < 1
															? 'red'
															: 'rgb(148, 148, 148)',
												} }
												label="Plan Name *"
												value={ plan.name }
												onChange={ ( value ) =>
													changePlanField(
														value,
														'name',
														plan.id
													)
												}
											/>
											{ plan.name.trim().length < 1 && (
												<div className="wp-block-qi-pricing-table__error-message">
													{ __(
														'Required field',
														'qi'
													) }
												</div>
											) }
										</FlexItem>
										<FlexItem style={ { width: '100%' } }>
											<TextControl
												type="number"
												label="Price *"
												value={ plan.price }
												onChange={ ( value ) =>
													changePlanPrice(
														value,
														plan.id
													)
												}
											/>
										</FlexItem>
									</Flex>
								</FlexItem>
								<FlexItem style={ { width: '50%' } }>
									<TextareaControl
										style={ {
											borderColor:
												plan.features.trim().length < 1
													? 'red'
													: 'rgb(148, 148, 148)',
											minHeight: 98,
										} }
										label="Features *"
										value={ plan.features }
										onChange={ ( value ) =>
											changePlanField(
												value,
												'features',
												plan.id
											)
										}
									/>
									{ plan.features.trim().length < 1 && (
										<div className="wp-block-qi-pricing-table__error-message">
											{ __( 'Required field', 'qi' ) }
										</div>
									) }
								</FlexItem>
							</Flex>
							<Flex align="start">
								<FlexItem style={ { width: '50%' } }>
									<TextControl
										style={ {
											borderColor:
												plan.buttonText.trim().length <
												1
													? 'red'
													: 'rgb(148, 148, 148)',
										} }
										label="Button Text *"
										value={ plan.buttonText }
										onChange={ ( value ) =>
											changePlanField(
												value,
												'buttonText',
												plan.id
											)
										}
									/>
									{ plan.buttonText.trim().length < 1 && (
										<div className="wp-block-qi-pricing-table__error-message">
											{ __( 'Required field', 'qi' ) }
										</div>
									) }
								</FlexItem>
								<FlexItem style={ { width: '50%' } }>
									<TextControl
										style={ {
											borderColor:
												plan.buttonURL.trim().length < 1
													? 'red'
													: 'rgb(148, 148, 148)',
										} }
										label="Button URL *"
										value={ plan.buttonURL }
										onChange={ ( value ) =>
											changePlanField(
												value,
												'buttonURL',
												plan.id
											)
										}
									/>
									{ plan.buttonURL.trim().length < 1 && (
										<div className="wp-block-qi-pricing-table__error-message">
											{ __( 'Required field', 'qi' ) }
										</div>
									) }
								</FlexItem>
							</Flex>
							<Flex align="start">
								<FlexItem
									style={ {
										width: '50%',
										marginTop: '15px',
									} }
								>
									<ToggleControl
										label="Open in new tab"
										checked={ plan.openInNewTab }
										onChange={ ( value ) =>
											changePlanField(
												value,
												'openInNewTab',
												plan.id
											)
										}
									/>
								</FlexItem>
								<FlexItem style={ { width: '50%' } }>
									<div className="wp-block-qi-pricing-table__label">
										{ __( 'Button example', 'qi' ) }
									</div>
									<a
										className={ `wp-block-qi-pricing-table__plan-link ${ plan.colorSchema }` }
										href={ plan.buttonURL }
									>
										{ plan.buttonText }
									</a>
								</FlexItem>
							</Flex>
						</div>
						<Flex align="start" style={ { marginTop: '20px' } }>
							<FlexItem>
								<Button
									isDestructive
									onClick={ () => removePlan( plan.id ) }
								>
									Remove Plan
								</Button>
							</FlexItem>
							<FlexItem>
								<Button
									disabled={ cannotMoveDown }
									variant="secondary"
									onClick={ () => movePlanDown( plan ) }
								>
									Move Down
								</Button>
								<Button
									style={ { marginLeft: '10px' } }
									disabled={ cannotMoveUp }
									variant="secondary"
									onClick={ () => movePlanUp( plan ) }
								>
									Move Up
								</Button>
							</FlexItem>
						</Flex>
					</div>
				);
			} ) }
			{ containsInvalidPlans && (
				<div className="wp-block-qi-pricing-table__error-message">
					{ __(
						'Plans with validation errors will be not displayed on the frontend',
						'qi'
					) }
				</div>
			) }

			<Flex justify="flex-end">
				<FlexItem>
					<Button isPrimary onClick={ addPlan }>
						Add Plan
					</Button>
				</FlexItem>
			</Flex>

			<InspectorControls>
				{ selectedPlan && (
					<PanelBody
						title={ `Plan ${ selectedPlan.name } Color Schema` }
					>
						<PlanColorPalette
							plans={ plans }
							selectedPlan={ selectedPlan }
							setSelectedPlan={ setSelectedPlan }
							setAttributes={ setAttributes }
						/>
					</PanelBody>
				) }
			</InspectorControls>
		</div>
	);
}
