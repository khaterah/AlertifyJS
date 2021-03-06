        /* Controls moving a dialog around */
			//holde the current moving instance
        var movable = null,
			//holds the current X offset when move starts
			offsetX = 0,
			//holds the current Y offset when move starts
			offsetY = 0
		;

        /**
         * Helper: sets the element top/left coordinates
         *
		 * @param {Event} event	DOM event object.
		 * @param {Node} element The element being moved.
		 * 
         * @return {undefined}
         */
        function moveElement(event, element){
            element.style.left = (event.pageX  - offsetX) + 'px';
            element.style.top = (event.pageY  - offsetY) + 'px';
        }

        /**
         * Triggers the start of a move event, attached to the header element mouse down event.
		 * Adds no-selection class to the body, disabling selection while moving.
         *
		 * @param {Event} event	DOM event object.
		 * @param {Object} instance The dilog instance.
		 * 
         * @return {Boolean} false
         */
        function beginMove(event, instance){
            if(event.button === 0 && !instance.isMaximized() && instance.setting('movable')){
                movable = instance;
                offsetX = event.pageX;
                offsetY = event.pageY;
                var element = instance.elements.dialog;
                
                if(element.style.left){
                    offsetX -= parseInt(element.style.left,10);
                }
                
                if(element.style.top){
                    offsetY -= parseInt(element.style.top,10);
                }
                moveElement(event, element);
                
                addClass(document.body, classes.noSelection);
                return false;
            }
        }
        
        /**
         * The actual move handler,  attached to document.body mousemove event.
         *
		 * @param {Event} event	DOM event object.
		 * 
         * @return {undefined}
         */
        function move(event){
            if(movable){
                moveElement(event, movable.elements.dialog);
            }
        }

        /**
         * Triggers the end of a move event,  attached to document.body mouseup event.
         * Removes no-selection class from document.body, allowing selection.
		 *
         * @return {undefined}
         */
        function endMove(){
			if(movable){
				movable = null;
				removeClass(document.body, classes.noSelection);
			}
        }
        
        /**
         * Resets any changes made by moving the element to its original state,
		 *
		 * @param {Object} instance The dilog instance.
		 *
         * @return {undefined}
         */
        function resetMove(instance){
            var element = instance.elements.dialog;
            element.style.left = element.style.top = '';
        }
		
		/**
         * Updates the dialog move behavior.
		 *
		 * @param {Object} instance The dilog instance.
		 * @param {Boolean} on True to add the behavior, removes it otherwise.
		 *
         * @return {undefined}
         */
        function updateMovable(instance){
			if(instance.setting('movable')){
				// add class
				addClass(instance.elements.root, classes.movable);
				if(instance.isOpen()){
					bindMovableEvents(instance);
				}
			}else{
				
				//reset
				resetMove(instance);
				// remove class
				removeClass(instance.elements.root, classes.movable);
				if(instance.isOpen()){
					unbindMovableEvents(instance);
				}
			}
        }
