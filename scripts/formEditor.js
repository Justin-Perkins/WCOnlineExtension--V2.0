const tutor = ["sc64385db9a5fcd", "sc64d13d8db6465"];
const discipline = "Science/Technology/Engineering";
const appointmentType = "Drop-in"
const sessionType = "Tutoring";
const coordinator = "Cristy Rodrick";


window.addEventListener('load', function() { // Waits until the window is fully loaded
    const button = document.querySelector('a[data-bs-resid="CRF_OFFSCH"]'); // Finds the "Off-Schedule Report" button

    button.addEventListener('click', function() { // Waits until the button is clicked
      const iframe = document.getElementById('dynamicIframe'); // Finds the Iframe that contains the Client Report Form

      if (!iframe) {
        return;
      }

      iframe.addEventListener('load', function() { // Waits until the Iframe is fully loaded
        
        const form = iframe.contentDocument.querySelector("body > form"); // Finds the Client Report Form

        if (!form) {
          console.log('Client report form not found');
          //return;
        }
        
        setTimeout(function() { // Wait for the form to load
            const appStartSelect = iframe.contentDocument.querySelector('select[name="app_start"]');
            const appEndSelect = iframe.contentDocument.querySelector('select[name="app_end"]');
            const tutorSelect = iframe.contentDocument.querySelector('select[name="tutor"]');
            const disciplineSelect = iframe.contentDocument.querySelector('select[name="cq7"]');
            const appointmentTypeSelect = iframe.contentDocument.querySelector('select[name="cq3"]');
            const sessionTypeSelect = iframe.contentDocument.querySelector('select[name="cq1"]');
            const coordinatorSelect = iframe.contentDocument.querySelector('select[name="cq4"]');

            // Get Time
            const time = new Date();
            const currentMinutes = time.getHours() * 60 + time.getMinutes();

            // Convert the current time to the nearest 5 or 0 minutes
            const closestTimeIndex = Math.round(currentMinutes / 5) * 5;

            // Loop through the "start time" options and remove the ones that are less than 8:00 am or greater than 8:00 pm and are not 5 minute intervals.
            // Selects the option closest to the current time, minus 60 minutes
            if(appStartSelect != null){
                for (var i = 0; i < appStartSelect.options.length; i++) {
                    var optionValue = parseInt(appStartSelect.options[i].value);
                    if ((optionValue < 480 || optionValue > 1200) || (optionValue % 5 != 0)) {
                        appStartSelect.remove(i);
                        i--;
                    }
                }

                if ((closestTimeIndex - 60) > 480 && (closestTimeIndex - 60) < 1200) {
                    appStartSelect.value = closestTimeIndex - 60;
                }
                else
                {
                    appStartSelect.value = 840;
                }
            }

            // Loop through the "end time" options and remove the ones that are less than 8:00 am or greater than 8:00 pm and are not 5 minute intervals.
            // Selects the option closest to the current time
            if(appEndSelect != null){
                for (i = 0; i < appEndSelect.options.length; i++) {
                    optionValue = parseInt(appEndSelect.options[i].value);
                    if ((optionValue < 480 || optionValue > 1200) || (optionValue % 5 != 0)) {
                        appEndSelect.remove(i);
                        i--;
                    }
                }

                if ((closestTimeIndex) > 480 && (closestTimeIndex) < 1200) {
                    appEndSelect.value = closestTimeIndex;
                }
                else
                {
                    appEndSelect.value = 840;
                }
            }

            // Loop through the "tutor" options and remove the ones that are not in the tutor array
            
            
            if(tutorSelect != null){
                for (i = 0; i < tutorSelect.options.length; i++) {
                    optionValue = tutorSelect.options[i].value;
                    if ((optionValue != tutor[0] && optionValue != tutor[1])) {
                        tutorSelect.remove(i);
                        i--;
                    }
                }

                tutorSelect.value = tutor[0];

            }

            // Selects the preset "discipline"
            if(disciplineSelect != null)
            {
                disciplineSelect.value = discipline;
            }

            // Selects the preset "appointmentType"
            if(appointmentTypeSelect != null)
            {
                appointmentTypeSelect.value = appointmentType;
            }

            // Selects the preset "sessionType"
            if(sessionTypeSelect != null)
            {
                sessionTypeSelect.value = sessionType;
            }

            // Selects the preset "coordinator"
            if(coordinatorSelect != null)
            {
                coordinatorSelect.value = coordinator;
            }

        }, 400);

      });

    });

});