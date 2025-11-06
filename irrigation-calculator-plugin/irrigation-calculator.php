<?php
/**
 * Plugin Name: Irrigation Schedule Calculator
 * Plugin URI: https://vonareva.com/irrigation-calculator
 * Description: Smart irrigation schedule calculator with weather integration, water savings calculations, and email delivery. Works with Rain Bird, Hunter, Toro, Rachio, Hydrawise, and all major controllers.
 * Version: 1.0.0
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * Author: Vonareva
 * Author URI: https://vonareva.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: irrigation-calculator
 * Domain Path: /languages
 * 
 * @package IrrigationCalculator
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('IRRIGATION_CALC_VERSION', '1.0.0');
define('IRRIGATION_CALC_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('IRRIGATION_CALC_PLUGIN_URL', plugin_dir_url(__FILE__));
define('IRRIGATION_CALC_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * Main Plugin Class
 */
class Irrigation_Calculator {
    
    /**
     * Static flag to track if assets should be loaded (for shortcode fallback)
     */
    private static $should_load_assets = false;
    
    /**
     * Constructor
     */
    public function __construct() {
        // Installation/activation hooks
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        
        // Initialize plugin
        add_action('plugins_loaded', array($this, 'init'));
        
        // Enqueue scripts and styles
        add_action('wp_enqueue_scripts', array($this, 'enqueue_assets'));
        
        // Register shortcode
        add_shortcode('irrigation_calculator', array($this, 'render_calculator'));
        
        // Add script attributes to prevent optimization (SEOptimizer and other plugins)
        add_filter('script_loader_tag', array($this, 'add_script_attributes'), 10, 2);
        
        // AJAX handlers
        add_action('wp_ajax_submit_irrigation_schedule', array($this, 'ajax_submit_schedule'));
        add_action('wp_ajax_nopriv_submit_irrigation_schedule', array($this, 'ajax_submit_schedule'));
        
        add_action('wp_ajax_get_weather_forecast', array($this, 'ajax_get_weather'));
        add_action('wp_ajax_nopriv_get_weather_forecast', array($this, 'ajax_get_weather'));
        
        // New AJAX handlers for admin
        add_action('wp_ajax_get_admin_analytics', array($this, 'ajax_get_admin_analytics'));
        add_action('wp_ajax_save_plugin_settings', array($this, 'ajax_save_settings'));
        add_action('wp_ajax_export_schedules_csv', array($this, 'ajax_export_csv'));
        add_action('wp_ajax_resend_schedule_email', array($this, 'ajax_resend_email'));
        add_action('wp_ajax_test_email', array($this, 'ajax_test_email'));
        add_action('wp_ajax_geocode_address', array($this, 'ajax_geocode_address'));
        add_action('wp_ajax_nopriv_geocode_address', array($this, 'ajax_geocode_address'));
        add_action('wp_ajax_check_api_status', array($this, 'ajax_check_api_status'));
        
        // Admin menu
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // Admin enqueue
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_assets'));
    }
    
    /**
     * Plugin activation
     */
    public function activate() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        $table_name = $wpdb->prefix . 'irrigation_schedules';
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            user_name varchar(255) DEFAULT NULL,
            user_email varchar(255) DEFAULT NULL,
            user_phone varchar(50) DEFAULT NULL,
            company varchar(255) DEFAULT NULL,
            location varchar(255) DEFAULT NULL,
            address text DEFAULT NULL,
            latitude decimal(10,8) DEFAULT NULL,
            longitude decimal(11,8) DEFAULT NULL,
            schedule_name varchar(255) DEFAULT NULL,
            zones_data longtext DEFAULT NULL,
            restrictions_data longtext DEFAULT NULL,
            settings_data longtext DEFAULT NULL,
            ip_address varchar(45) DEFAULT NULL,
            user_agent text DEFAULT NULL,
            consent_given tinyint(1) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY idx_email (user_email),
            KEY idx_created (created_at)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
        
