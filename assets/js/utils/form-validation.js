/**
 * Universal Form Validation System
 * Provides real-time validation with visual feedback
 */

/**
 * Validation Rules
 */
export const validators = {
    required: (value) => {
        return value.trim().length > 0 || 'This field is required';
    },

    email: (value) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(value) || 'Please enter a valid email address';
    },

    phone: (value) => {
        const cleaned = value.replace(/\D/g, '');
        return cleaned.length === 10 || 'Please enter a valid 10-digit phone number';
    },

    minLength: (min) => (value) => {
        return value.length >= min || `Must be at least ${min} characters`;
    },

    maxLength: (max) => (value) => {
        return value.length <= max || `Must be no more than ${max} characters`;
    },

    pattern: (regex, message) => (value) => {
        return regex.test(value) || message;
    },

    number: (value) => {
        return !isNaN(value) && value.trim() !== '' || 'Please enter a valid number';
    },

    positiveNumber: (value) => {
        const num = parseFloat(value);
        return (!isNaN(num) && num > 0) || 'Must be a positive number';
    },

    range: (min, max) => (value) => {
        const num = parseFloat(value);
        return (!isNaN(num) && num >= min && num <= max) || `Must be between ${min} and ${max}`;
    },

    date: (value) => {
        const date = new Date(value);
        return !isNaN(date.getTime()) || 'Please enter a valid date';
    },

    futureDate: (value) => {
        const date = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today || 'Date must be in the future';
    },

    pastDate: (value) => {
        const date = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date <= today || 'Date must be in the past';
    },

    url: (value) => {
        try {
            new URL(value);
            return true;
        } catch {
            return 'Please enter a valid URL';
        }
    },

    match: (fieldName, getFieldValue) => (value) => {
        const otherValue = getFieldValue(fieldName);
        return value === otherValue || `Must match ${fieldName}`;
    },

    strongPassword: (value) => {
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        const isLongEnough = value.length >= 8;

        if (!isLongEnough) return 'Password must be at least 8 characters';
        if (!hasUpper) return 'Password must contain an uppercase letter';
        if (!hasLower) return 'Password must contain a lowercase letter';
        if (!hasNumber) return 'Password must contain a number';
        if (!hasSpecial) return 'Password must contain a special character';
        
        return true;
    },

    zipCode: (value) => {
        const regex = /^\d{5}(-\d{4})?$/;
        return regex.test(value) || 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)';
    },

    creditCard: (value) => {
        const cleaned = value.replace(/\s/g, '');
        if (!/^\d{13,19}$/.test(cleaned)) {
            return 'Invalid card number';
        }
        
        // Luhn algorithm
        let sum = 0;
        let isEven = false;
        
        for (let i = cleaned.length - 1; i >= 0; i--) {
            let digit = parseInt(cleaned[i]);
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0 || 'Invalid card number';
    },
};

/**
 * Form Validator Class
 */
export class FormValidator {
    constructor(formElement, config = {}) {
        this.form = formElement;
        this.fields = new Map();
        this.config = {
            validateOnBlur: true,
            validateOnInput: false,
            showSuccessIcons: true,
            ...config,
        };

        this.setupFields();
        this.attachEventListeners();
    }

    /**
     * Add field with validation rules
     */
    addField(fieldName, rules, customMessages = {}) {
        const input = this.form.querySelector(`[name="${fieldName}"]`);
        if (!input) {
            console.warn(`Field "${fieldName}" not found in form`);
            return;
        }

        this.fields.set(fieldName, {
            input,
            rules,
            customMessages,
            isValid: false,
            errorMessage: '',
        });

        this.wrapInputWithValidation(input);
    }

    /**
     * Setup fields from data attributes
     */
    setupFields() {
        const inputs = this.form.querySelectorAll('[data-validate]');
        
        inputs.forEach(input => {
            const rules = this.parseRulesFromAttributes(input);
            if (rules.length > 0) {
                this.addField(input.name, rules);
            }
        });
    }

    /**
     * Parse validation rules from data attributes
     */
    parseRulesFromAttributes(input) {
        const rules = [];
        
        if (input.hasAttribute('required')) {
            rules.push(validators.required);
        }

        if (input.type === 'email') {
            rules.push(validators.email);
        }

        if (input.type === 'tel') {
            rules.push(validators.phone);
        }

        if (input.type === 'number') {
            rules.push(validators.number);
            
            if (input.min) {
                const min = parseFloat(input.min);
                const max = input.max ? parseFloat(input.max) : Infinity;
                rules.push(validators.range(min, max));
            }
        }

        if (input.dataset.minLength) {
            rules.push(validators.minLength(parseInt(input.dataset.minLength)));
        }

        if (input.dataset.maxLength) {
            rules.push(validators.maxLength(parseInt(input.dataset.maxLength)));
        }

        if (input.dataset.pattern) {
            rules.push(validators.pattern(
                new RegExp(input.dataset.pattern),
                input.dataset.patternMessage || 'Invalid format'
            ));
        }

        if (input.dataset.match) {
            rules.push(validators.match(input.dataset.match, (name) => {
                const field = this.form.querySelector(`[name="${name}"]`);
                return field ? field.value : '';
            }));
        }

        return rules;
    }

