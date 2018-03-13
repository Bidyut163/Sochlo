var activeitem = document.querySelectorAll(".activeitem");

for(var i=0; i<activeitem.length; i++){
	activeitem[i].addEventListener("click", function(){
		activeitem.forEach(function(activeitem){
			activeitem.classList.remove("active");
		});
		this.classList.add("active");
	});
}