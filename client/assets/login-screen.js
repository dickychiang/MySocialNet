app.pagelet('login-screen', function() {

	// ****************************************************
	// PRIVATE: properties
	// ****************************************************
	var template = null;
	
	// ****************************************************
	// PRIVATE: methods
	// ****************************************************
	var clear = function() {
		app.$('#login-username').val('');
		app.$('#login-password').val('');
		app.$('#login-msg').html('');
	};
	
	var on_button = function() {
		app.$('#login-button').on('click', function() {
			app.session.login(app.$('#login-username').val().trim().toLowerCase(), app.$('#login-password').val().trim(), function(err, msg) {
				if (err) {
					app.$('#login-msg').html(msg);
					return;
				}
				clear();
				
				app.framework.closeModal('#login-screen');
				if (app.view.activePage.name == 'home-page') {
					var a = app.pagelet('home-page');
					app.pagelet('home-page').load(app.view.activePage);
				} else {
					app.go('home-page');
				}
			});
		});
	};

	// ****************************************************
	// PUBLIC
	// ****************************************************	
	return {
		initiate: function() {
			app.$('#login-screen').on('open', clear);
			on_button();
		},
	};
}());