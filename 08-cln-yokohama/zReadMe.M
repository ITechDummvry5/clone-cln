Public Folder => public Assets , Public Layout.
// Assets => Contains public-specific assets like css , Js  , images [sub folder->] others.
// Layout => Contains public-specific layout configurations like Header , Footer.

Secure Folder => Config , Sql. Htaccess , Env.
// Config => Contains system configuration files, auth_handler , forgot_handler , function , Connector{database}  .
// Sql => Contains the database files or configurations.
// htaccess => Contains the .htaccess file for server configuration and security settings.
// Env => Contains environment variables and configurations for the application.
// Auth_handler => Contains the authentication handler for user login and session management.
// Forgot_handler => Contains the handler for forgot password functionality.
// Function => Contains utility functions used across the application.

Private Folder => Auth File , Assets , Ui.
// auth File => Contain Checking Users/admin/systemadmin Authentication access pages.
// Assets => Contain Assets like Css , Js , Uploads Image .
// ui => Contain Layout for Header , navbar , Sidebar and Main Panel.
// Plugins => Contain Ext or Libraries.

Index => (login.php , forgot_password.php , index.php , about_us.php , feature.php etc.) 
 Outside the public folder, this is the main entry point of the application.
// login.php => Contains the login page for user authentication.
// forgot_password.php => Contains the forgot password page for user authentication.

Tools Folder =>



