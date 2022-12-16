<?php

  /** Register custom components */
  // 1. Point to the JS files
  wp_enqueue_script('component-script', '/path/to/js/index.js');

  // 2. Function ro render simple component
  function simpleComponent (){
    return '<component-name></component-name>';
  }

  // 3. Register shortcode
  add_shortcode('simple-component', 'simpleComponent');

  // Render component with attributes
  function advancedComponent ($atts) {
    $default = array(
      'lang' => 'de'
    );
    $var = shortcode_atts($default, $atts);

    return '<component-name lang="'.$var["lang"].'></component-name>';
  }

// Use this code as follows: [component-name]

add_shortcode('advanced-component', 'advancedComponent');
// Use this code as follows: [component-name lang='nl']
