import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
export default function save( { attributes } ) {
	const { plans } = attributes;
	return !! plans.length ? (
		<div
			{ ...useBlockProps.save() }
			className="wp-block-qi-pricing-table__container"
		>
			{ plans.map( ( plan ) => {
				if (
					! plan.name ||
					! plan.features ||
					! plan.buttonURL ||
					! plan.buttonText
				)
					return null;

				const target = plan.openInNewTab ? { target: '_blank' } : '';
				const price = plan.price
					? `${ plan.price.toFixed( 2 ) } EUR`
					: __( 'Free', 'qi' );
				return (
					<div
						key={ plan.id }
						className={ `wp-block-qi-pricing-table__plan-item ${ plan.colorSchema }` }
					>
						<h3>{ plan.name }</h3>
						<p>{ plan.features }</p>
						<p>
							{ __( 'Price', 'qi' ) }: <b>{ price }</b>
						</p>
						<div className="wp-block-qi-pricing-table__plan-link-container">
							<a
								className={ `wp-block-qi-pricing-table__plan-link ${ plan.colorSchema }` }
								href={ plan.buttonURL }
								{ ...target }
							>
								{ plan.buttonText }
							</a>
						</div>
					</div>
				);
			} ) }
		</div>
	) : null;
}
