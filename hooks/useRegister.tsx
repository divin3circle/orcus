import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { BASE_URL } from "@/lib/utils";

interface RegisterData {
  username: string;
  mobile_number: string;
  password: string;
  account_id: string;
  profile_image_url?: string;
  account_banner_image_url?: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
}

const registerUser = async (data: RegisterData): Promise<RegisterResponse> => {
  const response = await axios.post(`${BASE_URL}/register`, data);
  return response.data;
};

export const useRegister = () => {
  const router = useRouter();

  return useMutation<RegisterResponse, Error, RegisterData>({
    mutationFn: registerUser,
    onSuccess: (data) => {
      toast.success("Registration successful!");
      router.push("/login");
    },
    onError: (error) => {
      toast.error("Registration failed", {
        description: error.message || "Please try again later.",
        descriptionClassName: "text-black",
      });
    },
  });
};
