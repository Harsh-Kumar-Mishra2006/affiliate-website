import React, { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  rightIcon,
  helperText,
  containerClassName = "",
  labelClassName = "",
  inputClassName = "",
  errorClassName = "",
  type = "text",
  disabled = false,
  className = "",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";
  const inputType = isPasswordType && showPassword ? "text" : type;

  const baseInputStyles = `
    w-full px-3 py-2 border rounded-lg shadow-sm
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${icon ? "pl-10" : ""}
    ${isPasswordType ? "pr-10" : ""}
    ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300"}
    ${inputClassName}
    ${className}
  `;

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={props.id || props.name}
          className={`block text-sm font-medium text-gray-700 ${labelClassName}`}
        >
          {label}
          {props.required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {/* Left Icon */}
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className={`text-gray-400 ${error ? "text-red-400" : ""}`}>
              {icon}
            </span>
          </div>
        )}

        {/* Input Field */}
        <input
          type={inputType}
          className={baseInputStyles}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={
            helperText || error ? `${props.id}-helper` : undefined
          }
          {...props}
        />

        {/* Password Toggle */}
        {isPasswordType && (
          <button
            type="button"
            onClick={handleTogglePassword}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        )}

        {/* Right Icon */}
        {rightIcon && !isPasswordType && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className={`text-gray-400 ${error ? "text-red-400" : ""}`}>
              {rightIcon}
            </span>
          </div>
        )}
      </div>

      {/* Helper Text */}
      {helperText && !error && (
        <p className="text-sm text-gray-500" id={`${props.id}-helper`}>
          {helperText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p
          className={`text-sm text-red-600 flex items-center space-x-1 ${errorClassName}`}
          role="alert"
        >
          <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default Input;