    /**
     * Wrap input with validation UI
     */
    wrapInputWithValidation(input) {
        if (input.parentElement.classList.contains('validation-wrapper')) {
            return; // Already wrapped
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'validation-wrapper';
        
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        const feedback = document.createElement('div');
        feedback.className = 'validation-feedback';
        wrapper.appendChild(feedback);

        if (this.config.showSuccessIcons) {
            const icon = document.createElement('span');
            icon.className = 'validation-icon';
            wrapper.appendChild(icon);
        }
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        this.fields.forEach((field, fieldName) => {
            if (this.config.validateOnBlur) {
                field.input.addEventListener('blur', () => {
                    this.validateField(fieldName);
                });
            }

            if (this.config.validateOnInput) {
                field.input.addEventListener('input', () => {
                    if (field.input.classList.contains('is-invalid')) {
                        this.validateField(fieldName);
                    }
                });
            }
        });

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validateAll()) {
                this.config.onSubmit?.(this.getFormData());
            }
        });
    }

    /**
     * Validate single field
     */
    validateField(fieldName) {
        const field = this.fields.get(fieldName);
        if (!field) return false;

        const value = field.input.value;
        let isValid = true;
        let errorMessage = '';

        for (const rule of field.rules) {
            const result = rule(value);
            
            if (result !== true) {
                isValid = false;
                errorMessage = field.customMessages[rule.name] || result;
                break;
            }
        }

        field.isValid = isValid;
        field.errorMessage = errorMessage;

        this.updateFieldUI(fieldName);

        return isValid;
    }

    /**
     * Validate all fields
     */
    validateAll() {
        let allValid = true;

        this.fields.forEach((_, fieldName) => {
            const isValid = this.validateField(fieldName);
            if (!isValid) {
                allValid = false;
            }
        });

        // Focus first invalid field
        if (!allValid) {
            const firstInvalid = this.form.querySelector('.is-invalid');
            firstInvalid?.focus();
        }

        return allValid;
    }

    /**
     * Update field UI based on validation state
     */
    updateFieldUI(fieldName) {
        const field = this.fields.get(fieldName);
        if (!field) return;

        const wrapper = field.input.closest('.validation-wrapper');
        const feedback = wrapper?.querySelector('.validation-feedback');
        const icon = wrapper?.querySelector('.validation-icon');

        // Remove old classes
        field.input.classList.remove('is-valid', 'is-invalid');
        wrapper?.classList.remove('is-valid', 'is-invalid');

        // Add new classes
        if (field.input.value) {
            if (field.isValid) {
                field.input.classList.add('is-valid');
                wrapper?.classList.add('is-valid');
                if (feedback) feedback.textContent = '';
                if (icon) icon.textContent = '✓';
            } else {
                field.input.classList.add('is-invalid');
                wrapper?.classList.add('is-invalid');
                if (feedback) feedback.textContent = field.errorMessage;
                if (icon) icon.textContent = '';
            }
        } else {
            if (feedback) feedback.textContent = '';
            if (icon) icon.textContent = '';
        }
    }

    /**
     * Get form data
     */
    getFormData() {
        const data = {};
        this.fields.forEach((field, fieldName) => {
            data[fieldName] = field.input.value;
        });
        return data;
    }

    /**
     * Reset form
     */
    reset() {
        this.form.reset();
        this.fields.forEach((field) => {
            field.isValid = false;
            field.errorMessage = '';
            field.input.classList.remove('is-valid', 'is-invalid');
            
            const wrapper = field.input.closest('.validation-wrapper');
            wrapper?.classList.remove('is-valid', 'is-invalid');
            
            const feedback = wrapper?.querySelector('.validation-feedback');
            const icon = wrapper?.querySelector('.validation-icon');
            if (feedback) feedback.textContent = '';
            if (icon) icon.textContent = '';
        });
    }

    /**
     * Set custom error
     */
    setError(fieldName, message) {
        const field = this.fields.get(fieldName);
        if (!field) return;

        field.isValid = false;
        field.errorMessage = message;
        this.updateFieldUI(fieldName);
    }

    /**
     * Clear error
     */
    clearError(fieldName) {
        const field = this.fields.get(fieldName);
        if (!field) return;

        field.isValid = true;
        field.errorMessage = '';
        this.updateFieldUI(fieldName);
    }
}

/**
 * Quick validation function for single use
 */
export function validateForm(formElement, rules, onSubmit) {
    const validator = new FormValidator(formElement, { onSubmit });
    
    Object.entries(rules).forEach(([fieldName, fieldRules]) => {
        validator.addField(fieldName, fieldRules);
    });

    return validator;
}
