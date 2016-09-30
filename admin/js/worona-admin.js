function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

jQuery(document).on('ready', function () {
    //disabling # links
    jQuery('a[href^="#"]').click(function(e) {
      e.preventDefault();
    });

    //Show "Insert siteid form"
    jQuery('.open-change-siteid').on('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      jQuery('#lateral-change-siteid').show();
    });

    jQuery('.close-change-siteid').on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      jQuery('#lateral-change-siteid').hide();
      jQuery('#lateral-error-siteid').hide();
    });

    jQuery('.close-error-siteid').on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      jQuery('#lateral-error-siteid').hide();
    });

    //Create App via AJAX
    jQuery('#sync-with-worona').on('click', function (e) {
      jQuery('#sync-with-worona').addClass('is-loading');
      e.preventDefault();
      e.stopPropagation();

      var win = window.open("https://dashboard.worona.org/", '_blank');
      win.focus();

      jQuery.ajax({
          url: ajaxurl,
          method: "POST",
          data: {
              action: 'sync_with_worona',
          },
          success: function (response) {
            if (response.hasOwnProperty('status') && response.status == 'ok' ) {
              jQuery('#label-create-buttons').toggle();
              jQuery('#label-created').toggle();
              jQuery('progress')[0].value = 100;
              jQuery('#step-message').text('You are on step 4/4');
              jQuery('#worona-siteid-lateral').show();
              jQuery('span#worona-siteid-span').text(response.siteId);
              jQuery('input#worona-siteid').val(response.siteId);

              jQuery('#dashboard-button').removeClass('disabled');
              jQuery('#dashboard-button').addClass('button-primary button-hero');

              var siteid = jQuery('#worona-siteid-span').text();
              var url = "https://dashboard.worona.org/" + "site/" + siteid;
              jQuery('#dashboard-button').on('click', function(e){window.open(url)});
            }
          },
          error: function () {

          }
      });
    });

    //Change App ID via ajax
    jQuery('#change-siteid').on('click', function(e) {
      jQuery('#change-siteid').addClass('is-loading');
      e.preventDefault();
      e.stopPropagation();
      var id = jQuery('input#worona-siteid').val();

      if ( id.length !=17 || id.includes(' ')){
        jQuery('#lateral-error-siteid').show();
        jQuery('#siteid-error-message').text("Invalid App ID");
        jQuery('#change-siteid').removeClass('is-loading');
      } else {
        jQuery.ajax({
          url: ajaxurl,
          method: "POST",
          data: {
              action: 'worona_change_siteid',
              siteid: jQuery('input#worona-siteid').val()
          },
          success: function (response) {
            if (response.hasOwnProperty('status') && response.status == 'ok' ) {
              jQuery('#change-siteid').removeClass('is-loading');
              jQuery('#lateral-error-siteid').hide();
              jQuery('#lateral-change-siteid').hide();
              jQuery('#label-create-buttons').hide(); //they can be hidden already
              jQuery('#label-created').show(); //it can be displayed already
              jQuery('progress')[0].value = 100;
              jQuery('#step-message').text('You are on step 4/4');
              jQuery('#worona-siteid-lateral').show();
              jQuery('span#worona-siteid-span').text(jQuery('input#worona-siteid').val());

              jQuery('#dashboard-button').removeClass('disabled');
              jQuery('#dashboard-button').addClass('button-primary button-hero');

              var siteid = jQuery('#worona-siteid-span').text();
              jQuery('#dashboard-button').on('click', function(e){window.open(url)});

            } else if( response.hasOwnProperty('status') && response.status == 'error') {
              jQuery('#lateral-error-siteid').show();
              jQuery('#siteid-error-message').text(response.reason);
              jQuery('#change-siteid').removeClass('is-loading');
            }
          },
          error: function (response) {
            jQuery('#lateral-error-siteid').show();
            jQuery('#siteid-error-message').text("The Site ID couldn't be modified. Please try again.");
            jQuery('#change-siteid').removeClass('is-loading');
          }
        });
      }
    });

    /*support emails*/
    //enable & disable change email button
    jQuery('#support-email').on('input', function(){
      var newEmail = jQuery('#support-email').val();
      var currentEmail = jQuery('#current-support-email').val();

      if ( validateEmail(newEmail) ) {
        jQuery('#support-email').removeClass('is-danger');
        if(newEmail !== currentEmail) {
          jQuery('#change-support-email').removeClass('disabled');
        } else {
          jQuery('#change-support-email').addClass('disabled');
        }
      } else {
        jQuery('#change-support-email').addClass('disabled');
        jQuery('#support-email').addClass('is-danger');
      }
    });

    //change email
    jQuery('#change-support-email').on('click',function(e){
      e.preventDefault();
      e.stopPropagation();

      var newEmail = jQuery('#support-email').val();

      if( validateEmail(newEmail) && !jQuery('#change-support-email').hasClass('disabled')) {
        jQuery('#change-support-email').addClass('is-loading');
        jQuery.ajax({
          url: ajaxurl,
          method: "POST",
          data: {
              action: 'worona_change_support_email',
              email: newEmail,
          },
          success: function (response) {
            jQuery('#current-support-email').val(newEmail);
            jQuery('#change-support-email').removeClass('is-loading');

            if (response.hasOwnProperty('status') && response.status == 'ok' ) {
              jQuery('#support-email').addClass('is-success');
            } else if( response.hasOwnProperty('status') && response.status == 'error') {
              jQuery('#support-email').addClass('is-danger');
            }
          },
          error: function (response) {
            jQuery('#support-email').addClass('is-danger');
          }
        });
      }

    });

    //unsubscribe / subscribe email support
    jQuery('#receive-support-emails').on('click',function(e){
      e.preventDefault();
      e.stopPropagation();
      var toggle;
      if(jQuery('#receive-support-emails').attr('checked')){
        toggle = "true";
      } else {
        toggle = "false";
      }

      jQuery("#support-saving").show();

      jQuery.ajax({
        url: ajaxurl,
        method: "POST",
        data: {
            action: 'worona_toggle_support',
            toggle: toggle,
        },
        success: function (response) {
          jQuery("#support-saving").hide();
          if (response.hasOwnProperty('status') && response.status == 'ok' ) {
            if(jQuery('#current-toggle-support').val() == "true"){
              jQuery('#support-email').attr('disabled',true);
              jQuery('#receive-support-emails').attr('checked',false);
              jQuery('#change-support-email').addClass('disabled');
              jQuery('#current-toggle-support').val("false");
            } else {
              var newEmail = jQuery('#support-email').val();
              var currentEmail = jQuery('#current-support-email').val();

              if ( (newEmail != currentEmail) && validateEmail(newEmail)){
                jQuery('#change-support-email').removeClass('disabled');
              }
              jQuery('#support-email').attr('disabled',false);
              jQuery('#receive-support-emails').attr('checked',true);
              jQuery('#current-toggle-support').val("true");
            }
          }
        },
        error: function (response) {

        }
      });

    });
});
