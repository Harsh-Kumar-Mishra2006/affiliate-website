export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class Validators {
  static required(value: any): string | null {
    if (!value || value.toString().trim() === '') {
      return 'This field is required';
    }
    return null;
  }

  static email(value: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return null;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  }

  static phone(value: string): string | null {
    if (!value) return null;
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(value.replace(/[^0-9]/g, ''))) {
      return 'Please enter a valid 10-digit phone number';
    }
    return null;
  }

  static minLength(min: number, message?: string): (value: string) => string | null {
    return (value: string) => {
      if (!value) return null;
      if (value.length < min) {
        return message || `Must be at least ${min} characters`;
      }
      return null;
    };
  }

  static maxLength(max: number, message?: string): (value: string) => string | null {
    return (value: string) => {
      if (!value) return null;
      if (value.length > max) {
        return message || `Must be at most ${max} characters`;
      }
      return null;
    };
  }

  static password(value: string): string | null {
    if (!value) return null;
    if (value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    // Optional: Add more password strength checks
    return null;
  }

  static confirmPassword(password: string, confirmPassword: string): string | null {
    if (!confirmPassword) return null;
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  }

  static username(value: string): string | null {
    if (!value) return null;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(value)) {
      return 'Username must be 3-20 characters and contain only letters, numbers, and underscores';
    }
    return null;
  }

  static price(value: number | string): string | null {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num) || num < 0) {
      return 'Please enter a valid price';
    }
    return null;
  }

  static url(value: string): string | null {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  }
}

export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, ((value: any) => string | null)[]>
): ValidationResult => {
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];
    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        isValid = false;
        break;
      }
    }
  }

  return { isValid, errors };
};

// Common validation rules for different forms
export const authValidators = {
  login: {
    email: [Validators.required, Validators.email],
    password: [Validators.required, Validators.minLength(6)],
  },
  signup: {
    name: [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
    email: [Validators.required, Validators.email],
    username: [Validators.required, Validators.username],
    phone: [Validators.required, Validators.phone],
    password: [Validators.required, Validators.password],
    confirmPassword: [Validators.required],
  },
  profile: {
    name: [Validators.minLength(2), Validators.maxLength(100)],
    phone: [Validators.phone],
  },
  changePassword: {
    currentPassword: [Validators.required],
    newPassword: [Validators.required, Validators.password],
    confirmPassword: [Validators.required],
  },
  forgotPassword: {
    email: [Validators.required, Validators.email],
  },
  resetPassword: {
    newPassword: [Validators.required, Validators.password],
    confirmPassword: [Validators.required],
  },
};