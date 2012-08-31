/* Foundation v2.1.4 http://foundation.zurb.com */
$(document).ready(function () {

	var phrase_responder = function(e) {

		console.log(request);
	};

	$('.phrase-submit').click(function(event) { 
		event.preventDefault();

		var input_query = $(this).parent().find('.phrase').attr('value');

		$.post("/phrase", { value: input_query }, function(data) {
			console.log(data);
			var listItems = '';

      $.each(data, function(i, item) {
				console.log($(this));
				listItems  += '<li><span><a href="" class="upvote">Up</a><a href="" class="downvote">Down</a></span><span>'+item.result+'</span><a href="/lookup/' + item.index + '" rel="Share '+item.result+' with your friends!>Share</a></li>';
			});

			$('ul.dropdown-list').append(listItems);
		}, 'json');

	});
		
	/* ALERT BOXES ------------ */
	$(".alert-box").delegate("a.close", "click", function(event) {
    event.preventDefault();
	  $(this).closest(".alert-box").fadeOut(function(event){
	    $(this).remove();
	  });
	});

	/* PLACEHOLDER FOR FORMS ------------- */
	/* Remove this and jquery.placeholder.min.js if you don't need :) */

	$('input, textarea').placeholder();

});
