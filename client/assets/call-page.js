(function(){
	var page_id = 'chat-page';
	var template = null;
	var friends = {};
	
	// ****************************************************
	// PRIVATE: methods
	// ****************************************************	
	var on_goto = function(p, user) {
		p.find('[goto="home-page"]').on('click', function() {
			app.back('home-page');
		});
	};
	
	var load = function(page) {
		if (template == null) {
			template = Template7.compile(app.$('#' + page_id + '-template').html());
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
		},
		load: load
	});
})();