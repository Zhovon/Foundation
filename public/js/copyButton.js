// ============================================
// COPY TO CLIPBOARD FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const copyButtons = document.querySelectorAll('[data-copy]');

    copyButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const targetId = button.getAttribute('data-copy');
            const targetElement = document.getElementById(targetId);

            if (!targetElement) {
                console.error('Target element not found:', targetId);
                return;
            }

            const textToCopy = targetElement.textContent || targetElement.innerText;

            try {
                // Modern clipboard API
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(textToCopy);
                } else {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = textToCopy;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    textArea.style.top = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();

                    try {
                        document.execCommand('copy');
                        textArea.remove();
                    } catch (err) {
                        console.error('Fallback: Oops, unable to copy', err);
                        textArea.remove();
                        throw err;
                    }
                }

                // Update button text
                const originalText = button.innerHTML;
                button.innerHTML = '✓ Copied!';
                button.classList.add('btn-success');

                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.classList.remove('btn-success');
                }, 2000);

                // Show toast notification
                window.Toast.success('Proposal copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy:', err);
                window.Toast.error('Failed to copy to clipboard');
            }
        });
    });
});
