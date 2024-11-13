let cachedErrors = {};  
        let isLoading = false;  
        let debounceTimer;  
        let cacheTimeout; 

        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            document.querySelector('.container').classList.toggle('dark-mode');
        }

        function debouncedCheckGrammar() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(checkGrammar, 500);
        }

        function checkGrammar() {
            const text = document.getElementById('textInput').value;
            const errorMessages = document.getElementById('errorMessages');
            const button = document.querySelector('.button');
            const textarea = document.getElementById('textInput');
            const charCount = document.getElementById('charCount');

            errorMessages.innerHTML = '';  
            textarea.classList.remove('highlight-error');

            if (!isLoading) {
                button.innerHTML = 'Checking... <span class="loading-dot"></span>';
                isLoading = true;
            }

            if (text.trim() === "") return;

            if (cachedErrors[text] && (Date.now() - cachedErrors[text].timestamp < 60000)) {
                displayErrors(cachedErrors[text].matches);
                isLoading = false;
                button.innerHTML = 'Check Grammar';
                return;
            }

            fetch('https://api.languagetool.org/v2/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `text=${encodeURIComponent(text)}&language=en-US`
            })
            .then(response => response.json())
            .then(data => {
                if (data.matches.length === 0) {
                    errorMessages.innerHTML = "<p>No issues found!</p>";
                } else {
                    cachedErrors[text] = { matches: data.matches, timestamp: Date.now() };
                    displayErrors(data.matches);
                }
                isLoading = false;
                button.innerHTML = 'Check Grammar';
            })
            .catch(error => {
                console.error('Error checking grammar:', error);
                isLoading = false;
                button.innerHTML = 'Check Grammar';
                alert("An error occurred. Please try again.");
            });

            charCount.innerText = `Character count: ${text.length}`;
        }

        function displayErrors(matches) {
            const errorMessages = document.getElementById('errorMessages');
            const textarea = document.getElementById('textInput');

            if (matches.length > 0) {
                textarea.classList.add('highlight-error');
            }

            matches.forEach(match => {
                const errorDiv = document.createElement('div');
                errorDiv.classList.add('error');
                errorDiv.innerHTML =  
                    `<strong>${match.message}</strong> at position ${match.offset} for the word "<em>${match.context.text.slice(match.offset, match.offset + match.length)}</em>"`;

                const tooltip = document.createElement('div');
                tooltip.classList.add('error-tooltip');
                tooltip.textContent = `Suggested correction: ${match.replacements[0]?.value || 'No suggestion available'}`;
                errorDiv.appendChild(tooltip);

                const suggestionsDiv = document.createElement('div');
                match.replacements.forEach(replacement => {
                    const suggestionDiv = document.createElement('div');
                    suggestionDiv.classList.add('suggestion');
                    suggestionDiv.innerText = `Try: ${replacement.value}`;
                    suggestionDiv.onclick = function () {
                        applyCorrection(match.offset, match.length, replacement.value);
                    };
                    suggestionsDiv.appendChild(suggestionDiv);
                });
                errorDiv.appendChild(suggestionsDiv);
                errorMessages.appendChild(errorDiv);
            });
        }

        function applyCorrection(offset, length, replacement) {
            const textArea = document.getElementById('textInput');
            const text = textArea.value;
            const newText = text.slice(0, offset) + replacement + text.slice(offset + length);
            textArea.value = newText;
            checkGrammar();
        }

        function clearText() {
            document.getElementById('textInput').value = '';
            document.getElementById('errorMessages').innerHTML = '';
            cachedErrors = {}; 
            document.getElementById('charCount').innerText = '';
        }

        document.addEventListener('DOMContentLoaded', () => {
            const homeLink = document.getElementById('home-link');
            const membersLink = document.getElementById('members-link');
            const contactLink = document.getElementById('contact-link');
            const aboutLink = document.getElementById('about-link');
            const infoLink = document.getElementById('info-link');
            const sidebar = document.getElementById('sidebar');
            const sidebarToggle = document.getElementById('sidebar-toggle');

            const homePage = document.getElementById('home');
            const membersPage = document.getElementById('members');
            const contactPage = document.getElementById('contact');
            const aboutPage = document.getElementById('about');
            const infoPage = document.getElementById('info');

            // Function to show the selected page
            function showPage(pageId) {
                // Hide all pages
                homePage.classList.add('hidden');
                membersPage.classList.add('hidden');
                contactPage.classList.add('hidden');
                aboutPage.classList.add('hidden');
                infoPage.classList.add('hidden');

                // Remove active class from all sidebar links
                homeLink.classList.remove('active');
                membersLink.classList.remove('active');
                contactLink.classList.remove('active');
                aboutLink.classList.remove('active');
                infoLink.classList.remove('active');

                // Show the selected page
                document.getElementById(pageId).classList.remove('hidden');
                document.getElementById(pageId).classList.add('fade-in');

                // Add active class to the clicked link
                if (pageId === 'home') homeLink.classList.add('active');
                if (pageId === 'members') membersLink.classList.add('active');
                if (pageId === 'contact') contactLink.classList.add('active');
                if (pageId === 'about') aboutLink.classList.add('active');
                if (pageId === 'info') infoLink.classList.add('active');
            }

            // Event listeners for sidebar links
            homeLink.addEventListener('click', () => showPage('home'));
            membersLink.addEventListener('click', () => showPage('members'));
            contactLink.addEventListener('click', () => showPage('contact'));
            aboutLink.addEventListener('click', () => showPage('about'));
            infoLink.addEventListener('click', () => showPage('info'));

            // Show the home page by default
            showPage('home');

            // Sidebar toggle for mobile
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        });

        // Form Validation
        function validateForm() {
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const message = document.getElementById("message").value;
            
            // Simple form validation
            if (name === "" || email === "" || message === "") {
                alert("Please fill in all fields before submitting.");
                return false;  // Prevent form submission
            }
            
            // Check if email format is valid
            const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
            if (!emailPattern.test(email)) {
                alert("Please enter a valid email address.");
                return false;
            }

            // If everything is valid
            alert("Your message has been sent!");
            return true;
        }

        const deepWordQuestions = [
            {
              question: "Choose the correct verb form: She ____ to the store every day.",
              options: ["go", "goes", "going", "gone"],
              correctAnswer: "goes"
            },
            {
              question: "Choose the correct article: I saw ____ elephant at the zoo.",
              options: ["a", "an", "the", "some"],
              correctAnswer: "an"
            },
            {
              question: "Choose the correct sentence: ____ you like coffee?",
              options: ["Do", "Does", "Are", "Is"],
              correctAnswer: "Do"
            },
            {
              question: "Choose the correct preposition: He is sitting ____ the chair.",
              options: ["on", "in", "under", "at"],
              correctAnswer: "on"
            },
            {
              question: "Choose the correct word: I can't find my ____. ",
              options: ["book", "books", "booked", "booking"],
              correctAnswer: "book"
            },
            {
              question: "Choose the correct tense: She ____ in New York for 5 years.",
              options: ["lives", "lived", "has lived", "is living"],
              correctAnswer: "has lived"
            },
            {
              question: "Choose the correct conjunction: I like apples ____ I don't like bananas.",
              options: ["but", "and", "or", "so"],
              correctAnswer: "but"
            },
            {
              question: "Choose the correct preposition: She is interested ____ learning French.",
              options: ["on", "in", "at", "by"],
              correctAnswer: "in"
            },
            {
              question: "Choose the correct pronoun: ____ is going to the party tonight.",
              options: ["He", "Him", "His", "He’s"],
              correctAnswer: "He"
            }
          ];
      
          let currentDeepWordQuestionIndex = 0;
          let deepWordScore = 0;
          let deepWordTimerInterval;
          let deepWordTimeLeft = 10;
      
          function loadDeepWordQuestion() {
            const question = deepWordQuestions[currentDeepWordQuestionIndex];
            document.getElementById("deep-word-question-text").textContent = question.question;
            const optionsList = document.getElementById("deep-word-options");
            optionsList.innerHTML = ''; // Clear previous options
      
            question.options.forEach(option => {
              const li = document.createElement("li");
              li.textContent = option;
              li.classList.add("deep-word-option-item");
              li.onclick = () => checkDeepWordAnswer(option);
              optionsList.appendChild(li);
            });
      
            document.getElementById("deep-word-result").textContent = '';
            document.getElementById("next-deep-word-btn").style.display = 'none';
      
            // Reset timer
            deepWordTimeLeft = 10;
            document.getElementById("deep-word-time-left").textContent = deepWordTimeLeft;
            clearInterval(deepWordTimerInterval);
            deepWordTimerInterval = setInterval(updateDeepWordTimer, 1000);
      
            // Update progress bar
            updateDeepWordProgressBar();
          }
      
          function updateDeepWordTimer() {
            deepWordTimeLeft--;
            document.getElementById("deep-word-time-left").textContent = deepWordTimeLeft;
      
            if (deepWordTimeLeft <= 0) {
              clearInterval(deepWordTimerInterval);
              document.getElementById("deep-word-result").textContent = "Time's up! 😞";
              document.getElementById("next-deep-word-btn").style.display = 'inline-block';
            }
          }
      
          function checkDeepWordAnswer(selectedOption) {
            const question = deepWordQuestions[currentDeepWordQuestionIndex];
            const optionsList = document.getElementById("deep-word-options").children;
      
            if (selectedOption === question.correctAnswer) {
              document.getElementById("deep-word-result").textContent = "Correct! 🎉";
              deepWordScore++;
              // Highlight the correct answer
              Array.from(optionsList).forEach(item => {
                if (item.textContent === question.correctAnswer) {
                  item.classList.add("correct-answer");
                }
              });
            } else {
              document.getElementById("deep-word-result").textContent = "Incorrect! 😞";
              // Highlight the incorrect answer
              Array.from(optionsList).forEach(item => {
                if (item.textContent === question.correctAnswer) {
                  item.classList.add("correct-answer");
                }
                if (item.textContent === selectedOption) {
                  item.classList.add("incorrect-answer");
                }
              });
            }
      
            document.getElementById("next-deep-word-btn").style.display = 'inline-block';
            clearInterval(deepWordTimerInterval);
          }
      
          function nextDeepWordQuestion() {
            currentDeepWordQuestionIndex++;
            if (currentDeepWordQuestionIndex < deepWordQuestions.length) {
              loadDeepWordQuestion();
            } else {
              showFinalDeepWordScore();
            }
          }
      
          function updateDeepWordProgressBar() {
            const progress = ((currentDeepWordQuestionIndex + 1) / deepWordQuestions.length) * 100;
            document.getElementById("deep-word-progress").style.width = progress + '%';
          }
      
          function showFinalDeepWordScore() {
            document.getElementById("deep-word-quiz-container").style.display = 'none';
            document.getElementById("final-deep-word-score").style.display = 'block';
            document.getElementById("deep-word-score").textContent = deepWordScore;
            document.getElementById("total-deep-word-questions").textContent = deepWordQuestions.length;
          }
      
          function restartDeepWordGame() {
            currentDeepWordQuestionIndex = 0;
            deepWordScore = 0;
            document.getElementById("deep-word-quiz-container").style.display = 'block';
            document.getElementById("final-deep-word-score").style.display = 'none';
            loadDeepWordQuestion();
          }
      
          function quitDeepWordGame() {
            alert("Thanks for playing!");
            window.close();
          }
      
          document.getElementById("start-deep-word-btn").onclick = function() {
            document.getElementById("welcome-deep-word-screen").style.display = 'none';
            document.getElementById("deep-word-quiz-container").style.display = 'block';
            loadDeepWordQuestion();
          };
      
          document.getElementById("next-deep-word-btn").onclick = nextDeepWordQuestion;
