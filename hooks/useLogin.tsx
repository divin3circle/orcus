import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { BASE_URL } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface LoginData {
  username: string;
  password: string;
}

interface LoginResponse {
  merchant_id: string;
  token: {
    token: string;
    expiry: string;
  };
}

const loginUser = async (data: LoginData): Promise<LoginResponse> => {
  const response = await axios.post(`${BASE_URL}/login`, data);
  return response.data;
};

export const useLogin = () => {
  const router = useRouter();
  const { login } = useAuth();

  return useMutation<LoginResponse, Error, LoginData>({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Store the auth data (merchant_id and token) using the auth context
      login(data);
      toast.success("Login successful!", {
        description: "Welcome back to Orcus.",
        descriptionClassName: "text-black",
      });
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error("Login failed", {
        description: error.message || "Invalid username or password.",
        descriptionClassName: "text-black",
      });
    },
  });
};
