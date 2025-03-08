import {
  RegisterLink,
  LoginLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { Button } from "@/components/ui/button";

export function LoginButton() {
  return (
    <LoginLink>
      <Button>Sign In</Button>
    </LoginLink>
  );
}
