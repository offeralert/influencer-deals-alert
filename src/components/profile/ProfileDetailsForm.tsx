
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileDetailsFormProps {
  fullName: string;
  username: string;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileDetailsForm = ({
  fullName,
  username,
  disabled = false,
  onChange,
}: ProfileDetailsFormProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          value={fullName}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          value={username}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
    </>
  );
};

export default ProfileDetailsForm;
