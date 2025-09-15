// Toggle password visibility
document.addEventListener('DOMContentLoaded', function() {
    // Password visibility toggle
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.querySelector('input[type="password"]');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }

    // Remember me functionality
    const rememberMe = document.getElementById('remember-me');
    const emailInput = document.getElementById('email');
    
    // Check for saved credentials
    if (localStorage.getItem('rememberMe') === 'true') {
        rememberMe.checked = true;
        const savedEmail = localStorage.getItem('email');
        if (savedEmail) {
            emailInput.value = savedEmail;
        }
    }
    
    // Save credentials on form submit if remember me is checked
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            if (rememberMe.checked) {
                localStorage.setItem('rememberMe', 'true');
                localStorage.setItem('email', emailInput.value);
            } else {
                localStorage.removeItem('rememberMe');
                localStorage.removeItem('email');
            }
            
            // Here you would typically handle the form submission
            // e.preventDefault(); // Uncomment this to prevent actual form submission
        });
    }
});
