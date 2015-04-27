(function(){
	var page_id = 'chat-page';
	var template = null;
	var messages_list_template = null;
	
	// ****************************************************
	// PRIVATE: methods
	// ****************************************************	
	
	var load_messages = function(userId) {
		if (template == null) {
			template = Template7.compile(app.$('#' + page_id + '-template').html());
			messages_list_template = Template7.compile(app.$('#messages-list-template').html());
		}
		app.session.getMessages(userId, function(err, messages) {
			if (!err) {
				var data = {
					messages:  messages
				};
				var p = app.$('#messages-list');
				p.html(messages_list_template(data));
			}
		});
	};
	
	var on_goto = function(p, user) {
		p.find('[goto="home-page"]').on('click', function() {
			app.back('home-page');
		});
		p.find('#send-button').on('click', function() {
			var msg = p.find('#message-content').val();
			if (msg && msg.length > 0) {
				app.socket.send('message', {
					from: app.session.instance().userId,
					to: user.id,
					content: msg
				});
			}
		});
	};
	
	var load = function(page) {
		if (template == null) {
			template = Template7.compile(app.$('#' + page_id + '-template').html());
			messages_list_template = Template7.compile(app.$('#messages-list-template').html());
		}
		
		var pvalue = nlib.localStorage.value('page');
		if (pvalue && pvalue.user) {
			
			var data = {
				user: pvalue.user
			};
			var p = app.$(page.container);
			p.html(template(data));

			on_goto(p, pvalue.user);
		
		} else {
			app.go('home-page');
		}
	};

	// ****************************************************
	// PUBLIC
	// ****************************************************	
	app.pagelet(page_id, {
		initiate: function() {
			app.framework.onPageBeforeAnimation(page_id, load);
			app.socket.listen('message', function() {
				var pvalue = nlib.localStorage.value('page');
				if (pvalue && pvalue.page_id == page_id && pvalue.user) {
					load_messages(pvalue.user.id);
				};
			});
		},
		load: load
	});
})();