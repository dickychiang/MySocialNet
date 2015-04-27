var app = (function(global) {
	// ****************************************************
	// PRIVATE - Properties
	// ****************************************************
	var framework = new Framework7();
	var view = framework.addView('#main-view', {
		dynamicNavbar: true,
		domCache: true
	});
	var pagelets = {};
	
	// ****************************************************
	// PRIVATE - Methods
	// ****************************************************
	var go = function(page_id, param, back) {
		if (!param) param = { };
		param.page_id = page_id;
		
		nlib.localStorage.value('page', param );
		if (back) {
			app.view.router.back({ pageName: page_id, force: true });
		} else {
			app.view.router.load({ pageName: page_id, force: true });
		}
	}
		
	// ****************************************************
	// PUBLIC
	// ****************************************************
	return {
	
		// ************************************************
		// Properties
		// ************************************************
		framework: framework,
		$: Dom7,
		view: view,
		cache: null,
		api_root: api_root,
		api_path: api_root + '/api',
		
		// ************************************************
		// Methods - Initiation
		// ************************************************
		start: function() {
			nlib.webapp.checkUpdates();
			iNoBounce.enable();
			
			app.socket.initiate();
			app.session.initiate();
			
			for (var i in pagelets) {
				if (!pagelets.hasOwnProperty(i)) continue;
				var pagelet = pagelets[i];
				if (pagelet.initiate) pagelet.initiate();
			}

			var tasks = [];
			async.series(tasks, function(err, results) {
				var pvalue = nlib.localStorage.value('page');
				if (pvalue && pvalue.page_id && pagelets[pvalue.page_id]) {
					view.router.load({
						pageName: pvalue.page_id,
						animatePages: false
					});
				} else {
					view.router.load({
						pageName: 'home-page',
						animatePages: false
					});
				}
				if (!app.session.instance()) {
					app.framework.loginScreen();
				}
			});
		},
		
		// ************************************************
		// Methods
		// ************************************************
		pagelet: function(name, pagelet) {
			if (pagelet) {
				pagelets[name] = pagelet;
			} else {
				return pagelets[name];
			}
		},
		
		go: function(page_id, param) {
			go(page_id, param, false);
		},
		
		back: function(page_id, param) {
			go(page_id, param, true);
		}
	};
}(this));
