// ============================================
// MULTI-STEP FORM WIZARD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('proposalForm');
    if (!form) return;

    const steps = Array.from(document.querySelectorAll('.form-step'));
    const progressBar = document.querySelector('.progress-fill');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    let currentStep = 0;

    // Initialize auto-save
    window.GrantWise.initAutoSave('proposalForm', 'grantwise_draft');

    // Show current step
    function showStep(n) {
        steps.forEach((step, index) => {
            step.style.display = index === n ? 'block' : 'none';
        });

        // Update progress bar
        const progress = ((n + 1) / steps.length) * 100;
        progressBar.style.width = progress + '%';

        // Update buttons
        prevBtn.style.display = n === 0 ? 'none' : 'inline-flex';
        nextBtn.style.display = n === steps.length - 1 ? 'none' : 'inline-flex';
        submitBtn.style.display = n === steps.length - 1 ? 'inline-flex' : 'none';

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Validate current step
    function validateStep() {
        const currentStepElement = steps[currentStep];
        const inputs = currentStepElement.querySelectorAll('input[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');

                // Show error message
                let errorMsg = input.parentNode.querySelector('.form-error');
                if (!errorMsg) {
                    errorMsg = document.createElement('div');
                    errorMsg.className = 'form-error';
                    errorMsg.textContent = 'This field is required';
                    input.parentNode.appendChild(errorMsg);
                }
            } else {
                input.classList.remove('error');
                const errorMsg = input.parentNode.querySelector('.form-error');
                if (errorMsg) errorMsg.remove();
            }
        });

        return isValid;
    }

    // Next button
    nextBtn.addEventListener('click', () => {
        if (validateStep()) {
            currentStep++;
            showStep(currentStep);
        } else {
            window.Toast.error('Please fill in all required fields');
        }
    });

    // Previous button
    prevBtn.addEventListener('click', () => {
        currentStep--;
        showStep(currentStep);
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateStep()) {
            window.Toast.error('Please fill in all required fields');
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner spinner-sm"></span> Generating Proposal...';

        try {
            const formData = new FormData(form);
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });

            const data = await response.json();

            if (data.success) {
                window.Toast.success('Proposal generated successfully!');
                setTimeout(() => {
                    window.location.href = data.redirectUrl || '/result';
                }, 1000);
            } else {
                throw new Error(data.error || 'Failed to generate proposal');
            }
        } catch (error) {
            console.error('Error:', error);
            window.Toast.error(error.message || 'Failed to generate proposal. Please try again.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Generate Proposal';
        }
    });

    // Initialize first step
    showStep(0);

    // Organization voice analyzer
    const analyzeVoiceBtn = document.getElementById('analyzeVoice');
    if (analyzeVoiceBtn) {
        analyzeVoiceBtn.addEventListener('click', async () => {
            const voiceInput = document.getElementById('organizationVoice');
            const voiceText = voiceInput.value.trim();

            if (voiceText.length < 100) {
                window.Toast.warning('Please provide at least 100 characters of past proposals');
                return;
            }

            analyzeVoiceBtn.disabled = true;
            analyzeVoiceBtn.innerHTML = '<span class="spinner spinner-sm"></span> Analyzing...';

            try {
                const response = await fetch('/api/analyze-voice', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ pastProposals: voiceText })
                });

                const data = await response.json();

                if (data.success) {
                    window.Toast.success('Voice analysis complete! Your unique style will be applied to the proposal.');
                } else {
                    throw new Error(data.error);
                }
            } catch (error) {
                window.Toast.error('Failed to analyze voice: ' + error.message);
            } finally {
                analyzeVoiceBtn.disabled = false;
                analyzeVoiceBtn.innerHTML = 'Analyze Voice';
            }
        });
    }
});
