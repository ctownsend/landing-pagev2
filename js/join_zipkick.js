(function ($) {
    $(document).foundation();

    var baseUrl = 'http://blog.zipkick.com/invites/'
      , $codeForm = $('.beta-code-bar')
      , $closeBeta = $codeForm.find('.close')
      , $codeBtn = $codeForm.find('.go')
      , $codeField = $codeForm.find('input');

    var preferenceSelections = [
            {
                "property": null,
                "options": []
            },
            {
                "property": null,
                "options": []
            },
            {
                "property": null,
                "options": []
            }
        ];
    
    //$(".roomcount-set").buttonset();
    ////$(".hotelclass-set").buttonset();
    //$(".triprating-set").buttonset();
    //$(".guestcount-set").buttonset();


    $.ajaxSetup({ cache: true });
    $.getScript('//connect.facebook.net/en_UK/all.js', function () {
        FB.init({
            appId: '480051128746941',
            status: true,
            cookie: true
        });
    });
    
    $(".social-icon").click(function(){
        var href = $(this).find(".social-link").attr("href");

        window.open(href);

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

    var setPrefVisibility = function () {
        //Show all preferences
        $(".preference").show();

        //loop through the preferences selected and hide choices to
        //prevent duplicate preference choice.
        for (var pref in preferenceSelections) {

            //look based on class and title
            $(".preference[title='" + preferenceSelections[pref].property + "']").hide();
        }

    }

    

    $(".move-selection").on('click', function () {

        var currIndex = parseInt($(this).parent().prev().children(".selection-rank").text())-1;
        var newIndex = ($(this).hasClass("up") ? currIndex - 1 : currIndex + 1);

        var selection = preferenceSelections[currIndex];

        preferenceSelections.splice(currIndex, 1);

        preferenceSelections.splice(newIndex,0, selection);

        
        //move UI
        $selectorToMove = $(this).parents(".selector");
        if ($(this).hasClass("up")) {
            //up
            var replaced = $selectorToMove.prev().find("span[title='preferences']").text();

            var moving = $selectorToMove.find("span[title='preferences']").text();


            $selectorToMove.prev().find("span[title='preferences']").text(moving);

            $selectorToMove.find("span[title='preferences']").text(replaced);



        } else {
            //down

            var replaced = $selectorToMove.next().find("span[title='preferences']").text();

            var moving = $selectorToMove.find("span[title='preferences']").text();


            $selectorToMove.next().find("span[title='preferences']").text(moving);

            $selectorToMove.find("span[title='preferences']").text(replaced);

        }  
         
    });




    var validateForm = function () {
        if (validatePreferences()) {
            $("#submit-preferences").show();
            $(".up").show();
            $(".dwn").show();
        }
        else {
            $("#submit-preferences").hide();
            $(".up").hide();
            $(".dwn").hide();
        }
    }

    var validatePreferences = function () {

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


    $(".button-set .ui-button").on('click', function () {

        $(this).toggleClass("selected").toggleClass("ui-state-active");

    });

    $(".radio-select .ui-button").on('click', function () {

        $(".radio-select .ui-button").removeClass("selected").removeClass("ui-state-active");

        $(this).addClass("selected").addClass("ui-state-active");

    });


    $(".amenity").on('click', function () {

        if ($(this).hasClass("selected")) {
            $(this).removeClass("selected");
            $(this).text("No");
        }
        else {
            
            $(this).text("Yes");
            $(this).addClass("selected");
        }
            
    });

    $(".next-step").on('click', function () {

        var $pref = $(this);

        displayStep($pref.attr('title'));

    });

    $(".selector").on('click', function () {

        currentStep = $(this).find(".selection")[0].id.replace(/[A-Za-z$-]/g, "");

        $("#stepNum").text(currentStep);

    });

    $("#show-wizard").on('click', function () {
        $("#main").hide();
        $("#request-invite").show();
        displayStep('selections');

    });

    $("#return-homepage").on('click', function () {
        $("#request-invite").hide();
        $("#main").show();
    });

    $(".complete-selection").on('click', function () {
  
        var dataIndex = currentStep - 1;
        var property = "";
        
        if ($(this).hasClass("preference"))
        {
            property = $(this).attr('title');
            preferenceSelections[dataIndex].property = $(this).attr('title');
            preferenceSelections[dataIndex].options.push($(this).attr('data-preference-key'));
        }
        else
        {

            $multiSelect = $("#" + $(this).val());

            //check to see if anything was selected
            if ($multiSelect.find('.selected').length == 0) {
                alert("Please select at least one preference");
                return false;
            }

            //get property from complete button value
            property = $(this).val();
            preferenceSelections[dataIndex].property = property;

            preferenceSelections[dataIndex].options = [];

            $multiSelect.find(".selected").each(function () {

                preferenceSelections[dataIndex].options.push($(this).data().preferenceKey);

                //reset selection
                $(this).removeClass("selected").removeClass("ui-state-active")
                
            })
        }

        $("#selection"+ currentStep).text(  $("button[ title = '" + property + "']").text() );

        displayStep('selections');

        setPrefVisibility();

        validateForm();
    });


    var displayStep = function (stepName) {

        hideAllSteps();

        $("#" + stepName).show();

    }

    var hideAllSteps = function () {
        $(".step-group").hide();
    }


    $("#submit-preferences").on('click', function () {
        FB.login(
          function (fbInfo) {
              if (fbInfo.status != "connected") {
                  return;
              };
              $.post(baseUrl + 'completeFacebook', {
                  preferences: preferenceSelections,
                  //preferences: getHotelPreferences(),
                  //preferences: getFlightPreferences(),
                  token: fbInfo.authResponse.accessToken
              });
              $("#submit-preferences").slideUp();
              $('.complete-message').slideDown();
          },
          {
              scope: 'read_stream,user_interests,email'
          }
        )
    });
  


    //$requestInvite.on('click', function () {
    //    alert(getHotelPreferences());
    //});


})(jQuery);// JavaScript Document