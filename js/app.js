$(document).ready(function () {

    var baseUrl = 'http://blog.zipkick.com/invites/'
    , $codeForm = $('.beta-code-bar')
    , $closeBeta = $codeForm.find('.close')
    , $codeBtn = $codeForm.find('.go')
    , $codeField = $codeForm.find('input');

    $.ajaxSetup({ cache: true });
    $.getScript('//connect.facebook.net/en_UK/all.js', function () {
        FB.init({
            appId: '480051128746941',
            status: true,
            cookie: true
        });
    });

    $codeBtn.on('click', function (e) {
        e.preventDefault();

        $.post(baseUrl + 'validateCode',
          {
              code: $codeField.val()
          },
          function (response) {
              if (response.valid) {
                  window.location.href = response.redirect;
              };
          }
          )
    });

    var checkFbAuthDone = function (w) {
        setTimeout(function () {
            $.get(baseUrl + 'fbCheck', function (response) {
                console.log(response);
                if (response.error) {
                    console.warn(response);
                } else if (response.done) {
                    w.close();
                } else {
                    checkFbAuthDone(w);
                }
            });
        }, 500)
    }

    $("#submit-preferences").on('click', function () {
        if (typeof FB === 'undefined') {
            alert('Unable to connect to Facebook login');
        } else {
            FB.login(
              function (fbInfo) {
                  if (fbInfo.status != "connected") {
                      return;
                  };
                  $.post(baseUrl + 'completeFacebook', {
                      preferences: preferenceSelections,
                      token: fbInfo.authResponse.accessToken
                  });
                  $(".subscription-form-container").slideUp();
                  $('.complete-message').slideDown();
              },
              {
                  scope: 'read_stream,user_interests,email'
              }
              )
        }
    });




    // clear form, remove html and selections
    $('#clear').on('click', function () {
        count = 1;
        $("input.selection").removeAttr('disabled');
        preferenceSelections = emptySelection();
        $('li.panel').each(function (n) {
            if ($(this).hasClass("highlight")) {
                $(this).removeClass("highlight");
                var choice = $(this).find('h3')
                choice.html(choice.html().split(/[123]. /).join(""))
            }
            if (!$($(this).children()[0]).hasClass('collapsed')) {
                $($(this).children()[0]).addClass("collapsed");
                $($(this).children()[1]).removeClass("in");
            }
        });
    });

    var emptySelection = function () {
        array = []
        for (var i = 0; i < 3; i++) {
            array.push({ "property": null, "options": [] })
        }
        return array;
    }

    function addProperty(i, value) {
        preferenceSelections[i].property = value;
        console.log(preferenceSelections);
    }

    function addOptions(i, value) {
        preferenceSelections[i].options.push(value);
    }

    function removeOptions(i) {
        preferenceSelections[i].options = [];
    }

    function validatePreferences() {
        //look to ensure that selections have been made for all preferences.
        for (var pref in preferenceSelections) {
            if (preferenceSelections[pref].property == null) {
                return false
            }
            for (var opt in preferenceSelections[pref].options) {
                if (preferenceSelections[pref].options[opt] == null) {
                    return false
                }
            }
        }
        return true;
    }



    var preferenceSelections = emptySelection();
    var count = 1;
    var max = 3;
    var currPreference;

    $('.selection').on('click', function () {

        removeOptions(currPreference);

        recordSelection($(this));
        
        completeSelection();
        
    });

    $('.multi-selection').on('click', function () {
        
        removeOptions(currPreference);

        $("input[name='amenities']").each(function (index) {

            if (this.checked)
            {
                //addProperty(currPreference, $(this).attr('name'));
                //addOptions(currPreference, $(this).attr('value'));

                recordSelection($(this));
            }


        });


        completeSelection();
    });


    $(".preference").on('click', function () {
        
        currPreference = parseInt($(this).attr('id'));

        $("#pref-choice-container").hide();
        $("#pref-avail-container").show();

    });

    //*************new code ***************

    function recordSelection(value) {

        addProperty(currPreference, value.attr('name'));
        addOptions(currPreference, value.attr('value'));

    }

    function completeSelection() {
        populatePrefChoices();
        displayAvailablePrefChoices();

        if (validatePreferences()) {
            $("#submit-preferences").show();
        } else {
            $("#submit-preferences").hide();
        }

    }
    

    function populatePrefChoices() {

        for (var i = 0; i < preferenceSelections.length; i++) {

            //if the preference is selected then populate the
            //the choice
            if (preferenceSelections[i].property != null) {

                var propertyLabel = $("#" + preferenceSelections[i].property).text();
                $("#" + i).text(i + 1 + ". " + propertyLabel);

            }
            
        }


    }

    function displayAvailablePrefChoices() {
        $(".pref-choice").show()

        for (var i = 0; i < preferenceSelections.length; i++) {

            $("." + preferenceSelections[i].property).hide();

        }

        $(".panel-collapse").each(function (index) {

            if ($(this).hasClass('in')) {
                $(this).removeClass("in");
            }
            
        });

        $("input:checked").each(function (index) {

            $(this).prop('checked', false);

        });

        $("#pref-choice-container").show();
        $("#pref-avail-container").hide();

        var varScrollTo = $("#download");

        $('html, body').animate({
            scrollTop: varScrollTo.offset().top
        }, 1);

    }

});

