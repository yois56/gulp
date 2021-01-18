'use strict';

document.addEventListener('DOMContentLoaded', function() {
	var $button = document.querySelector('.clickme');
	$button.addEventListener('click', function(event) {
		$button.nextElementSibling.textContent = '꿀꺽 꿀꺽 꿀꺽 꿀꺽 꿀꺽 ~~~~~';
	});


});