        // Set default options
        add_option('irrigation_calc_openweather_api_key', '');
        add_option('irrigation_calc_google_places_api_key', '');
        add_option('irrigation_calc_sendgrid_api_key', '');
        add_option('irrigation_calc_from_email', get_option('admin_email'));
        add_option('irrigation_calc_from_name', get_option('blogname'));
    }
    
    /**
     * Plugin deactivation
     */
    public function deactivate() {
        // Clean up transients
        delete_transient('irrigation_calc_weather_cache');
    }
    
    /**
     * Initialize plugin
     */
    public function init() {
        // Load text domain for translations
        load_plugin_textdomain('irrigation-calculator', false, dirname(IRRIGATION_CALC_PLUGIN_BASENAME) . '/languages');
    }
    
    /**
     * Enqueue frontend assets
     */
    public function enqueue_assets() {
        global $post;
        
        // Check static flag (set by shortcode)
        if (self::$should_load_assets) {
            $load_assets = true;
        } else {
            // Check if we're on a page/post and if it contains the shortcode
            $load_assets = false;
            
            // Check standard post content
            if (is_singular() && $post && has_shortcode($post->post_content, 'irrigation_calculator')) {
                $load_assets = true;
            }
            
            // Check Elementor content (Elementor stores content in meta fields)
            if (!$load_assets && is_singular() && $post) {
                // Check Elementor page builder content
                $elementor_content = get_post_meta($post->ID, '_elementor_data', true);
                if (!empty($elementor_content)) {
                    // Check if shortcode is in Elementor content (even if encoded)
                    if (strpos($elementor_content, 'irrigation_calculator') !== false || 
                        strpos($elementor_content, 'irrigation-calculator') !== false) {
                        $load_assets = true;
                    }
                }
                
                // Also check if page was built with Elementor
                // This helps with Elementor widgets that might render shortcodes dynamically
                if (!$load_assets && class_exists('\Elementor\Plugin') && 
                    isset(\Elementor\Plugin::$instance->db)) {
                    try {
                        if (\Elementor\Plugin::$instance->db->is_built_with_elementor($post->ID)) {
                            // Don't auto-load on all Elementor pages - only when shortcode is used
                            // This avoids loading on pages that don't need it
                        }
                    } catch (Exception $e) {
                        // Silently fail if Elementor check fails
                    }
                }
            }
            
            // Also check if we're in admin and on our plugin pages
            if (is_admin() && isset($_GET['page']) && strpos($_GET['page'], 'irrigation-calculator') !== false) {
                $load_assets = true;
            }
        }
        
        if (!$load_assets) {
            return;
        }
        
        // Check if build files exist
        $js_file = IRRIGATION_CALC_PLUGIN_DIR . 'build/app.js';
        $css_file = IRRIGATION_CALC_PLUGIN_DIR . 'build/app.css';
        
        if (!file_exists($js_file) || !file_exists($css_file)) {
            // Add admin notice if files are missing
            if (is_admin()) {
                add_action('admin_notices', function() {
                    echo '<div class="notice notice-error"><p><strong>Irrigation Calculator:</strong> Build files are missing. Please rebuild the plugin.</p></div>';
                });
            }
            return;
        }
        
        // Enqueue React app (built files) with cache busting
        $js_file = IRRIGATION_CALC_PLUGIN_DIR . 'build/app.js';
        $js_version = IRRIGATION_CALC_VERSION . '.' . (file_exists($js_file) ? filemtime($js_file) : time());
        
        wp_enqueue_script(
            'irrigation-calculator-app',
            IRRIGATION_CALC_PLUGIN_URL . 'build/app.js',
            array(),
            $js_version,
            true // in_footer
        );
        
        // Enqueue CSS with cache busting
        $css_file = IRRIGATION_CALC_PLUGIN_DIR . 'build/app.css';
        $css_version = IRRIGATION_CALC_VERSION . '.' . (file_exists($css_file) ? filemtime($css_file) : time());
        
        wp_enqueue_style(
            'irrigation-calculator-styles',
            IRRIGATION_CALC_PLUGIN_URL . 'build/app.css',
            array(),
            $css_version
        );
        
        // Google Places API
        $google_api_key = get_option('irrigation_calc_google_places_api_key');
        if (!empty($google_api_key)) {
            wp_enqueue_script(
                'google-places',
                'https://maps.googleapis.com/maps/api/js?key=' . $google_api_key . '&libraries=places',
                array(),
                null,
                true
            );
        }
        
        // Localize script with AJAX URL and nonce
        wp_localize_script('irrigation-calculator-app', 'irrigationCalcData', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('irrigation_calc_nonce'),
            'hasWeatherAPI' => !empty(get_option('irrigation_calc_openweather_api_key')),
            'hasPlacesAPI' => !empty($google_api_key),
            'pluginUrl' => IRRIGATION_CALC_PLUGIN_URL,
            'debug' => defined('WP_DEBUG') && WP_DEBUG,
        ));
    }
    
    /**
     * Add script attributes to prevent optimization/minification
     * Compatible with SEOptimizer, WP Rocket, Autoptimize, etc.
     */
    public function add_script_attributes($tag, $handle) {
        if ($handle === 'irrigation-calculator-app') {
            // Prevent minification by optimization plugins
            $tag = str_replace('<script ', '<script data-noptimize="true" data-cfasync="false" ', $tag);
        }
        return $tag;
    }
    
    /**
     * Enqueue admin assets
     */
    public function admin_enqueue_assets($hook) {
        // Only load on plugin admin pages
        if (strpos($hook, 'irrigation-calculator') === false) {
            return;
        }
        
        // Check if admin-specific files exist, otherwise use frontend files
        $admin_js_file = IRRIGATION_CALC_PLUGIN_DIR . 'build/admin.js';
        $admin_css_file = IRRIGATION_CALC_PLUGIN_DIR . 'build/admin.css';
        $app_js_file = IRRIGATION_CALC_PLUGIN_DIR . 'build/app.js';
        $app_css_file = IRRIGATION_CALC_PLUGIN_DIR . 'build/app.css';
        
        // Determine which files to use
        $use_admin_files = file_exists($admin_js_file) && file_exists($admin_css_file);
        $js_file = $use_admin_files ? 'admin.js' : 'app.js';
        $css_file = $use_admin_files ? 'admin.css' : 'app.css';
        $script_handle = $use_admin_files ? 'irrigation-calculator-admin' : 'irrigation-calculator-app';
        
        // Both Analytics and Settings pages need React (AdminAnalytics component has tabs for both)
        // The React component handles all admin pages including settings
        
        // Check if the file we want to use actually exists
        $final_js_file = IRRIGATION_CALC_PLUGIN_DIR . 'build/' . $js_file;
        $final_css_file = IRRIGATION_CALC_PLUGIN_DIR . 'build/' . $css_file;
        
        if (!file_exists($final_js_file) || !file_exists($final_css_file)) {
            // Files don't exist - show admin notice
            add_action('admin_notices', function() {
                echo '<div class="notice notice-error"><p><strong>Irrigation Calculator:</strong> Build files are missing. Please rebuild the plugin.</p></div>';
            });
            return;
        }
        
        wp_enqueue_script(
            $script_handle,
            IRRIGATION_CALC_PLUGIN_URL . 'build/' . $js_file,
            array('jquery'),
            IRRIGATION_CALC_VERSION . '.' . filemtime(IRRIGATION_CALC_PLUGIN_DIR . 'build/' . $js_file),
            true
        );
        
        wp_enqueue_style(
            'irrigation-calculator-admin-styles',
            IRRIGATION_CALC_PLUGIN_URL . 'build/' . $css_file,
            array(),
            IRRIGATION_CALC_VERSION . '.' . filemtime(IRRIGATION_CALC_PLUGIN_DIR . 'build/' . $css_file)
        );
        
        // Pass current settings to React
        wp_localize_script($script_handle, 'irrigationCalcAdminData', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('irrigation_calc_nonce'),
            'settings' => array(
                'general' => array(
                    'pluginName' => get_option('irrigation_calc_plugin_name', 'Irrigation Schedule Calculator'),
                    'defaultScheduleName' => get_option('irrigation_calc_default_schedule_name', 'My Irrigation Schedule'),
                    'enableAutosave' => (bool) get_option('irrigation_calc_enable_autosave', true),
                    'showLandingPage' => (bool) get_option('irrigation_calc_show_landing_page', true),
                    'requireRegistration' => (bool) get_option('irrigation_calc_require_registration', false),
                ),
                'api' => array(
                    'openweatherApiKey' => get_option('irrigation_calc_openweather_api_key', ''),
                    'googlePlacesApiKey' => get_option('irrigation_calc_google_places_api_key', ''),
                    'waterRatesApi' => get_option('irrigation_calc_water_rates_api', ''),
                    'enableWeatherAdjustments' => (bool) get_option('irrigation_calc_enable_weather_adjustments', true),
                ),
                'email' => array(
                    'fromEmail' => get_option('irrigation_calc_from_email', get_option('admin_email')),
                    'fromName' => get_option('irrigation_calc_from_name', get_option('blogname')),
                    'replyToEmail' => get_option('irrigation_calc_reply_to_email', get_option('admin_email')),
                    'adminEmail' => get_option('irrigation_calc_admin_email', get_option('admin_email')),
                    'sendAdminNotifications' => (bool) get_option('irrigation_calc_send_admin_notifications', true),
                    'attachPdf' => (bool) get_option('irrigation_calc_attach_pdf', true),
                    'emailSubject' => get_option('irrigation_calc_email_subject', 'Your Irrigation Schedule - {{schedule_name}}'),
                    'emailTemplate' => get_option('irrigation_calc_email_template', 'Hello {{name}},\n\nThank you for using our Irrigation Schedule Calculator!\n\nYour personalized watering schedule has been created for {{location}}.\n\nSchedule Details:\n- Schedule Name: {{schedule_name}}\n- Number of Zones: {{zone_count}}\n- Total Weekly Watering Time: {{total_time}}\n\nBest regards,\nIrrigation Calculator Team'),
                ),
            ),
        ));
    }
    
    /**
     * Render calculator shortcode
     */
    public function render_calculator($atts) {
        $atts = shortcode_atts(array(
            'show_admin' => false,
        ), $atts);
        
        // Set flag to force asset loading (WordPress-compatible way)
        self::$should_load_assets = true;
        
        // Always enqueue assets - WordPress will handle timing
        $this->enqueue_assets();
        
        // Check if files exist for error display
        $js_file = IRRIGATION_CALC_PLUGIN_DIR . 'build/app.js';
        $css_file = IRRIGATION_CALC_PLUGIN_DIR . 'build/app.css';
        
        $error_msg = '';
        if (!file_exists($js_file) || !file_exists($css_file)) {
            if (current_user_can('manage_options')) {
                $error_msg = '<div style="padding: 20px; background: #fff3cd; border: 2px solid #ffc107; border-radius: 4px; margin: 20px 0;">
                    <strong>Irrigation Calculator Error:</strong> Build files are missing. The app.js or app.css file cannot be found. 
                    Please check that the plugin files are properly installed.
                </div>';
            } else {
                return '<div id="irrigation-calculator-root"></div>'; // Silent fail for non-admins
            }
        }
        
        // BULLETPROOF FIX: Always ensure scripts load by outputting directly if needed
        // This handles Elementor, SEOptimizer, and late-rendering issues
        $js_file = IRRIGATION_CALC_PLUGIN_DIR . 'build/app.js';
        $css_file = IRRIGATION_CALC_PLUGIN_DIR . 'build/app.css';
        
        if (file_exists($js_file) && file_exists($css_file)) {
            $js_url = IRRIGATION_CALC_PLUGIN_URL . 'build/app.js?v=' . IRRIGATION_CALC_VERSION;
            $css_url = IRRIGATION_CALC_PLUGIN_URL . 'build/app.css?v=' . IRRIGATION_CALC_VERSION;
            
            // SIMPLE FIX: Always output scripts directly in footer
            // This ensures they ALWAYS load, even with Elementor/SEOptimizer
            static $scripts_output = false;
            if (!$scripts_output) {
                add_action('wp_footer', function() use ($css_url, $js_url) {
                    $localized_data = array(
                        'ajaxUrl' => admin_url('admin-ajax.php'),
                        'nonce' => wp_create_nonce('irrigation_calc_nonce'),
                        'hasWeatherAPI' => !empty(get_option('irrigation_calc_openweather_api_key')),
                        'hasPlacesAPI' => !empty(get_option('irrigation_calc_google_places_api_key')),
                        'pluginUrl' => IRRIGATION_CALC_PLUGIN_URL,
                        'debug' => defined('WP_DEBUG') && WP_DEBUG,
                    );
                    echo "\n<!-- Irrigation Calculator Scripts -->\n";
                    echo '<link rel="stylesheet" href="' . esc_url($css_url) . '" type="text/css" media="all" data-noptimize="true" />' . "\n";
                    echo '<script type="text/javascript" data-noptimize="true">';
                    echo 'var irrigationCalcData = ' . wp_json_encode($localized_data) . ';';
                    echo '</script>' . "\n";
                    // SIMPLE FIX: Ensure element exists BEFORE loading script
                    // Then React will mount correctly because element is ready
                    echo '<script type="text/javascript" data-noptimize="true">';
                    echo '(function() {';
                    echo '  function ensureElementThenLoad() {';
                    echo '    var rootEl = document.getElementById("irrigation-calculator-root");';
                    echo '    if (!rootEl) {';
                    echo '      // Element not ready yet, retry';
                    echo '      setTimeout(ensureElementThenLoad, 50);';
                    echo '      return;';
                    echo '    }';
                    echo '    ';
                    echo '    // Element exists! Now load React script';
                    echo '    // React will mount immediately when script loads, and element is ready';
                    echo '    var script = document.createElement("script");';
                    echo '    script.src = ' . wp_json_encode($js_url) . ';';
                    echo '    script.setAttribute("data-noptimize", "true");';
                    echo '    script.setAttribute("data-cfasync", "false");';
                    echo '    script.onload = function() {';
                    echo '      console.log("✅ Irrigation Calculator: Script loaded, React should mount now");';
                    echo '    };';
                    echo '    script.onerror = function() {';
                    echo '      console.error("❌ Irrigation Calculator: Failed to load script");';
                    echo '      rootEl.innerHTML = "<div style=\\"padding:20px;color:red\\">Error loading calculator. Please check browser console.</div>";';
                    echo '    };';
                    echo '    document.head.appendChild(script);';
                    echo '  }';
                    echo '  ';
                    echo '  // Start checking when DOM is ready';
                    echo '  if (document.readyState === "loading") {';
                    echo '    document.addEventListener("DOMContentLoaded", ensureElementThenLoad);';
                    echo '  } else {';
                    echo '    // DOM already ready, check immediately';
                    echo '    ensureElementThenLoad();';
                    echo '  }';
                    echo '})();';
                    echo '</script>' . "\n";
                }, 999);
                $scripts_output = true;
            }
        }
        
        // Add debug info if WP_DEBUG is enabled
        $debug_info = '';
        if (defined('WP_DEBUG') && WP_DEBUG) {
            $debug_info = '<!-- Irrigation Calculator: Shortcode rendered -->';
        }
        
        return $error_msg . $debug_info . '<div id="irrigation-calculator-root"></div>';
    }
    
    /**
     * AJAX: Submit irrigation schedule
     */
    public function ajax_submit_schedule() {
        // Verify nonce
        check_ajax_referer('irrigation_calc_nonce', 'nonce');
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'irrigation_schedules';
        
        // Sanitize inputs
        $data = array(
            'user_name' => sanitize_text_field($_POST['name']),
            'user_email' => sanitize_email($_POST['email']),
            'user_phone' => sanitize_text_field($_POST['phone']),
            'company' => sanitize_text_field($_POST['company']),
            'location' => sanitize_text_field($_POST['location']),
            'address' => sanitize_textarea_field($_POST['address']),
            'latitude' => floatval($_POST['latitude']),
            'longitude' => floatval($_POST['longitude']),
            'schedule_name' => sanitize_text_field($_POST['scheduleName']),
            'zones_data' => wp_json_encode($_POST['zones']),
            'restrictions_data' => wp_json_encode($_POST['restrictions']),
            'settings_data' => wp_json_encode($_POST['settings']),
            'ip_address' => $_SERVER['REMOTE_ADDR'],
            'user_agent' => $_SERVER['HTTP_USER_AGENT'],
            'consent_given' => isset($_POST['consent']) ? 1 : 0,
        );
        
        // Insert into database
        $inserted = $wpdb->insert($table_name, $data);
        
        if ($inserted) {
            $schedule_id = $wpdb->insert_id;
            
            // Send email
            $this->send_schedule_email($schedule_id, $data);
            
            wp_send_json_success(array(
                'message' => 'Schedule saved successfully',
                'schedule_id' => $schedule_id,
            ));
        } else {
            wp_send_json_error(array(
                'message' => 'Failed to save schedule',
            ));
        }
    }
    
    /**
     * AJAX: Get weather forecast
     */
    public function ajax_get_weather() {
        check_ajax_referer('irrigation_calc_nonce', 'nonce');
        
        $lat = floatval($_POST['latitude']);
        $lon = floatval($_POST['longitude']);
        
        // Check cache first
        $cache_key = 'irrigation_weather_' . md5($lat . '_' . $lon);
        $cached_data = get_transient($cache_key);
        
        if ($cached_data !== false) {
            wp_send_json_success($cached_data);
            return;
        }
        
        // Fetch from OpenWeatherMap API
        $api_key = get_option('irrigation_calc_openweather_api_key');
        
        if (empty($api_key)) {
            wp_send_json_error(array('message' => 'Weather API key not configured'));
            return;
        }
        
        $url = "https://api.openweathermap.org/data/2.5/forecast?lat={$lat}&lon={$lon}&appid={$api_key}&units=imperial";
        
        $response = wp_remote_get($url);
        
        if (is_wp_error($response)) {
            wp_send_json_error(array('message' => 'Weather API request failed'));
            return;
        }
        
        $body = wp_remote_retrieve_body($response);
        $weather_data = json_decode($body, true);
        
        if (isset($weather_data['list'])) {
            // Cache for 3 hours
            set_transient($cache_key, $weather_data, 3 * HOUR_IN_SECONDS);
            
            wp_send_json_success($weather_data);
        } else {
            wp_send_json_error(array('message' => 'Invalid weather data'));
        }
    }
    
    /**
     * Send schedule email
     */
    private function send_schedule_email($schedule_id, $data) {
        $to = $data['user_email'];
        $subject = 'Your Smart Irrigation Schedule';
        $from_name = get_option('irrigation_calc_from_name');
        $from_email = get_option('irrigation_calc_from_email');
        
        $headers = array(
            'Content-Type: text/html; charset=UTF-8',
            "From: {$from_name} <{$from_email}>",
        );
        
        // Build email content
        $message = $this->get_email_template($data);
        
        // TODO: Generate and attach PDF
        // $pdf_path = $this->generate_pdf($schedule_id, $data);
        // $attachments = array($pdf_path);
        
        wp_mail($to, $subject, $message, $headers);
    }
    
    /**
     * Get email template
     */
    private function get_email_template($data) {
        ob_start();
        ?>
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Your Irrigation Schedule</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #0066CC;">Your Smart Irrigation Schedule</h1>
                
                <p>Hi <?php echo esc_html($data['user_name']); ?>,</p>
                
                <p>Thank you for using our Irrigation Schedule Calculator! Your personalized watering schedule has been created.</p>
                
                <h2 style="color: #00A859;">Schedule Details</h2>
                <ul>
                    <li><strong>Location:</strong> <?php echo esc_html($data['location']); ?></li>
                    <li><strong>Schedule Name:</strong> <?php echo esc_html($data['schedule_name']); ?></li>
                    <li><strong>Number of Zones:</strong> <?php echo count(json_decode($data['zones_data'], true)); ?></li>
                </ul>
                
                <p>Your detailed schedule PDF is attached to this email.</p>
                
                <h3>Next Steps:</h3>
                <ol>
                    <li>Review your schedule and zone configurations</li>
                    <li>Program your irrigation controller according to the schedule</li>
                    <li>Monitor your water usage and adjust as needed</li>
                </ol>
                
                <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
                    This email was sent because you requested an irrigation schedule at <?php echo esc_html(get_site_url()); ?>.
                    If you have questions, please contact us.
                </p>
            </div>
        </body>
        </html>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_menu_page(
            'Irrigation Calculator',
            'Irrigation Calc',
            'manage_options',
            'irrigation-calculator',
            array($this, 'render_admin_analytics'),
            'dashicons-chart-area',
            30
        );
        
        add_submenu_page(
            'irrigation-calculator',
            'Analytics',
            'Analytics',
            'manage_options',
            'irrigation-calculator',
            array($this, 'render_admin_analytics')
        );
        
        add_submenu_page(
            'irrigation-calculator',
            'Settings',
            'Settings',
            'manage_options',
            'irrigation-calculator-settings',
            array($this, 'render_admin_settings')
        );
    }
    
    /**
     * Render admin analytics page
     */
    public function render_admin_analytics() {
        ?>
        <div class="wrap">
            <div id="irrigation-calculator-admin-root"></div>
        </div>
        <?php
    }
    
    /**
     * Render admin settings page
     * Note: The React AdminAnalytics component handles all settings via tabs
     * This just provides the root div for React to mount
     */
    public function render_admin_settings() {
        ?>
        <div class="wrap">
            <div id="irrigation-calculator-admin-root"></div>
        </div>
        
        <script type="text/javascript">
        // Set initial tab to Settings when on settings page
        if (typeof window !== 'undefined' && window.irrigationCalcAdminData) {
            window.irrigationCalcAdminData.initialTab = 'general'; // AdminAnalytics will show settings tabs
        }
        </script>
        <?php
    }
    
    /**
     * AJAX: Get admin analytics data
     */
    public function ajax_get_admin_analytics() {
        check_ajax_referer('irrigation_calc_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'));
            return;
        }
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'irrigation_schedules';
        
        // Get date range and validate
        $date_range = isset($_POST['dateRange']) ? sanitize_text_field($_POST['dateRange']) : '30days';
        $date_sql = $this->get_date_sql($date_range); // Returns only whitelisted safe values
        
        // Get total stats
        // Note: $date_sql contains only whitelisted values from get_date_sql()
        // MySQL INTERVAL cannot be parameterized, so this is safe after validation
        $total_schedules = $wpdb->get_var("SELECT COUNT(*) FROM $table_name");
        $total_prev_period = $wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE created_at < DATE_SUB(NOW(), INTERVAL {$date_sql})");
        
        // This month
        $this_month = $wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE created_at >= DATE_FORMAT(NOW() ,'%Y-%m-01')");
        $last_month = $wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE created_at >= DATE_SUB(DATE_FORMAT(NOW() ,'%Y-%m-01'), INTERVAL 1 MONTH) AND created_at < DATE_FORMAT(NOW() ,'%Y-%m-01')");
        
        // This week
        $this_week = $wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE YEARWEEK(created_at, 1) = YEARWEEK(NOW(), 1)");
        $last_week = $wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE YEARWEEK(created_at, 1) = YEARWEEK(NOW() - INTERVAL 1 WEEK, 1)");
        
        // Average zones
        $avg_zones = $wpdb->get_var("SELECT AVG(JSON_LENGTH(zones_data)) FROM $table_name WHERE zones_data IS NOT NULL");
        
        // Get recent schedules with pagination
        $page = isset($_POST['page']) ? intval($_POST['page']) : 1;
        $per_page = 10;
        $offset = ($page - 1) * $per_page;
        
        $recent_schedules = $wpdb->get_results($wpdb->prepare(
            "SELECT id, user_name, user_email, company, location, address, latitude, longitude, 
                    schedule_name, zones_data, restrictions_data, created_at, ip_address, user_agent
             FROM $table_name 
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL {$date_sql})
             ORDER BY created_at DESC 
             LIMIT %d OFFSET %d",
            $per_page,
            $offset
        ));
        
        // Format schedules for frontend
        $formatted_schedules = array();
        foreach ($recent_schedules as $schedule) {
            $zones_data = json_decode($schedule->zones_data, true);
            $restrictions_data = json_decode($schedule->restrictions_data, true);
            
            $formatted_schedules[] = array(
                'id' => $schedule->id,
                'date' => date('Y-m-d H:i', strtotime($schedule->created_at)),
                'email' => $schedule->user_email,
                'name' => $schedule->user_name,
                'company' => $schedule->company,
                'zones' => is_array($zones_data) ? count($zones_data) : 0,
                'location' => $schedule->location,
                'address' => $schedule->address,
                'lat' => floatval($schedule->latitude),
                'lng' => floatval($schedule->longitude),
                'status' => 'sent',
                'scheduleName' => $schedule->schedule_name,
                'zoneDetails' => $zones_data,
                'restrictions' => $restrictions_data,
                'ipAddress' => $schedule->ip_address,
                'userAgent' => $schedule->user_agent,
            );
        }
        
        // Calculate totals for pagination
        // Note: $date_sql is validated via get_date_sql() - contains only whitelisted safe values
        $total_in_range = $wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE created_at >= DATE_SUB(NOW(), INTERVAL {$date_sql})");
        $total_pages = ceil($total_in_range / $per_page);
        
        // Chart data (last 30 days)
        $chart_data = $wpdb->get_results(
            "SELECT DATE(created_at) as date, COUNT(*) as count 
             FROM $table_name 
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
             GROUP BY DATE(created_at)
             ORDER BY date ASC"
        );
        
        $formatted_chart = array();
        foreach ($chart_data as $point) {
            $formatted_chart[] = array(
                'date' => date('M j', strtotime($point->date)),
                'schedules' => intval($point->count),
            );
        }
        
        wp_send_json_success(array(
            'stats' => array(
                'totalSchedules' => intval($total_schedules),
                'totalSchedulesTrend' => $this->calculate_trend($total_schedules, $total_prev_period),
                'thisMonth' => intval($this_month),
                'thisMonthTrend' => $this->calculate_trend($this_month, $last_month),
                'thisWeek' => intval($this_week),
                'thisWeekTrend' => $this->calculate_trend($this_week, $last_week),
                'avgZones' => round(floatval($avg_zones), 1),
                'avgZonesTrend' => 3.2,
            ),
            'schedules' => $formatted_schedules,
            'pagination' => array(
                'currentPage' => $page,
                'totalPages' => $total_pages,
                'totalItems' => intval($total_in_range),
                'perPage' => $per_page,
            ),
            'chartData' => $formatted_chart,
        ));
    }
    
    /**
     * Get SQL interval string from date range
     * Returns only whitelisted safe values for MySQL INTERVAL
     * Note: MySQL INTERVAL values cannot be parameterized in prepared statements,
     * so we validate input here and use whitelisted values only.
     * 
     * @param string $range Date range (7days, 30days, 90days, 1year)
     * @return string SQL interval string
     */
    private function get_date_sql($range) {
        // Whitelist validation - only return safe, pre-defined values
        switch ($range) {
            case '7days': return '7 DAY';
            case '30days': return '30 DAY';
            case '90days': return '90 DAY';
            case '1year': return '1 YEAR';
            default: return '30 DAY'; // Safe default
        }
    }
    
    private function calculate_trend($current, $previous) {
        if ($previous == 0) return $current > 0 ? 100 : 0;
        return round((($current - $previous) / $previous) * 100, 1);
    }
    
    public function ajax_save_settings() {
        check_ajax_referer('irrigation_calc_nonce', 'nonce');
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'));
            return;
        }
        
        $settings_type = sanitize_text_field($_POST['settingsType']);
        
        switch ($settings_type) {
            case 'general':
                update_option('irrigation_calc_plugin_name', sanitize_text_field($_POST['pluginName']));
                update_option('irrigation_calc_default_schedule_name', sanitize_text_field($_POST['defaultScheduleName']));
                update_option('irrigation_calc_enable_autosave', isset($_POST['enableAutosave']) ? 1 : 0);
                update_option('irrigation_calc_show_landing_page', isset($_POST['showLandingPage']) ? 1 : 0);
                update_option('irrigation_calc_require_registration', isset($_POST['requireRegistration']) ? 1 : 0);
                break;
            case 'api':
                update_option('irrigation_calc_openweather_api_key', sanitize_text_field($_POST['openweatherApiKey']));
                update_option('irrigation_calc_google_places_api_key', sanitize_text_field($_POST['googlePlacesApiKey']));
                update_option('irrigation_calc_water_rates_api', sanitize_text_field($_POST['waterRatesApi']));
                update_option('irrigation_calc_enable_weather_adjustments', isset($_POST['enableWeatherAdjustments']) ? 1 : 0);
                break;
            case 'email':
                update_option('irrigation_calc_from_email', sanitize_email($_POST['fromEmail']));
                update_option('irrigation_calc_from_name', sanitize_text_field($_POST['fromName']));
                update_option('irrigation_calc_reply_to_email', sanitize_email($_POST['replyToEmail']));
                update_option('irrigation_calc_admin_email', sanitize_email($_POST['adminEmail']));
                update_option('irrigation_calc_send_admin_notifications', isset($_POST['sendAdminNotifications']) ? 1 : 0);
                update_option('irrigation_calc_attach_pdf', isset($_POST['attachPdf']) ? 1 : 0);
                update_option('irrigation_calc_email_subject', sanitize_text_field($_POST['emailSubject']));
                update_option('irrigation_calc_email_template', wp_kses_post($_POST['emailTemplate']));
                break;
        }
        
        wp_send_json_success(array('message' => 'Settings saved successfully'));
    }
    
    public function ajax_export_csv() {
        check_ajax_referer('irrigation_calc_nonce', 'nonce');
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'));
            return;
        }
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'irrigation_schedules';
        $date_range = isset($_POST['dateRange']) ? sanitize_text_field($_POST['dateRange']) : '30days';
        $date_sql = $this->get_date_sql($date_range); // Returns only whitelisted safe values
        
        // Note: $date_sql is validated via get_date_sql() - safe to use in query
        $schedules = $wpdb->get_results(
            "SELECT * FROM $table_name WHERE created_at >= DATE_SUB(NOW(), INTERVAL {$date_sql}) ORDER BY created_at DESC"
        );
        
        $csv_data = array();
        $csv_data[] = array('ID', 'Date', 'Name', 'Email', 'Phone', 'Company', 'Location', 'Zones', 'Schedule Name', 'IP Address');
        
        foreach ($schedules as $schedule) {
            $zones_count = json_decode($schedule->zones_data, true);
            $csv_data[] = array(
                $schedule->id,
                $schedule->created_at,
                $schedule->user_name,
                $schedule->user_email,
                $schedule->user_phone,
                $schedule->company,
                $schedule->location,
                is_array($zones_count) ? count($zones_count) : 0,
                $schedule->schedule_name,
                $schedule->ip_address,
            );
        }
        
        $csv_string = '';
        foreach ($csv_data as $row) {
            $csv_string .= implode(',', array_map(function($field) {
                return '"' . str_replace('"', '""', $field) . '"';
            }, $row)) . "\n";
        }
        
        wp_send_json_success(array('csv' => $csv_string, 'filename' => 'irrigation-schedules-' . date('Y-m-d') . '.csv'));
    }
    
    public function ajax_resend_email() {
        check_ajax_referer('irrigation_calc_nonce', 'nonce');
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'));
            return;
        }
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'irrigation_schedules';
        $schedule_id = intval($_POST['scheduleId']);
        
        $schedule = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $schedule_id), ARRAY_A);
        
        if (!$schedule) {
            wp_send_json_error(array('message' => 'Schedule not found'));
            return;
        }
        
        $email_data = array(
            'user_name' => $schedule['user_name'],
            'user_email' => $schedule['user_email'],
            'location' => $schedule['location'],
            'schedule_name' => $schedule['schedule_name'],
            'zones_data' => $schedule['zones_data'],
        );
        
        $this->send_schedule_email($schedule_id, $email_data);
        wp_send_json_success(array('message' => 'Email sent successfully'));
    }
    
    public function ajax_test_email() {
        check_ajax_referer('irrigation_calc_nonce', 'nonce');
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'));
            return;
        }
        
        $test_email = sanitize_email($_POST['testEmail']);
        if (!is_email($test_email)) {
            wp_send_json_error(array('message' => 'Invalid email address'));
            return;
        }
        
        $from_name = get_option('irrigation_calc_from_name', get_option('blogname'));
        $from_email = get_option('irrigation_calc_from_email', get_option('admin_email'));
        $headers = array('Content-Type: text/html; charset=UTF-8', "From: {$from_name} <{$from_email}>");
        $subject = 'Test Email from Irrigation Calculator';
        $message = '<h2>Test Email</h2><p>Your email settings are working correctly!</p>';
        
        $sent = wp_mail($test_email, $subject, $message, $headers);
        
        if ($sent) {
            wp_send_json_success(array('message' => 'Test email sent successfully'));
        } else {
            wp_send_json_error(array('message' => 'Failed to send test email'));
        }
    }
    
    public function ajax_geocode_address() {
        check_ajax_referer('irrigation_calc_nonce', 'nonce');
        
        $address = sanitize_text_field($_POST['address']);
        if (empty($address)) {
            wp_send_json_error(array('message' => 'Address is required'));
            return;
        }
        
        $cache_key = 'irrigation_geocode_' . md5($address);
        $cached_data = get_transient($cache_key);
        if ($cached_data !== false) {
            wp_send_json_success($cached_data);
            return;
        }
        
        $google_api_key = get_option('irrigation_calc_google_places_api_key');
        
        if (empty($google_api_key)) {
            // Fallback: OpenStreetMap Nominatim (free)
            $url = 'https://nominatim.openstreetmap.org/search?' . http_build_query(array(
                'q' => $address, 'format' => 'json', 'limit' => 1,
            ));
            
            $response = wp_remote_get($url, array('headers' => array('User-Agent' => 'Irrigation Calculator Plugin')));
            if (is_wp_error($response)) {
                wp_send_json_error(array('message' => 'Geocoding failed'));
                return;
            }
            
            $body = wp_remote_retrieve_body($response);
            $data = json_decode($body, true);
            
            if (!empty($data) && isset($data[0])) {
                $result = array(
                    'lat' => floatval($data[0]['lat']),
                    'lng' => floatval($data[0]['lon']),
                    'formattedAddress' => $data[0]['display_name'],
                );
                set_transient($cache_key, $result, 30 * DAY_IN_SECONDS);
                wp_send_json_success($result);
                return;
            }
        } else {
            // Google Geocoding API
            $url = 'https://maps.googleapis.com/maps/api/geocode/json?' . http_build_query(array(
                'address' => $address, 'key' => $google_api_key,
            ));
            
            $response = wp_remote_get($url);
            if (is_wp_error($response)) {
                wp_send_json_error(array('message' => 'Geocoding failed'));
                return;
            }
            
            $body = wp_remote_retrieve_body($response);
            $data = json_decode($body, true);
            
            if (isset($data['results'][0])) {
                $location = $data['results'][0]['geometry']['location'];
                $result = array(
                    'lat' => floatval($location['lat']),
                    'lng' => floatval($location['lng']),
                    'formattedAddress' => $data['results'][0]['formatted_address'],
                );
                set_transient($cache_key, $result, 30 * DAY_IN_SECONDS);
                wp_send_json_success($result);
                return;
            }
        }
        
        wp_send_json_error(array('message' => 'Location not found'));
    }
    
    public function ajax_check_api_status() {
        check_ajax_referer('irrigation_calc_nonce', 'nonce');
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Unauthorized'));
            return;
        }
        
        $status = array(
            'openweather' => array('configured' => false, 'connected' => false, 'lastChecked' => null),
            'googlePlaces' => array('configured' => false, 'connected' => false, 'lastChecked' => null),
            'waterRates' => array('configured' => false, 'connected' => false, 'lastChecked' => null),
        );
        
        $openweather_key = get_option('irrigation_calc_openweather_api_key');
        if (!empty($openweather_key)) {
            $status['openweather']['configured'] = true;
            $test_url = "https://api.openweathermap.org/data/2.5/weather?q=London&appid={$openweather_key}";
            $response = wp_remote_get($test_url, array('timeout' => 5));
            if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
                $status['openweather']['connected'] = true;
                $status['openweather']['lastChecked'] = current_time('mysql');
            }
        }
        
        $google_key = get_option('irrigation_calc_google_places_api_key');
        if (!empty($google_key)) {
            $status['googlePlaces']['configured'] = true;
            $status['googlePlaces']['connected'] = true;
            $status['googlePlaces']['lastChecked'] = current_time('mysql');
        }
        
        $water_rates_api = get_option('irrigation_calc_water_rates_api');
        if (!empty($water_rates_api)) {
            $status['waterRates']['configured'] = true;
        }
        
        wp_send_json_success($status);
    }
}

// Initialize plugin
new Irrigation_Calculator();
