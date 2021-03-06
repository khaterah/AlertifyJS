    /**
     * Alertify public API
     * This contains everything that is exposed through the alertify object.
     *
     * @return {Object}
     */
    function Alertify () {
        
        // holds a references of created dialogs
        var dialogs = {};
				
		/**
		 * Extends a given prototype by merging properties from base into sub.
		 *
		 * @sub {Object} sub The prototype being overwritten.
		 * @base {Object} base The prototype being written.
		 *
		 * @return {Object} The extended prototype.
		 */
        function extend(sub, base){
			// copy dialog pototype over definition.
            for(var prop in base){
				if(base.hasOwnProperty(prop)){
					sub[prop] = base[prop];
				}
            }
            return sub;
        }
		
		
		/**
		* Helper: returns a dialog instance from saved dialogs.
		* and initializes the dialog if its not already initialized.
		*
		* @name {String} name The dialog name.
		*
		* @return {Object} The dialog instance.
		*/
		function get_dialog(name){
            var dialog = dialogs[name].dialog;
            //initialize the dialog if its not already initialized.
            if(dialog && typeof dialog.__init === 'function'){
                dialog.__init(dialog);
            }
            return dialog;
        }
		
		/**
		 * Helper:  registers a new dialog definition.
		 *
		 * @name {String} name The dialog name.
		 * @Factory {Function} Factory a function resposible for creating dialog prototype.
		 * @transient {Boolean} transient True to create a new dialog instance each time the dialog is invoked, false otherwise.
		 * @base {String} base the name of another dialog to inherit from.
		 *
		 * @return {Object} The dialog definition.
		 */
		function register(name, Factory, transient, base){
			var definition = {
				dialog:null,
				factory:Factory
			};
			
			//if this is based on an existing dialog, create a new definition
			//by applying the new protoype over the existing one.
			if(base !== undefined){
				definition.factory = function(){
					return extend(new dialogs[base].factory(),new Factory());
				};
			}
			
			if(!transient){
				//create a new definition based on dialog
				definition.dialog = extend(new definition.factory(), dialog);
			}
			return dialogs[name] = definition;
		}

        return {
			/**
             * Alertify defaults
			 * 
             * @type {Object}
             */
			defaults: defaults,
			/**
             * Dialogs factory 
             *
             * @param {string}      Dialog name.
             * @param {Function}    A Dialog factory function.
             * @param {Boolean}     indicates whether to create a singleton or transient dialog.
             * @type {Object}
             */
            dialog: function(name, Factory, transient, base){
                
                // get request, create a new instance and return it.
                if(typeof Factory !== 'function'){
                    return get_dialog(name);
                }
				
				if(this.hasOwnProperty(name)){
					throw new Error('alertify.dialog: name already exists');
				}
				
                // register the dialog
				var definition = register(name, Factory, transient, base);
				
                if(transient){
					
                    // make it public
                    this[name] = function () {
                        //if passed with no params, consider it a get request
                        if (arguments.length === 0) {
                            return definition.dialog;
                        } else {
                            var instance = extend(new definition.factory(), dialog);
                            //ensure init
                            if (instance && typeof instance.__init === 'function') {
                                instance.__init(instance);
                            }
                            instance['main'].apply(instance, arguments);
                            return instance['show'].apply(instance);
                        }
                    };
                }else{
                    // make it public
                    this[name] = function(){
						//ensure init
						if(definition.dialog && typeof definition.dialog.__init === 'function'){
							definition.dialog.__init(definition.dialog);
						}
						//if passed with no params, consider it a get request
						if(arguments.length === 0){
							return definition.dialog;
						} else {
							var dialog = definition.dialog;
							dialog['main'].apply(definition.dialog,arguments);
							return dialog['show'].apply(definition.dialog);
						}
                    };
                }
            },
			/**
			 * Gets or Sets dialog settings/options. if the dialog is transient, this call does nothing.
			 *
             * @param {string} name The dialog name.
			 * @param {String|Object} key A string specifying a propery name or a collection of key/value pairs.
			 * @param {Variant} value Optional, the value associated with the key (in case it was a string).
			 *
			 * @return {undefined}
			 */
            setting:function(name,key,value){
				
				if(name === 'notifier'){
					return notifier.setting(key, value);
				}
				
				var dialog = get_dialog(name);
                if(dialog){
                    return dialog.setting(key,value);
                }
            },
			/**
			 * Creates a new notification message.
			 * If a type is passed, a class name "ajs-{type}" will be added.
			 * This allows for custom look and feel for various types of notifications.
			 *
			 * @param  {String}		[message=undefined]		Message text
			 * @param  {String}		[type='']				Type of log message
			 * @param  {String}		[value='']				Time (in ms) to wait before auto-close
			 * @param  {Function}	[callback=undefined]	A callback function to be invoked when the log is closed.
			 *
			 * @return {undefined}
			 */
            notify: function ( message, type, wait, callback ) {
				notifier.notify(message, type, wait, callback);
            },
			/**
			 * Creates a new notification message.
			 *
			 * @param  {String}		[message=undefined]		Message text
			 * @param  {String}		[type='']				Type of log message
			 * @param  {String}		[value='']				Time (in ms) to wait before auto-close
			 * @param  {Function}	[callback=undefined]	A callback function to be invoked when the log is closed.
			 *
			 * @return {undefined}
			 */
            message: function ( message, wait, callback ) {
				notifier.notify(message, null, wait, callback);
            },
			/**
			 * Creates a new notification message of type 'success'.
			 *
			 * @param  {String}		[message=undefined]		Message text
			 * @param  {String}		[type='']				Type of log message
			 * @param  {String}		[value='']				Time (in ms) to wait before auto-close
			 * @param  {Function}	[callback=undefined]	A callback function to be invoked when the log is closed.
			 *
			 * @return {undefined}
			 */
            success: function ( message, wait, callback ) {
				notifier.notify(message, 'success', wait, callback);
            },
			/**
			 * Creates a new notification message of type 'error'.
			 *
			 * @param  {String}		[message=undefined]		Message text
			 * @param  {String}		[type='']				Type of log message
			 * @param  {String}		[value='']				Time (in ms) to wait before auto-close
			 * @param  {Function}	[callback=undefined]	A callback function to be invoked when the log is closed.
			 *
			 * @return {undefined}
			 */
            error: function ( message, wait, callback ) {
				notifier.notify(message, 'error', wait, callback);
            },
			/**
			 * Creates a new notification message of type 'warning'.
			 *
			 * @param  {String}		[message=undefined]		Message text
			 * @param  {String}		[type='']				Type of log message
			 * @param  {String}		[value='']				Time (in ms) to wait before auto-close
			 * @param  {Function}	[callback=undefined]	A callback function to be invoked when the log is closed.
			 *
			 * @return {undefined}
			 */
            warning: function ( message, wait, callback ) {
				notifier.notify(message, 'warning', wait, callback);
            }

        };
    }
    var alertify = new Alertify();
