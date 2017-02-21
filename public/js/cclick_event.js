
function mouse_controll(rendering){
	var raycaster = new THREE.Raycaster();
	var mouse = new THREE.Vector2();
	var mousewheelevent = 'onwheel' in document ? 'wheel' : 'onmousewheel' in document ? 'mousewheel' : 'DOMMouseScroll';
	var dis = 0;
	window.onmousedown = function(e){
    	if(e.target == rendering.renderer.domElement){
        	e.preventDefault();
        	mouse.x = (e.clientX/window.innerWidth) * 2 - 1;
        	mouse.y = -(e.clientY/window.innerHeight) * 2 + 1;
       		raycaster.setFromCamera(mouse,rendering.action.camera);
			var intersects = raycaster.intersectObjects(rayCasterObj);
			if(intersects.length > 0){
				console.log(intersects[0].object.name);
				$("#userInfo").text(intersects[0].object.name);
			}
		}
	}
}

