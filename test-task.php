<?php
/**
 * Plugin Name:       Test task
 * Description:       Test task for Quantenwerft Intnl, adds new 'Custom blocks' category with 2 custom blocks: pricing table and map with markers
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Denys Dmytruk
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       qi
 *
 * @package           qi
 */

function qi_cb_add_block_category( $block_categories ) {
	$block_categories[] = [
		'slug' => 'qi_cb',
		'title' => 'Custom Blocks',
	];

	return $block_categories;
}
add_filter( 'block_categories_all', 'qi_cb_add_block_category' );

function test_task_test_task_block_init() {
	register_block_type( __DIR__ . '/build/pricing-table' );
	register_block_type( __DIR__ . '/build/map',
	 [
	 	'render_callback' => 'qi_render_map_block'
	 ]
	 );
}
add_action( 'init', 'test_task_test_task_block_init' );

function qi_render_map_block( $attributes ) {
	ob_start(); ?>

	<div <?php echo get_block_wrapper_attributes(); ?>>
		<div id="map-frontend" data-map-attributes='<?php echo json_encode($attributes); ?>'></div>
	</div>

	<?php
	return ob_get_clean();
}
