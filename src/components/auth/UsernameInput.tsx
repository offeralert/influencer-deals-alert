
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useUsernameAvailability } from "@/hooks/useUsernameAvailability";

interface UsernameInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  disabled?: boolean;
  id: string;
  className?: string;
  prefix?: string;
}

const UsernameInput: React.FC<UsernameInputProps> = ({
  value,
  onChange,
  label,
  placeholder,
  disabled = false,
  id,
  className = "",
  prefix = "@"
}) => {
  const { isChecking, isAvailable, error } = useUsernameAvailability(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    // Remove @ symbol if user types it
    if (inputValue.startsWith('@')) {
      inputValue = inputValue.substring(1);
    }
    onChange(inputValue);
  };

  const getStatusIcon = () => {
    if (!value || isChecking) {
      return isChecking ? <Loader2 size={16} className="animate-spin text-muted-foreground" /> : null;
    }
    
    if (error) {
      return <XCircle size={16} className="text-destructive" />;
    }
    
    if (isAvailable === true) {
      return <CheckCircle size={16} className="text-green-500" />;
    }
    
    if (isAvailable === false) {
      return <XCircle size={16} className="text-destructive" />;
    }
    
    return null;
  };

  const getStatusMessage = () => {
    if (!value || isChecking) return null;
    
    if (error) return <span className="text-xs text-destructive">{error}</span>;
    
    if (isAvailable === true) {
      return <span className="text-xs text-green-600">Username is available</span>;
    }
    
    if (isAvailable === false) {
      return <span className="text-xs text-destructive">Username is already taken</span>;
    }
    
    return null;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
            {prefix}
          </span>
        )}
        <Input
          id={id}
          name={id}
          placeholder={placeholder}
          required
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={`${prefix ? 'pl-8' : ''} pr-10 ${className}`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {getStatusIcon()}
        </div>
      </div>
      {getStatusMessage()}
    </div>
  );
};

export default UsernameInput;
