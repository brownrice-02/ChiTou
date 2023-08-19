// useLogin.js
import { useState } from "react";
import { useRouter } from "next/navigation";
import { setCookie } from "nookies";
import Swal from "sweetalert2";
import axiosInstance from "@/utils/axiosInstance";

const useLogin = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const handleLogin = (userData) => {
    setIsLoading(true); // 開始 API 請求時設置 isLoading 為 true
    axiosInstance
      .post("/users/signin", userData)
      .then((response) => {
        if (response.status === 200) {
          console.log("登入成功");
          setCookie(null, "access_token", response.data.data.access_token, {
            maxAge: 30 * 24 * 60 * 60,
            // path: "/",
          });
          setCookie(null, "user_id", response.data.data.user.id, {
            maxAge: 30 * 24 * 60 * 60,
            // path: "/",
          });
          setCookie(null, "name", response.data.data.user.name, {
            maxAge: 30 * 24 * 60 * 60,
            // path: "/",
          });
          router.push("/"); // 進入首頁
        } else {
          console.log("登入失敗");
          setError(response.data.message);
          if (response.status >= 500 && response.status < 600) {
            alert("伺服器出現問題，請稍後再試或通知我們的工程團隊。");
            // Swal.fire({
            //   icon: "error",
            //   title: "登入失敗",
            //   text: response.data.message,
            // });
          }
        }
      })
      .catch((loginError) => {
        setError(loginError.response);
        // console.log(loginError.response);
        if (error.status >= 500 && error.status < 600) {
          Swal.fire({
            icon: "error",
            title: "伺服器出現問題",
            text: "請稍後再試或通知我們的工程團隊。",
          });
        }
        if (error.status >= 400 && error.status < 500) {
          Swal.fire({
            icon: "error",
            title: "登入失敗",
            text: error.data.error,
          });
        }
      })
      .finally(() => {
        setIsLoading(false); // 無論請求成功或失敗，設置 isLoading 為 false
      });
  };

  return { handleLogin, isLoading, error };
};

export default useLogin;
