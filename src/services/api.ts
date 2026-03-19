import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/constants";
import {
  getToken,
  logout,
  getRefreshToken,
  setToken,
  setRefreshToken,
} from "@/lib/auth";
import type { ApiResponse } from "@/types/apiresponse";

type ApiErrorShape = {
  message: string | string[];
  error?: string;
  statusCode: number;
};

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response: AxiosResponse) => {
    const responseData = response.data;

    if (
      responseData &&
      typeof responseData === "object" &&
      "code" in responseData
    ) {
      const wrapped = responseData as ApiResponse<unknown>;

      if (wrapped.code >= 400) {
        const msg = wrapped.message || "Có lỗi xảy ra";
        toast.error(msg);

        return Promise.reject({
          message: msg,
          error: "API_ERROR",
          statusCode: wrapped.code,
        } satisfies ApiErrorShape);
      }

      return {
        ...response,
        data: wrapped.data,
        _originalResponse: wrapped,
      };
    }

    return response;
  },
  async (error: AxiosError<unknown>) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    const isLoginRequest = originalRequest?.url?.includes("/auth/login");

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !isLoginRequest
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest && originalRequest.headers) {
              originalRequest.headers.Authorization = "Bearer " + token;
            }
            return api(originalRequest!);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        logout();
        if (
          typeof window !== "undefined" &&
          window.location.pathname !== "/login"
        ) {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = data?.data?.accessToken;
        const newRefreshToken = data?.data?.refreshToken;

        if (newAccessToken) {
          setToken(newAccessToken);

          if (newRefreshToken) {
            setRefreshToken(newRefreshToken);
          }

          api.defaults.headers.common["Authorization"] =
            "Bearer " + newAccessToken;

          if (originalRequest && originalRequest.headers) {
            originalRequest.headers.Authorization = "Bearer " + newAccessToken;
          }

          processQueue(null, newAccessToken);

          return api(originalRequest!);
        } else {
          throw new Error("Refresh failed - No access token returned");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        logout();
        toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
        if (
          typeof window !== "undefined" &&
          window.location.pathname !== "/login"
        ) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Standard error handling
    const statusCode = error.response?.status ?? 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const responseData = error.response?.data as any;

    const rawMsg = responseData?.message;
    const normalizedMsg = Array.isArray(rawMsg)
      ? rawMsg.join(", ")
      : typeof rawMsg === "object" && rawMsg !== null
        ? Object.values(rawMsg).join(", ")
        : (rawMsg ?? error.message ?? "Lỗi kết nối server");

    switch (statusCode) {
      case 400:
        toast.error(`Yêu cầu không hợp lệ: ${normalizedMsg}`);
        break;
      case 401:
        if (isLoginRequest) toast.error("Sai thông tin đăng nhập");
        break;
      case 403:
        toast.error("Bạn không có quyền thực hiện thao tác này");
        break;
      case 404:
        toast.error("Không tìm thấy dữ liệu");
        break;
      case 500:
        toast.error("Lỗi hệ thống, vui lòng thử lại sau");
        break;
      default:
        toast.error(normalizedMsg);
    }

    return Promise.reject({
      message: rawMsg ?? normalizedMsg,
      error: responseData?.error ?? error.name,
      statusCode: responseData?.statusCode ?? (statusCode || 500),
    } satisfies ApiErrorShape);
  },
);

export default api;
