(function(){
	var page_id = 'home-page';
	var tab_prefix = 'tab-';
	var template = null;
	var contacts_list_template = null;
	var friends = {};
	
	// ****************************************************
	// PRIVATE: methods
	// ****************************************************
	var on_goto_user_page = function(p, user) {
		p.find('[goto="user-page-' + user.id + '"]').on('click', function() {
			app.go('user-page', {user: user});
		});
	};
	
	var load_contacts = function() {
		if (template == null) {
			template = Template7.compile(app.$('#' + page_id + '-template').html());
			contacts_list_template = Template7.compile(app.$('#contacts-list-template').html());
		}
		app.session.getUsers(function(err, users) {
			if (!err) {
				var data = {
					contacts:  nlib.array(users, ['lastName', 'firstName'])
				};
				var p = app.$('#contacts-list');
				p.html(contacts_list_template(data));
				
				data.contacts.forEach(function(user) {
					on_goto_user_page(p, user);
				});
			}
		});
	};
	
	var on_goto = function(p) {
		p.find('[goto="log-out-button"]').on('click', function() {
			app.session.logout();
			app.framework.loginScreen();
		});
		p.find('[id*="' + tab_prefix + '"]').on('show', function() {
			var id = app.$(this).prop('id');
			if (id.indexOf(tab_prefix) == 0) {
				var tab = id.substring(tab_prefix.length);
				var pvalue = nlib.localStorage.value('page');
				pvalue.tab = tab;
				nlib.localStorage.value('page', pvalue);
			}
		});
	};
	
	var load = function(page) {
		if (template == null) {
			template = Template7.compile(app.$('#' + page_id + '-template').html());
			contacts_list_template = Template7.compile(app.$('#contacts-list-template').html());
		}
		
		var pvalue = nlib.localStorage.value('page');
		if (!pvalue) {
			pvalue = { page_id: page_id };
			nlib.localStorage.value('page', pvalue);
		}

		var p = app.$(page.container);
		p.html(template({}));
		load_contacts();
		
		if (pvalue.tab) {
			app.framework.showTab('#' + tab_prefix + pvalue.tab);
		} else {
			app.framework.showTab('#' + tab_prefix + 'contacts');
		}
		
		on_goto(p);
	};

	// ****************************************************
	// PUBLIC
	// ****************************************************	
	app.pagelet(page_id, {
		initiate: function() {
			app.framework.onPageBeforeAnimation(page_id, load);
			app.socket.listen('online', load_contacts);
		},
		load: load
	});
})();